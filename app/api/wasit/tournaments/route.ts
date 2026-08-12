// GET: Ambil semua turnamen yang statusnya ONGOING untuk ditampilkan ke wasit
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: { status: { in: ["ONGOING", "UPCOMING"] }, deletedAt: null },
      orderBy: { startDate: "asc" },
      select: { id: true, name: true, status: true, startDate: true, endDate: true },
    });
    return NextResponse.json({ success: true, data: tournaments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data turnamen" }, { status: 500 });
  }
}
