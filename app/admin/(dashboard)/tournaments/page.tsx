import React from "react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import TournamentTable from "./TournamentTable";

const prisma = new PrismaClient();

export default async function TournamentsPage() {
  // Ambil turnamen aktif (belum diarsipkan), urutkan dari yang terbaru
  const tournaments = await prisma.tournament.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  // Turnamen yang diarsipkan (soft delete) untuk tab Arsip
  const archivedTournaments = await prisma.tournament.findMany({
    where: { NOT: { deletedAt: null } },
    orderBy: { deletedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Turnamen</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola jadwal, peserta, dan bagan pertandingan.</p>
        </div>

        {/* Tombol Tambah Turnamen */}
        <Link
          href="/admin/tournaments/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
        >
          <span>➕</span> Tambah Turnamen
        </Link>
      </div>

      {/* Tabel Daftar Turnamen */}
      <TournamentTable tournaments={tournaments} archivedTournaments={archivedTournaments} />
    </div>
  );
}
