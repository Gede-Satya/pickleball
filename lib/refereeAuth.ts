// ============================================================
// Server-only: verifikasi akses wasit terhadap sebuah turnamen.
// Dipakai oleh route login (/api/wasit/login) DAN oleh route
// update skor agar wasit selalu divalidasi ulang (refereeCode +
// tournamentId) sebelum menyimpan skor.
//
// PENTING: modul ini mengimpor prisma, JANGAN diimpor dari
// komponen client.
// ============================================================

import { prisma } from "@/lib/prisma";
import { SignJWT, jwtVerify } from "jose";

// Durasi token wasit (24 jam). Cukup untuk satu hari pertandingan;
// token bisa diperoleh ulang kapan saja via halaman login.
const WASIT_TOKEN_TTL_SECONDS = 24 * 60 * 60;

// Ambil secret JWT untuk token wasit. Gunakan NEXTAUTH_SECRET yang sudah ada
// agar tidak perlu menambah env baru.
function getWasitJwtSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET tidak terkonfigurasi (dibutuhkan untuk token wasit).");
  }
  return new TextEncoder().encode(secret);
}

export interface WasitPayload {
  refereeName: string;
  refereeCode: string;
  tournamentId: number;
}

// Tandatangani JWT wasit (dipanggil server saat login berhasil).
export async function signWasitToken(payload: WasitPayload): Promise<string> {
  return new SignJWT({
    refereeName: payload.refereeName,
    refereeCode: payload.refereeCode,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.tournamentId))
    .setIssuedAt()
    .setExpirationTime(`${WASIT_TOKEN_TTL_SECONDS}s`)
    .sign(getWasitJwtSecret());
}

// Verifikasi JWT wasit (dipanggil server di setiap route update skor).
// Mengembalikan payload terverifikasi atau null jika tidak valid/kedaluwarsa.
export async function verifyWasitToken(token: string): Promise<WasitPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getWasitJwtSecret());
    const name = typeof payload.refereeName === "string" ? payload.refereeName : "";
    const code = typeof payload.refereeCode === "string" ? payload.refereeCode : "";
    const tid = Number(payload.sub);
    if (!name || !code || !Number.isFinite(tid)) return null;
    return { refereeName: name, refereeCode: code, tournamentId: tid };
  } catch {
    return null;
  }
}

export interface RefereeAccessOk {
  ok: true;
  tournament: {
    id: number;
    name: string;
    status: string;
  };
}

export interface RefereeAccessFail {
  ok: false;
  message: string;
  status?: number;
}

export type RefereeAccessResult = RefereeAccessOk | RefereeAccessFail;

// Tipe hasil verifikasi token JWT wasit — menyertakan payload terverifikasi.
export interface RefereeTokenOk extends RefereeAccessOk {
  refereeName: string;
  refereeCode: string;
}

export type RefereeTokenResult = RefereeTokenOk | RefereeAccessFail;

// Ekstrak token Bearer dari header Authorization.
export function extractBearerToken(req: Request): string {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

// Verifikasi token JWT wasit + pastikan kode di dalamnya masih valid & aktif
// terhadap turnamen bersangkutan. Mengembalikan refereeName otoritatif
// (dari token, BUKAN dari input client).
export async function verifyRefereeToken(
  req: Request,
  tournamentId: number
): Promise<RefereeTokenResult> {
  const token = extractBearerToken(req);
  if (!token) {
    return {
      ok: false,
      message: "Sesi wasit tidak valid. Silakan login ulang.",
      status: 401,
    };
  }

  const payload = await verifyWasitToken(token);
  if (!payload) {
    return {
      ok: false,
      message: "Sesi wasit tidak valid / kedaluwarsa. Silakan login ulang.",
      status: 401,
    };
  }

  if (payload.tournamentId !== tournamentId) {
    return {
      ok: false,
      message: "Sesi wasit tidak cocok dengan turnamen ini.",
      status: 403,
    };
  }

  // Validasi ulang kode akses terhadap DB (masih aktif? turnamen masih hidup?)
  const access = await verifyRefereeAccess(payload.refereeCode, tournamentId);
  if (!access.ok) return access;

  return {
    ok: true,
    tournament: access.tournament,
    refereeName: payload.refereeName,
    refereeCode: payload.refereeCode,
  };
}

// Verifikasi bahwa sebuah kode akses milik turnamen tertentu dan sedang aktif.
export async function verifyRefereeAccess(
  refereeCode: string,
  tournamentId: number
): Promise<RefereeAccessResult> {
  if (!refereeCode || !tournamentId) {
    return {
      ok: false,
      message: "Sesi wasit tidak valid. Silakan login ulang.",
      status: 401,
    };
  }

  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      refereeCode: refereeCode.trim(),
      deletedAt: null,
    },
    select: { id: true, name: true, status: true, isCodeActive: true },
  });

  if (!tournament) {
    return {
      ok: false,
      message: "Kode akses tidak valid untuk turnamen ini.",
      status: 403,
    };
  }

  if (!tournament.isCodeActive) {
    return {
      ok: false,
      message: "Kode akses wasit untuk turnamen ini sudah dinonaktifkan.",
      status: 403,
    };
  }

  return { ok: true, tournament };
}