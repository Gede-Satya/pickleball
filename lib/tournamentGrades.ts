/**
 * lib/tournamentGrades.ts
 * ============================================================
 * Daftar tingkat (grade) turnamen + helper murni (tanpa dependensi
 * server) agar aman diimport dari client component.
 * ============================================================
 */

export const ALL_TOURNAMENT_GRADES = [
  "SD",
  "SMP",
  "SMA",
  "OPEN",
  "U11",
  "U13",
  "U15",
  "U17",
  "U19",
  "U21",
] as const;

// Default untuk turnamen lama yang belum punya setting gradeOptions
export const DEFAULT_TOURNAMENT_GRADES = ["SD", "SMP", "SMA"] as const;

export const GRADE_LABELS: Record<string, string> = {
  SD: "SD",
  SMP: "SMP",
  SMA: "SMA",
  OPEN: "Open (Umum)",
  U11: "U-11",
  U13: "U-13",
  U15: "U-15",
  U17: "U-17",
  U19: "U-19",
  U21: "U-21",
};

/**
 * Label ramah pengguna untuk satu grade.
 * Grade bebas/custom didukung: "U12" → "U-12", "U8" → "U-8".
 */
export function gradeToLabel(grade: string): string {
  if (GRADE_LABELS[grade]) return GRADE_LABELS[grade];
  const match = grade.match(/^U(\d+)$/i);
  if (match) return `U-${match[1]}`;
  const matchOpen = grade.match(/^OPEN\s*U(\d+)$/i);
  if (matchOpen) return `Open U-${matchOpen[1]}`;
  return grade;
}

/**
 * Normalisasi input grade admin agar konsisten:
 * "u 19", "U19", "Open U-19" → "U19"
 */
export function normalizeGradeInput(value: string): string {
  let v = value.trim().toUpperCase();
  v = v.replace(/^OPEN[\s-]+/, "");
  if (/^U[\s-]?(\d+)$/.test(v)) {
    v = `U${v.replace(/^U[\s-]?/, "")}`;
  }
  return v;
}

/**
 * Parsing nilai form "grades":
 * - Bisa berupa beberapa entri checkbox biasa (form lama)
 * - Bisa berupa satu entri JSON array (GradePicker)
 * Hasil dinormalisasi, di-dedupe, dan entri kosong dibuang.
 */
export function parseGradeOptionsPayload(raw: string[]): string[] {
  const values: string[] = [];
  for (const entry of raw) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          values.push(...parsed.filter((x): x is string => typeof x === "string"));
        } else {
          values.push(trimmed);
        }
      } catch {
        values.push(trimmed);
      }
    } else {
      values.push(trimmed);
    }
  }
  return [...new Set(values.map(normalizeGradeInput).filter(Boolean))];
}

/**
 * Membaca gradeOptions turnamen (JSON array string).
 * null / tidak valid → default (SD, SMP, SMA) agar perilaku lama tetap sama.
 */
export function parseTournamentGrades(
  gradeOptions: string | null | undefined
): string[] {
  if (!gradeOptions) return [...DEFAULT_TOURNAMENT_GRADES];
  try {
    const parsed = JSON.parse(gradeOptions);
    if (Array.isArray(parsed)) {
      return parsed.map(String).filter((g) => g.length > 0);
    }
  } catch {
    // abaikan, fallback ke default
  }
  return [...DEFAULT_TOURNAMENT_GRADES];
}