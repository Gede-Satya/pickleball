// /api/tournaments/[id]/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 1. Sesuaikan tipe params
) {
  // 2. Await params sebelum digunakan
  const resolvedParams = await params; 

  try {
    const data = await prisma.tournament.findUnique({
      where: { id: Number(resolvedParams.id) },
    });

    if (!data) {
      return Response.json({ error: "Turnamen tidak ditemukan" }, { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}