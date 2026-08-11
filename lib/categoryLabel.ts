/**
 * lib/categoryLabel.ts
 * ============================================================
 * Helper murni (tanpa dependensi server) untuk mengubah
 * canonical category key menjadi label ramah pengguna.
 * Aman diimport dari client component.
 * ============================================================
 */

const GRADES = ["SD", "SMP", "SMA"] as const;
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
 * Mengubah canonical category key menjadi label ramah pengguna.
 *
 * Mendukung format:
 *   "SMA_MALE_SINGLE"    → "SMA Putra Single"
 *   "SMP_FEMALE_DOUBLE"  → "SMP Putri Double"
 *   "SMA_MIXED"          → "SMA Mixed"
 *
 * Key yang tidak dikenali dikembalikan apa adanya.
 */
export function categoryKeyToLabel(key: string): string {
  const parts = key.split("_");

  if (parts.length === 3) {
    const [grade, gender, matchType] = parts;
    if (
      (GRADES as readonly string[]).includes(grade) &&
      (GENDERS as readonly string[]).includes(gender) &&
      (MATCH_TYPES as readonly string[]).includes(matchType)
    ) {
      return `${grade} ${GENDER_LABEL[gender as (typeof GENDERS)[number]]} ${
        MATCH_LABEL[matchType as (typeof MATCH_TYPES)[number]]
      }`;
    }
  }

  if (parts.length === 2 && parts[1] === "MIXED") {
    const [grade] = parts;
    if ((GRADES as readonly string[]).includes(grade)) {
      return `${grade} ${MATCH_LABEL.MIXED}`;
    }
  }

  return key;
}
