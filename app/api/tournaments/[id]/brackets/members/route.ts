// /api/tournaments/[id]/brackets/members/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Tambah member ke grup
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params; // consume params

  try {
    const body = await req.json();
    const { groupId, playerName, seedOrder } = body;

    if (!groupId || !playerName) {
      return Response.json(
        { error: "groupId dan playerName wajib diisi" },
        { status: 400 }
      );
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId: Number(groupId),
        playerName,
        seedOrder: seedOrder || 0,
      },
    });

    return Response.json(member, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Gagal menambah member" }, { status: 500 });
  }
}

// DELETE: Hapus member dari grup
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;

  try {
    const body = await req.json();
    const { memberId } = body;

    if (!memberId) {
      return Response.json({ error: "memberId wajib diisi" }, { status: 400 });
    }

    await prisma.groupMember.delete({
      where: { id: Number(memberId) },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Gagal menghapus member" }, { status: 500 });
  }
}

// PUT: Update seed order member (untuk seeding manual)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;

  try {
    const body = await req.json();
    const { members } = body; // [ { id: 1, seedOrder: 1 }, { id: 2, seedOrder: 2 } ]

    if (!members || !Array.isArray(members)) {
      return Response.json(
        { error: "Format data members tidak valid" },
        { status: 400 }
      );
    }

    // Update seed order untuk semua member sekaligus
    await Promise.all(
      members.map((m: { id: number; seedOrder: number }) =>
        prisma.groupMember.update({
          where: { id: m.id },
          data: { seedOrder: m.seedOrder },
        })
      )
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal update seed order" },
      { status: 500 }
    );
  }
}
