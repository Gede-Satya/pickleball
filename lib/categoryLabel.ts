/**
 * lib/categoryLabel.ts
 * ============================================================
 * Helper murni (tanpa dependensi server) untuk mengubah
 * canonical category key menjadi label ramah pengguna.
 * Aman diimport dari client component.
 * ============================================================
 */

import { gradeToLabel } from "./tournamentGrades";

const GENDERS = ["MALE", "FEMALE"] as const;
const MATCH_TYPES = ["SINGLE", "DOUBLE", "MIXED"] as const;

const GENDER_LABEL: Record<(typeof GENDERS)[number], string> = {
  MALE: "Putra",
  FEMALE: "Putri",
};

const MATCH_LABEL: Record<(typeof MATCH_TYPES)[number], string> = {
  SINGLE: "Single",
  DOUBLE: "Double",
  MIXED: "Mixed",
};

/**
 * Membuat canonical category key untuk seorang pemain.
 * Aman diimport dari client component (tanpa dependensi server).
 *
 * Contoh:
 *   buildPlayerCategoryKey("SMA", "MALE", "SINGLE") → "SMA_MALE_SINGLE"
 *   buildPlayerCategoryKey("SMP", "FEMALE", "DOUBLE") → "SMP_FEMALE_DOUBLE"
 *   buildPlayerCategoryKey("SMA", null, "MIXED") → "SMA_MIXED"
 */
export function buildPlayerCategoryKey(
  grade: string,
  gender: "MALE" | "FEMALE" | null,
  matchType: "SINGLE" | "DOUBLE" | "MIXED"
): string {
  if (matchType === "MIXED") {
    return `${grade}_MIXED`;
  }
  return `${grade}_${gender}_${matchType}`;
}

/**
 * Mengubah canonical category key menjadi label ramah pengguna.
 *
 * Grade bebas (tidak harus enum): "U12_MALE_SINGLE" → "U-12 Putra Single"
 *
 * Mendukung format:
 *   "SMA_MALE_SINGLE"    → "SMA Putra Single"
 *   "SMP_FEMALE_DOUBLE"  → "SMP Putri Double"
 *   "SMA_MIXED"          → "SMA Mixed"
 *   "OPEN_MALE_SINGLE"   → "Open (Umum) Putra Single"
 *   "U19_MIXED"          → "U-19 Mixed"
 *
 * Key yang tidak dikenali dikembalikan apa adanya.
 */
export function categoryKeyToLabel(key: string): string {
  const parts = key.split("_");

  if (parts.length === 3) {
    const [grade, gender, matchType] = parts;
    if (
      (GENDERS as readonly string[]).includes(gender) &&
      (MATCH_TYPES as readonly string[]).includes(matchType)
    ) {
      return `${gradeToLabel(grade)} ${GENDER_LABEL[gender as (typeof GENDERS)[number]]} ${
        MATCH_LABEL[matchType as (typeof MATCH_TYPES)[number]]
      }`;
    }
  }

  if (parts.length === 2 && parts[1] === "MIXED") {
    return `${gradeToLabel(parts[0])} ${MATCH_LABEL.MIXED}`;
  }

  return key;
}
