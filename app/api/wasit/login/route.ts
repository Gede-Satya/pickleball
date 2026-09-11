// /api/wasit/login
// ============================================================
// Login wasit berbasis KODE AKSES (bukan NextAuth).
// - Nama wasit + Kode Akses (1 kode per turnamen).
// - Kode diverifikasi ke database: harus ada, aktif, dan
//   turnamennya masih ONGOING / UPCOMING.
// - Client menyimpan { refereeName, refereeCode, tournamentId, loginAt }
//   di localStorage. Route update skor nanti mewajibkan
//   refereeCode + tournamentId yang valid lagi.
// ============================================================

import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { signWasitToken } from "@/lib/refereeAuth";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

// Batasi percobaan login wasit per IP: 10 percobaan dalam 5 menit.
const WASIT_LOGIN_MAX = 10;
const WASIT_LOGIN_WINDOW_MS = 5 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const ipKey = `wasit-login:${getClientIp(req)}`;
    if (isRateLimited(ipKey, WASIT_LOGIN_MAX, WASIT_LOGIN_WINDOW_MS)) {
      return errorResponse(
        "Terlalu banyak percobaan login. Coba lagi dalam 5 menit.",
        429,
        "RATE_LIMITED"
      );
    }

    const body = await req.json();
    const refereeName = typeof body?.refereeName === "string" ? body.refereeName.trim() : "";
    const refereeCode = typeof body?.refereeCode === "string" ? body.refereeCode.trim() : "";

    // ---- Validasi input (server) ----
    if (!refereeName) {
      return errorResponse("Nama wasit wajib diisi.", 400, "VALIDATION_ERROR");
    }
    if (refereeName.length > 100) {
      return errorResponse("Nama wasit terlalu panjang (maks. 100 karakter).", 400, "VALIDATION_ERROR");
    }
    if (!refereeCode) {
      return errorResponse("Kode akses wajib diisi.", 400, "VALIDATION_ERROR");
    }

    // ---- Cari turnamen dengan kode ini ----
    const tournament = await prisma.tournament.findFirst({
      where: { refereeCode, deletedAt: null },
      select: {
        id: true,
        name: true,
        status: true,
        isCodeActive: true,
      },
    });

    if (!tournament) {
      return errorResponse(
        "Kode akses tidak valid. Periksa kembali kode yang diberikan panitia.",
        404,
        "INVALID_CODE"
      );
    }

    if (!tournament.isCodeActive) {
      return errorResponse(
        "Kode akses wasit untuk turnamen ini sudah dinonaktifkan. Hubungi panitia.",
        403,
        "CODE_INACTIVE"
      );
    }

    if (tournament.status !== "ONGOING" && tournament.status !== "UPCOMING") {
      return errorResponse(
        "Turnamen untuk kode ini belum bisa diakses wasit.",
        403,
        "TOURNAMENT_NOT_ACTIVE"
      );
    }

    // ---- Berhasil ----
    // Tandatangani token JWT (berisi nama + kode + id turnamen).
    // Client hanya menyimpan token ini; kode akses TIDAK lagi dikirim ke client.
    const token = await signWasitToken({
      refereeName,
      refereeCode,
      tournamentId: tournament.id,
    });

    return successResponse("Login berhasil. Selamat bertugas!", {
      token,
      refereeName,
      tournamentId: String(tournament.id),
      tournamentName: tournament.name,
      tournamentStatus: tournament.status,
    });
  } catch (error) {
    console.error("[wasit/login]", error);
    return errorResponse("Terjadi kesalahan pada server. Coba lagi.", 500, "INTERNAL_SERVER_ERROR");
  }
}