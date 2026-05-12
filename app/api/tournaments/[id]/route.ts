// /api/tournaments/[id]/route.ts
import { PrismaClient } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/apiResponse";

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
      return errorResponse("Turnamen tidak ditemukan 🔍", 404, "NOT_FOUND");
    }

    return successResponse("Data turnamen berhasil diambil ✨", data);
  } catch (error) {
    return errorResponse("Gagal mengambil data turnamen ❌", 500, "INTERNAL_SERVER_ERROR");
  }
}