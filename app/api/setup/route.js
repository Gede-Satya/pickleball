// app/api/setup/route.js
import { prisma } from "@/lib/prisma"; // Ambil dari file lib yang baru dibuat
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function GET() {
  try {
    // 1. Pastikan database sinkron (Cek model User)
    // Jika error di sini, berarti model di schema.prisma bukan 'user' (mungkin 'User')
    const existingAdmin = await prisma.user.findFirst({
      where: { email: "admin@gmail.com" }
    });

    if (existingAdmin) {
      return errorResponse("Admin sudah ada! ✅", 400, "BAD_REQUEST");
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        name: "Administrator",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return successResponse("Yeay! Akun Admin berhasil dibuat! 🎉");
  } catch (error) {
    console.error("Error Detail:", error);
    return errorResponse("Gagal nih! ❌", 500, "INTERNAL_SERVER_ERROR", error.message);
  }
}

