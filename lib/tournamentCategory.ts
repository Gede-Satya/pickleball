/**
 * lib/tournamentCategory.ts
 * ============================================================
 * Core logic untuk sistem kategori dan auto-grouping turnamen
 * pickleball berdasarkan: Grade + Gender + MatchType
 * ============================================================
 */

import { PrismaClient, Grade, Gender, MatchType, PoolStatus } from "@prisma/client";

// ----------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------

export interface CategoryInfo {
  key: string;       // Canonical key: "SMA_MALE_SINGLE"
  label: string;     // Label tampilan: "Pool SMA Putra Single"
  grade: Grade;
  gender: Gender | null;
  matchType: MatchType;
}

// ----------------------------------------------------------------
// HELPER: CATEGORY KEY & LABEL
// ----------------------------------------------------------------

/**
 * Menghasilkan canonical category key dari kombinasi grade+gender+matchType.
 * MIXED tidak menyertakan gender karena by definition campuran.
 *
 * Contoh:
 *   getCategoryKey("SMA", "MALE", "SINGLE")  → "SMA_MALE_SINGLE"
 *   getCategoryKey("SMP", "FEMALE", "DOUBLE") → "SMP_FEMALE_DOUBLE"
 *   getCategoryKey("SMA", null, "MIXED")      → "SMA_MIXED"
 */
export function getCategoryKey(
  grade: Grade,
  gender: Gender | null,
  matchType: MatchType
): string {
  if (matchType === "MIXED") {
    return `${grade}_MIXED`;
  }
  if (!gender) {
    throw new Error("Gender wajib diisi untuk kategori SINGLE atau DOUBLE");
  }
  return `${grade}_${gender}_${matchType}`;
}

/**
 * Menghasilkan label tampilan yang ramah pengguna.
 *
 * Contoh:
 *   "SMA_MALE_SINGLE"    → "SMA Putra Single"
 *   "SMP_FEMALE_DOUBLE"  → "SMP Putri Double"
 *   "SMA_MIXED"          → "SMA Mixed"
 */
export function getCategoryLabel(
  grade: Grade,
  gender: Gender | null,
  matchType: MatchType
): string {
  const genderLabel =
    gender === "MALE" ? "Putra" : gender === "FEMALE" ? "Putri" : null;
  const matchLabel =
    matchType === "SINGLE"
      ? "Single"
      : matchType === "DOUBLE"
      ? "Double"
      : "Mixed";

  if (matchType === "MIXED") {
    return `${grade} Mixed`;
  }
  return `${grade} ${genderLabel} ${matchLabel}`;
}

/**
 * Menghasilkan CategoryInfo lengkap dari parts.
 */
export function buildCategoryInfo(
  grade: Grade,
  gender: Gender | null,
  matchType: MatchType
): CategoryInfo {
  return {
    key: getCategoryKey(grade, gender, matchType),
    label: getCategoryLabel(grade, gender, matchType),
    grade,
    gender,
    matchType,
  };
}

// ----------------------------------------------------------------
// HELPER: POOL CODE (A, B, C, ...)
// ----------------------------------------------------------------

/** Mengkonversi angka ke huruf pool: 0=A, 1=B, 2=C, dst. */
export function indexToPoolCode(index: number): string {
  if (index < 26) return String.fromCharCode(65 + index);
  // Untuk lebih dari 26: AA, AB, dst.
  return (
    String.fromCharCode(65 + Math.floor(index / 26) - 1) +
    String.fromCharCode(65 + (index % 26))
  );
}

// ----------------------------------------------------------------
// VALIDATION: GENDER RULES
// ----------------------------------------------------------------

/**
 * Validasi bahwa gender pemain sesuai aturan matchType.
 *
 * - SINGLE / DOUBLE: semua pemain harus gender SAMA
 * - MIXED: harus ada tepat 1 MALE dan 1 FEMALE
 */
export function validateGenderForMatchType(
  matchType: MatchType,
  genders: Gender[]
): { valid: boolean; message?: string } {
  if (matchType === "SINGLE") {
    if (genders.length !== 1) {
      return { valid: false, message: "SINGLE hanya boleh 1 pemain" };
    }
    return { valid: true };
  }

  if (matchType === "DOUBLE") {
    if (genders.length !== 2) {
      return { valid: false, message: "DOUBLE membutuhkan tepat 2 pemain" };
    }
    if (genders[0] !== genders[1]) {
      return {
        valid: false,
        message: "DOUBLE hanya boleh pemain dengan gender yang SAMA",
      };
    }
    return { valid: true };
  }

  if (matchType === "MIXED") {
    if (genders.length !== 2) {
      return { valid: false, message: "MIXED membutuhkan tepat 2 pemain" };
    }
    const hasMALE = genders.includes("MALE");
    const hasFEMALE = genders.includes("FEMALE");
    if (!hasMALE || !hasFEMALE) {
      return {
        valid: false,
        message: "MIXED harus terdiri dari 1 pemain MALE dan 1 pemain FEMALE",
      };
    }
    return { valid: true };
  }

  return { valid: false, message: "MatchType tidak dikenali" };
}

// ----------------------------------------------------------------
// AUTO ASSIGN: Daftarkan Member ke Pool yang Sesuai
// ----------------------------------------------------------------

/**
 * Otomatis daftarkan member (player/team) ke pool yang sesuai.
 *
 * Alur:
 * 1. Cari pool OPEN dengan categoryKey yang sama dalam turnamen
 * 2. Jika ada dan belum penuh → daftarkan
 * 3. Jika pool penuh setelah pendaftaran → ubah status ke FULL
 * 4. Jika tidak ada pool OPEN → buat pool baru (A, B, C...)
 *
 * @returns Pool yang digunakan (baru atau existing)
 */
export async function autoAssignToPool(
  prisma: PrismaClient,
  tournamentId: number,
  categoryInfo: CategoryInfo,
  memberName: string,
  maxSize: number,
  options?: {
    playerId?: number;
    teamId?: number;
  }
): Promise<{ pool: any; member: any; isNewPool: boolean }> {
  // 1. Cari pool OPEN yang masih tersedia dalam kategori ini
  const existingOpenPool = await prisma.pool.findFirst({
    where: {
      tournamentId,
      categoryKey: categoryInfo.key,
      status: "OPEN",
    },
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { id: "asc" },
  });

  let targetPool: any;
  let isNewPool = false;

  if (existingOpenPool && existingOpenPool._count.members < maxSize) {
    // Pool masih tersedia
    targetPool = existingOpenPool;
  } else {
    // Buat pool baru: hitung berapa pool yang sudah ada untuk kategori ini
    const poolCount = await prisma.pool.count({
      where: { tournamentId, categoryKey: categoryInfo.key },
    });
    const newPoolCode = indexToPoolCode(poolCount);
    const newPoolLabel = `Pool ${newPoolCode} ${categoryInfo.label}`;

    targetPool = await prisma.pool.create({
      data: {
        label: newPoolLabel,
        poolCode: newPoolCode,
        categoryKey: categoryInfo.key,
        grade: categoryInfo.grade,
        gender: categoryInfo.gender ?? undefined,
        matchType: categoryInfo.matchType,
        maxSize,
        status: "OPEN",
        tournamentId,
      },
    });
    isNewPool = true;
  }

  // 2. Daftarkan member ke pool
  const member = await prisma.poolMember.create({
    data: {
      poolId: targetPool.id,
      memberName,
      playerId: options?.playerId ?? undefined,
      teamId: options?.teamId ?? undefined,
    },
  });

  // 3. Cek apakah pool sudah penuh setelah penambahan ini
  const currentCount = await prisma.poolMember.count({
    where: { poolId: targetPool.id },
  });

  if (currentCount >= maxSize) {
    await prisma.pool.update({
      where: { id: targetPool.id },
      data: { status: "FULL" },
    });
  }

  return { pool: targetPool, member, isNewPool };
}

// ----------------------------------------------------------------
// GENERATE: Round-Robin Pool Matches
// ----------------------------------------------------------------

/**
 * Generate semua pertandingan round-robin untuk pool tertentu.
 * Setiap member bermain melawan semua member lain tepat sekali.
 *
 * Rumus: n*(n-1)/2 pertandingan untuk n member.
 *
 * @returns Array match yang dibuat
 */
export async function generatePoolMatches(
  prisma: PrismaClient,
  poolId: number
): Promise<any[]> {
  // Hapus match lama jika ada
  await prisma.poolMatch.deleteMany({ where: { poolId } });

  const members = await prisma.poolMember.findMany({
    where: { poolId },
    orderBy: { id: "asc" },
  });

  if (members.length < 2) {
    throw new Error(
      "Pool harus memiliki minimal 2 member untuk generate matches"
    );
  }

  const matches: any[] = [];
  let matchOrder = 0;

  // Round-robin: setiap pasang (i, j) di mana i < j
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const match = await prisma.poolMatch.create({
        data: {
          poolId,
          member1Id: members[i].id,
          member2Id: members[j].id,
          status: "SCHEDULED",
          matchOrder: matchOrder++,
        },
      });
      matches.push(match);
    }
  }

  return matches;
}

// ----------------------------------------------------------------
// RECALCULATE: Statistik & Ranking Member dalam Pool
// ----------------------------------------------------------------

/**
 * Hitung ulang statistik (wins, losses, pointDiff, dll.) dan
 * ranking semua member berdasarkan hasil match yang sudah DONE.
 */
export async function recalculatePoolStandings(
  prisma: PrismaClient,
  poolId: number
): Promise<void> {
  const members = await prisma.poolMember.findMany({
    where: { poolId },
  });

  // Reset semua statistik
  const stats: Record<
    number,
    {
      played: number;
      wins: number;
      losses: number;
      pointsFor: number;
      pointsAgainst: number;
      pointDiff: number;
    }
  > = {};

  for (const m of members) {
    stats[m.id] = {
      played: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
    };
  }

  // Ambil semua match DONE
  const doneMatches = await prisma.poolMatch.findMany({
    where: { poolId, status: "DONE" },
  });

  for (const match of doneMatches) {
    if (match.score1 === null || match.score2 === null) continue;

    const s1 = stats[match.member1Id];
    const s2 = stats[match.member2Id];
    if (!s1 || !s2) continue;

    s1.played++;
    s2.played++;
    s1.pointsFor += match.score1;
    s1.pointsAgainst += match.score2;
    s2.pointsFor += match.score2;
    s2.pointsAgainst += match.score1;

    if (match.winnerId === match.member1Id) {
      s1.wins++;
      s2.losses++;
    } else if (match.winnerId === match.member2Id) {
      s2.wins++;
      s1.losses++;
    }
  }

  // Hitung pointDiff
  for (const id of Object.keys(stats).map(Number)) {
    stats[id].pointDiff = stats[id].pointsFor - stats[id].pointsAgainst;
  }

  // Urutkan untuk assign rank
  const sorted = [...members].sort((a, b) => {
    const sa = stats[a.id];
    const sb = stats[b.id];
    if (sb.wins !== sa.wins) return sb.wins - sa.wins;
    if (sb.pointDiff !== sa.pointDiff) return sb.pointDiff - sa.pointDiff;
    return sb.pointsFor - sa.pointsFor;
  });

  // Update semua member ke DB
  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i];
    await prisma.poolMember.update({
      where: { id: m.id },
      data: {
        ...stats[m.id],
        rank: i + 1,
      },
    });
  }

  // Cek apakah semua match sudah DONE untuk ubah status pool → COMPLETED
  const totalMatches = await prisma.poolMatch.count({ where: { poolId } });
  const doneCount = await prisma.poolMatch.count({
    where: { poolId, status: "DONE" },
  });

  if (totalMatches > 0 && totalMatches === doneCount) {
    await prisma.pool.update({
      where: { id: poolId },
      data: { status: "COMPLETED" },
    });
  }
}
