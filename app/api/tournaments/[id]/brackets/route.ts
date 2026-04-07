// /api/tournaments/[id]/brackets/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil semua grup + member + match untuk turnamen tertentu
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tournamentId = Number(id);

  try {
    const groups = await prisma.tournamentGroup.findMany({
      where: { tournamentId },
      include: {
        members: { orderBy: { seedOrder: "asc" } },
        matches: { orderBy: { id: "asc" } },
      },
      orderBy: { id: "asc" },
    });

    // Ambil juga daftar pemain turnamen (untuk assign ke grup)
    const players = await prisma.player.findMany({
      where: { tournamentId },
      orderBy: { seedOrder: "asc" },
    });

    // Ambil kategori unik dari pemain
    const categories = [...new Set(players.map((p) => p.category).filter(Boolean))];

    return Response.json({ groups, players, categories });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Gagal mengambil data bracket" }, { status: 500 });
  }
}

// POST: Buat grup baru
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tournamentId = Number(id);

  try {
    const body = await req.json();
    const { name, category } = body;

    if (!name || !category) {
      return Response.json({ error: "Nama grup dan kategori wajib diisi" }, { status: 400 });
    }

    const group = await prisma.tournamentGroup.create({
      data: {
        name,
        category,
        tournamentId,
      },
      include: {
        members: true,
        matches: true,
      },
    });

    return Response.json(group, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Gagal membuat grup" }, { status: 500 });
  }
}

// DELETE: Hapus grup beserta member dan match-nya
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await req.json();
    const { groupId } = body;

    if (!groupId) {
      return Response.json({ error: "groupId wajib diisi" }, { status: 400 });
    }

    await prisma.tournamentGroup.delete({
      where: { id: Number(groupId) },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Gagal menghapus grup" }, { status: 500 });
  }
}
