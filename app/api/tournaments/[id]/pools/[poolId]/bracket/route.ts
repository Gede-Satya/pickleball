/**
 * /api/tournaments/[id]/pools/[poolId]/bracket/route.ts
 * ============================================================
 * Generate bracket knockout dari hasil pool (top-N qualifier)
 * ============================================================
 */

import { PrismaClient } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { buildBracket } from "@/lib/bracketGenerator";

const prisma = new PrismaClient();

// ----------------------------------------------------------------
// GET: Ambil bracket yang sudah di-generate untuk kategori pool ini
// ----------------------------------------------------------------
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; poolId: string }> }
) {
  const { id, poolId } = await params;

  try {
    const pool = await prisma.pool.findUnique({ where: { id: Number(poolId) } });
    if (!pool) {
      return errorResponse("Pool tidak ditemukan 🔍", 404, "NOT_FOUND");
    }

    const matches = await prisma.knockoutMatch.findMany({
      where: {
        tournamentId: Number(id),
        category: pool.categoryKey,
      },
      orderBy: { id: "asc" },
    });

    return successResponse(
      `Bracket untuk ${pool.label} berhasil diambil 🏆`,
      { pool, matches }
    );
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memuat bracket ❌", 500, "INTERNAL_SERVER_ERROR");
  }
}

// ----------------------------------------------------------------
// POST: Generate bracket knockout dari top-N member semua pool
//       dalam kategori yang sama
//
// Payload (opsional): { topN: 2 }
//   topN = berapa pemain/tim lolos dari tiap pool (default 2)
// ----------------------------------------------------------------
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; poolId: string }> }
) {
  const { id, poolId } = await params;
  const tournamentId = Number(id);

  try {
    const body = await req.json().catch(() => ({}));
    const topN: number = body?.topN ?? 2;

    if (topN < 1 || topN > 8) {
      return errorResponse("topN harus antara 1 hingga 8 ⚠️", 400, "BAD_REQUEST");
    }

    // Cek pool ini ada
    const pool = await prisma.pool.findUnique({ where: { id: Number(poolId) } });
    if (!pool) {
      return errorResponse("Pool tidak ditemukan 🔍", 404, "NOT_FOUND");
    }

    // Ambil semua pool dalam kategori yang sama (tournamentId + categoryKey)
    const allPoolsInCategory = await prisma.pool.findMany({
      where: {
        tournamentId,
        categoryKey: pool.categoryKey,
      },
      include: {
        members: {
          where: { rank: { lte: topN } }, // Ambil top-N berdasarkan rank
          orderBy: [{ rank: "asc" }, { wins: "desc" }, { pointDiff: "desc" }],
        },
      },
      orderBy: { poolCode: "asc" },
    });

    // Kumpulkan semua qualifying member
    const qualifiedMembers = allPoolsInCategory.flatMap((p) => p.members);

    if (qualifiedMembers.length < 2) {
      return errorResponse(
        "Minimal 2 peserta berkualifikasi diperlukan untuk bracket ⚠️. Pastikan pool matches sudah selesai dan rank sudah dihitung.",
        400,
        "BAD_REQUEST"
      );
    }

    // Urutkan: rank asc → wins desc → pointDiff desc → pointsFor desc
    qualifiedMembers.sort((a, b) => {
      if ((a.rank ?? 99) !== (b.rank ?? 99)) return (a.rank ?? 99) - (b.rank ?? 99);
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
      return b.pointsFor - a.pointsFor;
    });

    const seededNames = qualifiedMembers.map((m) => m.memberName);

    // Generate bracket dan simpan ke database
    const bracketMatches = await buildBracket(
      seededNames,
      tournamentId,
      pool.categoryKey,
      prisma
    );

    return successResponse(
      `Bracket ${pool.categoryKey} berhasil di-generate dari ${allPoolsInCategory.length} pool dengan ${seededNames.length} peserta 🏆`,
      {
        categoryKey: pool.categoryKey,
        generatedFrom: {
          poolCount: allPoolsInCategory.length,
          qualifiedCount: seededNames.length,
          topN,
          seededNames,
        },
        matches: bracketMatches,
      },
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal generate bracket ❌", 500, "INTERNAL_SERVER_ERROR");
  }
}
