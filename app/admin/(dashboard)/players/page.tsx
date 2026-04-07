import React from "react";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { deletePlayer } from "./action"; // Pastikan path-nya benar
import DeleteButton from "./DeleteButton";

const prisma = new PrismaClient();

// Fungsi kecil untuk membuat badge warna-warni
function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">-</span>;
  
  const styles: Record<string, string> = {
    single: "bg-emerald-100 text-emerald-700 border-emerald-200",
    double: "bg-blue-100 text-blue-700 border-blue-200",
    double_mix: "bg-purple-100 text-purple-700 border-purple-200",
  };

  const label = category.replace("_", " ");
  const styleClass = styles[category] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span className={`px-3 py-1.5 border rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${styleClass}`}>
      {label}
    </span>
  );
}

export default async function PlayerListPage() {
  const players = await prisma.player.findMany({
    orderBy: { id: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Section (SUDAH DITAMBAHKAN TOMBOL KEMBALI) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/30">
            👥
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daftar Pemain</h1>
            <p className="text-slate-500 text-sm mt-1">
              Kelola data {players.length} peserta turnamen yang telah mendaftar.
            </p>
          </div>
        </div>

        {/* Tombol Kembali ke Dashboard Admin */}
        <Link 
          href="/admin" 
          className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 font-semibold transition-all shadow-sm active:scale-95"
        >
          ← Kembali ke Dashboard
        </Link>
      </div>

      {/* Table Card Section */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          {players.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="py-5 px-6 font-bold w-16 text-center">No</th>
                  <th className="py-5 px-6 font-bold whitespace-nowrap">Nama Lengkap / Tim</th>
                  <th className="py-5 px-6 font-bold w-40">Kategori</th>
                  <th className="py-5 px-6 font-bold">Instansi / Klub</th>
                  <th className="py-5 px-6 font-bold whitespace-nowrap">No. WhatsApp</th>
                  <th className="py-5 px-6 font-bold text-center w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {players.map((player, index) => (
                  <tr
                    key={player.id}
                    className="hover:bg-blue-50/50 transition-all duration-200 group"
                  >
                    <td className="py-4 px-6 text-slate-400 font-medium text-center">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {player.fullName}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <CategoryBadge category={player.category} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <span className="text-slate-400">🏫</span>
                        {player.schoolName}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {player.phoneNumber}
                    </td>

                    {/* Tombol Aksi (Edit & Delete) */}
                    <td className="py-4 px-6">
                      <div className="flex justify-center items-center gap-2">
                        {/* Tombol Edit */}
                        <Link
                          href={`/admin/players/${player.id}`}
                          className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30 font-semibold rounded-xl text-sm transition-all active:scale-95 flex items-center gap-1"
                        >
                          ✏️ Edit
                        </Link>

                        {/* Tombol Hapus */}
                        <form action={deletePlayer}>
                          <input type="hidden" name="id" value={player.id} />
                          <DeleteButton />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Empty State */
            <div className="py-24 text-center flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-5xl">📭</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Belum Ada Pemain</h3>
              <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                Tabel ini masih kosong. Pemain yang mendaftar melalui halaman publik akan otomatis muncul di sini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}