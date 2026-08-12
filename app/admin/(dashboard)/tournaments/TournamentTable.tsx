"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showDeleteConfirm, showConfirm, showSuccess, showError } from "@/lib/swal";

type Tournament = {
  id: number;
  name: string;
  location: string;
  category: string | null;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
};

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELED", label: "Canceled" },
];

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  UPCOMING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-indigo-100 text-indigo-700",
  CANCELED: "bg-red-100 text-red-600",
};

// Hanya turnamen dengan status ini yang bisa diarsipkan
const ARCHIVABLE_STATUSES = ["COMPLETED", "CANCELED"];

export default function TournamentTable({
  tournaments,
  archivedTournaments = [],
}: {
  tournaments: Tournament[];
  archivedTournaments?: Tournament[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"aktif" | "arsip">("aktif");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const currentList = tab === "aktif" ? tournaments : archivedTournaments;

  const categories = useMemo(() => {
    const values = tournaments
      .concat(archivedTournaments)
      .map((t) => t.category)
      .filter((c): c is string => !!c);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b, "id"));
  }, [tournaments, archivedTournaments]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return currentList.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
      if (!query) return true;
      return (
        t.name.toLowerCase().includes(query) ||
        t.location.toLowerCase().includes(query) ||
        (t.category ?? "").toLowerCase().includes(query)
      );
    });
  }, [currentList, search, statusFilter, categoryFilter]);

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("id-ID");

  async function handleArchive(t: Tournament) {
    const confirmed = await showDeleteConfirm(
      `Turnamen "${t.name}" akan diarsipkan. Data pertandingan tetap tersimpan sebagai history dan bisa dipulihkan kapan saja.`,
      "Yakin Arsipkan? 🗃️"
    );
    if (!confirmed) return;

    setDeletingId(t.id);
    try {
      const res = await fetch(`/api/tournaments/${t.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`Turnamen "${t.name}" berhasil diarsipkan.`, "Diarsipkan 🗃️");
        router.refresh();
      } else {
        showError(data.message || "Gagal mengarsipkan turnamen.");
      }
    } catch {
      showError("Terjadi kesalahan jaringan.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRestore(t: Tournament) {
    const confirmed = await showConfirm(
      `Turnamen "${t.name}" akan kembali ke daftar aktif.`,
      "Pulihkan Turnamen? ♻️",
      "Ya, Pulihkan"
    );
    if (!confirmed) return;

    setDeletingId(t.id);
    try {
      const res = await fetch(`/api/tournaments/${t.id}`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`Turnamen "${t.name}" berhasil dipulihkan.`, "Dipulihkan ♻️");
        router.refresh();
      } else {
        showError(data.message || "Gagal memulihkan turnamen.");
      }
    } catch {
      showError("Terjadi kesalahan jaringan.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handlePermanentDelete(t: Tournament) {
    const firstConfirm = await showDeleteConfirm(
      `Turnamen CANCELED "${t.name}" akan dihapus PERMANEN beserta semua data pertandingannya.`,
      "Yakin Hapus Permanen? 🗑️"
    );
    if (!firstConfirm) return;

    const secondConfirm = await showConfirm(
      "Ini langkah terakhir: data yang dihapus TIDAK BISA dikembalikan. Lanjutkan?",
      "Konfirmasi Terakhir ⚠️",
      "Ya, Hapus Permanen"
    );
    if (!secondConfirm) return;

    setDeletingId(t.id);
    try {
      const res = await fetch(`/api/tournaments/${t.id}?permanent=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`Turnamen "${t.name}" dihapus permanen.`, "Terhapus 🗑️");
        router.refresh();
      } else {
        showError(data.message || "Gagal menghapus turnamen.");
      }
    } catch {
      showError("Terjadi kesalahan jaringan.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Tab Aktif / Arsip */}
      <div className="flex gap-1 p-4 border-b border-slate-200 bg-slate-50/60">
        <button
          type="button"
          onClick={() => setTab("aktif")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "aktif"
              ? "bg-white text-blue-700 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Aktif ({tournaments.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("arsip")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "arsip"
              ? "bg-white text-blue-700 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Arsip ({archivedTournaments.length})
        </button>
      </div>

      {/* Toolbar Filter */}
      <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama turnamen, lokasi, atau kategori..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="ALL">Semua Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Hasil */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
        {filtered.length} dari {currentList.length} turnamen ditemukan
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4 font-semibold">Nama Turnamen</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold">Tanggal</th>
              <th className="p-4 font-semibold">Lokasi</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  {currentList.length === 0
                    ? tab === "aktif"
                      ? "Belum ada turnamen. Silakan tambah turnamen baru!"
                      : "Belum ada turnamen yang diarsipkan."
                    : "Tidak ada turnamen yang cocok dengan pencarian/filter saat ini."}
                </td>
              </tr>
            ) : (
              filtered.map((tournament) => (
                <tr key={tournament.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{tournament.name}</td>
                  <td className="p-4">
                    {tournament.category ? (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 whitespace-nowrap">
                        {tournament.category}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600 whitespace-nowrap">
                    {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                  </td>
                  <td className="p-4 text-slate-600">{tournament.location}</td>
                  <td className="p-4">
                    {tab === "arsip" ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        🗃️ Diarsipkan
                      </span>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          STATUS_BADGE[tournament.status] ?? "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {tournament.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    {tab === "arsip" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRestore(tournament)}
                          disabled={deletingId === tournament.id}
                          className="inline-block px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md font-medium transition-colors disabled:opacity-50"
                        >
                          {deletingId === tournament.id ? "..." : "♻️ Pulihkan"}
                        </button>
                        {tournament.status === "CANCELED" && (
                          <button
                            type="button"
                            onClick={() => handlePermanentDelete(tournament)}
                            disabled={deletingId === tournament.id}
                            className="inline-block px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-md font-medium transition-colors disabled:opacity-50"
                            title="Hapus permanen beserta semua data (khusus CANCELED)"
                          >
                            {deletingId === tournament.id ? "..." : "🗑️ Hapus Permanen"}
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/admin/tournaments/${tournament.id}/brackets`}
                          className="inline-block px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md font-medium transition-colors"
                          title="Kelola Bagan Pertandingan"
                        >
                          🌳 Bagan
                        </Link>
                        <Link
                          href={`/admin/tournaments/${tournament.id}/edit`}
                          className="inline-block px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md font-medium transition-colors"
                        >
                          Edit
                        </Link>
                        {ARCHIVABLE_STATUSES.includes(tournament.status) && (
                          <button
                            type="button"
                            onClick={() => handleArchive(tournament)}
                            disabled={deletingId === tournament.id}
                            className="inline-block px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium transition-colors disabled:opacity-50"
                            title="Arsipkan turnamen (soft delete)"
                          >
                            {deletingId === tournament.id ? "..." : "🗑️ Hapus"}
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}