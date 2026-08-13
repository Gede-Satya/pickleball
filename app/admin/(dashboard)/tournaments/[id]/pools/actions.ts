'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Gender, MatchType } from '@prisma/client';
import {
  getCategoryLabel,
  generatePoolMatches,
  indexToPoolCode,
} from '@/lib/tournamentCategory';

export type ActionResult = { success: boolean; error?: string };

function parseCategoryKey(key: string): {
  grade: string;
  gender: Gender | null;
  matchType: MatchType;
} {
  const parts = key.split('_');
  const grade = parts[0] ?? '';
  const matchType: MatchType =
    parts[2] === 'SINGLE' || parts[2] === 'DOUBLE' ? parts[2] : 'MIXED';
  const gender: Gender | null =
    parts[1] === 'MALE' || parts[1] === 'FEMALE' ? parts[1] : null;
  return { grade, gender, matchType };
}

function revalidatePools(tournamentId: number) {
  revalidatePath(`/admin/tournaments/${tournamentId}/pools`);
}

// ----------------------------------------------------------------
// Buat pool baru untuk satu kategori (label otomatis: "Pool A ...")
// ----------------------------------------------------------------
export async function createPoolAction(
  tournamentId: number,
  categoryKey: string
): Promise<ActionResult> {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });
    if (!tournament) return { success: false, error: 'Turnamen tidak ditemukan' };

    const parts = parseCategoryKey(categoryKey);
    const poolCount = await prisma.pool.count({
      where: { tournamentId, categoryKey },
    });
    const poolCode = indexToPoolCode(poolCount);

    await prisma.pool.create({
      data: {
        label: `Pool ${poolCode} ${getCategoryLabel(parts.grade, parts.gender, parts.matchType)}`,
        poolCode,
        categoryKey,
        grade: parts.grade,
        gender: parts.gender ?? undefined,
        matchType: parts.matchType,
        maxSize: tournament.poolSize,
        status: 'OPEN',
        tournamentId,
      },
    });

    revalidatePools(tournamentId);
    return { success: true };
  } catch (error) {
    console.error('createPoolAction error:', error);
    return { success: false, error: 'Gagal membuat pool' };
  }
}

// ----------------------------------------------------------------
// Masukkan peserta (player SINGLE / team) ke pool tertentu
// ----------------------------------------------------------------
export async function assignMemberAction(
  tournamentId: number,
  categoryKey: string,
  memberType: 'PLAYER' | 'TEAM',
  memberId: number,
  poolId: number
): Promise<ActionResult> {
  try {
    const pool = await prisma.pool.findFirst({
      where: { id: poolId, tournamentId, categoryKey },
      include: { _count: { select: { members: true } } },
    });
    if (!pool) return { success: false, error: 'Pool tidak ditemukan' };

    // Cek kapasitas pool (FULL / maxSize) SEBELUM cek duplikat
    if (pool._count.members >= pool.maxSize) {
      return {
        success: false,
        error: `Pool ${pool.label} sudah penuh (maks ${pool.maxSize} peserta). Buat pool baru dulu.`,
      };
    }

    // Cek duplikat HANYA dalam turnamen ini (join pool), bukan global
    const existing = await prisma.poolMember.findFirst({
      where: {
        ...(memberType === 'PLAYER'
          ? { playerId: memberId }
          : { teamId: memberId }),
        pool: { tournamentId },
      },
    });
    if (existing) {
      return {
        success: false,
        error: 'Peserta ini sudah berada di dalam pool pada turnamen ini',
      };
    }

    let memberName = '';
    if (memberType === 'PLAYER') {
      const player = await prisma.player.findUnique({ where: { id: memberId } });
      if (!player) return { success: false, error: 'Pemain tidak ditemukan' };
      memberName = player.fullName;
    } else {
      const team = await prisma.team.findUnique({ where: { id: memberId } });
      if (!team) return { success: false, error: 'Tim tidak ditemukan' };
      memberName = team.name;
    }

    await prisma.poolMember.create({
      data: {
        poolId,
        memberName,
        playerId: memberType === 'PLAYER' ? memberId : undefined,
        teamId: memberType === 'TEAM' ? memberId : undefined,
      },
    });

    revalidatePools(tournamentId);
    return { success: true };
  } catch (error) {
    console.error('assignMemberAction error:', error);
    return { success: false, error: 'Gagal memasukkan peserta ke pool' };
  }
}

// ----------------------------------------------------------------
// Pindahkan anggota pool ke pool lain
// ----------------------------------------------------------------
export async function moveMemberAction(
  poolMemberId: number,
  newPoolId: number
): Promise<ActionResult> {
  try {
    const target = await prisma.pool.findUnique({ where: { id: newPoolId } });
    if (!target) return { success: false, error: 'Pool tujuan tidak ditemukan' };

    await prisma.poolMember.update({
      where: { id: poolMemberId },
      data: { poolId: newPoolId },
    });

    revalidatePools(target.tournamentId);
    return { success: true };
  } catch (error) {
    console.error('moveMemberAction error:', error);
    return { success: false, error: 'Gagal memindahkan anggota' };
  }
}

// ----------------------------------------------------------------
// Keluarkan anggota dari pool (match yang menyangkutnya dihapus)
// ----------------------------------------------------------------
export async function removeMemberAction(
  poolMemberId: number
): Promise<ActionResult> {
  try {
    const member = await prisma.poolMember.findUnique({
      where: { id: poolMemberId },
    });
    if (!member) return { success: false, error: 'Anggota tidak ditemukan' };

    await prisma.$transaction(async (tx) => {
      await tx.poolMatch.deleteMany({
        where: {
          OR: [{ member1Id: poolMemberId }, { member2Id: poolMemberId }],
        },
      });
      await tx.poolMember.delete({ where: { id: poolMemberId } });
    });

    const pool = await prisma.pool.findUnique({ where: { id: member.poolId } });
    if (pool) revalidatePools(pool.tournamentId);
    return { success: true };
  } catch (error) {
    console.error('removeMemberAction error:', error);
    return { success: false, error: 'Gagal mengeluarkan anggota dari pool' };
  }
}

// ----------------------------------------------------------------
// Reset semua pool pada satu kategori (members + matches ikut terhapus)
// ----------------------------------------------------------------
export async function resetCategoryAction(
  tournamentId: number,
  categoryKey: string
): Promise<ActionResult> {
  try {
    await prisma.pool.deleteMany({ where: { tournamentId, categoryKey } });
    revalidatePools(tournamentId);
    return { success: true };
  } catch (error) {
    console.error('resetCategoryAction error:', error);
    return { success: false, error: 'Gagal reset pool kategori' };
  }
}

// ----------------------------------------------------------------
// Generate pertandingan round-robin untuk semua pool pada kategori
// ----------------------------------------------------------------
export async function generateMatchesAction(
  tournamentId: number,
  categoryKey: string
): Promise<ActionResult> {
  try {
    const pools = await prisma.pool.findMany({
      where: { tournamentId, categoryKey },
      include: { _count: { select: { members: true } } },
    });

    if (pools.length === 0) {
      return { success: false, error: 'Belum ada pool untuk kategori ini' };
    }

    const skipped: string[] = [];
    for (const pool of pools) {
      if (pool._count.members < 2) {
        skipped.push(pool.poolCode);
        continue;
      }
      await generatePoolMatches(prisma, pool.id);
      await prisma.pool.update({
        where: { id: pool.id },
        data: {
          status:
            pool._count.members >= pool.maxSize ? 'FULL' : 'OPEN',
        },
      });
    }

    revalidatePools(tournamentId);
    if (skipped.length === pools.length) {
      return {
        success: false,
        error: `Tidak ada pertandingan yang digenerate: semua pool (${skipped.join(', ')}) kurang dari 2 peserta.`,
      };
    }
    return {
      success: true,
      error:
        skipped.length > 0
          ? `Pool ${skipped.join(', ')} dilewati (kurang dari 2 peserta).`
          : undefined,
    };
  } catch (error) {
    console.error('generateMatchesAction error:', error);
    return { success: false, error: 'Gagal generate pertandingan pool' };
  }
}