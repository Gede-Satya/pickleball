import React from "react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function TournamentsPage() {
  // Ambil semua data turnamen dari database, urutkan dari yang terbaru
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold">Nama Turnamen</th>
                <th className="p-4 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold">Lokasi</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {tournaments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Belum ada turnamen. Silakan tambah turnamen baru!
                  </td>
                </tr>
              ) : (
                tournaments.map((tournament) => (
                  <tr key={tournament.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{tournament.name}</td>
                    <td className="p-4 text-slate-600">
                      {tournament.startDate.toLocaleDateString('id-ID')} - {tournament.endDate.toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4 text-slate-600">{tournament.location}</td>
                    <td className="p-4">
                      {/* Badge Status (Bisa disesuaikan warnanya nanti) */}
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {tournament.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {/* Tombol Kelola Bagan (Bracket) */}
                      <Link 
                        href={`/admin/tournaments/${tournament.id}/brackets`}
                        className="inline-block px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md font-medium transition-colors"
                        title="Kelola Bagan Pertandingan"
                      >
                        🌳 Bagan
                      </Link>
                      
                      {/* Tombol Edit */}
                      <Link 
                        href={`/admin/tournaments/${tournament.id}/edit`}
                        className="inline-block px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md font-medium transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}