// ============================================================
// SESSION WASIT — utils untuk membaca/menyimpan sesi login wasit
// di localStorage. Dipakai oleh halaman login (app/wasit) dan
// portal wasit (app/wasit/portal).
//
// SEJAK PERBAIKAN KEAMANAN:
// Client TIDAK lagi menyimpan kode akses (refereeCode) plaintext.
// Yang disimpan HANYA token JWT yang ditandatangani server saat
// login. Info tampilan (nama, id turnamen) di-decode client-side
// dari token — tetapi validitas & nama otoritatif selalu
// diverifikasi server-side pada setiap route update skor.
// ============================================================

export const WASIT_SESSION_KEY = "wasit-token";

export interface RefereeSession {
  token: string;
  refereeName: string;
  tournamentId: string;
}

// Decode payload JWT tanpa verifikasi (cukup untuk membaca info tampilan).
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Simpan token sesi wasit ke localStorage
export function saveRefereeSession({ token }: { token: string }): void {
  localStorage.setItem(WASIT_SESSION_KEY, token);
}

// Baca sesi wasit dari localStorage — ambil nama & id dari payload JWT.
export function getRefereeSession(): RefereeSession | null {
  try {
    const token = localStorage.getItem(WASIT_SESSION_KEY);
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    const name = typeof payload?.refereeName === "string" ? payload.refereeName : "";
    const sub = payload?.sub;
    const tid = typeof sub === "string" ? sub : "";
    if (!name || !tid) return null;

    return { token, refereeName: name, tournamentId: tid };
  } catch {
    return null;
  }
}

// Hapus sesi wasit (logout / ganti wasit)
export function clearRefereeSession(): void {
  localStorage.removeItem(WASIT_SESSION_KEY);
}
