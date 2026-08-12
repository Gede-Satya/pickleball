import React from "react";
import { PrismaClient } from '@prisma/client';
import Link from "next/link";

export const dynamic = 'force-dynamic';


const prisma = new PrismaClient();

// Tipe data gabungan untuk satu baris aktivitas
type ActivityItem = {
  id: number;
  type: "turnamen" | "pemain" | "berita" | "club";
  title: string;
  createdAt: Date;
};

// Ambil waktu relatif sederhana (mis. "5 menit lalu", "2 hari lalu")
function getRelativeTime(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Konfigurasi tampilan per jenis aktivitas
type ActivityConfig = {
  icon: string;
  label: string;
  bg: string;
  text: string;
};

const activityConfig: { [key in ActivityItem["type"]]: ActivityConfig } = {
  turnamen: { icon: "🏆", label: "Turnamen baru ditambahkan", bg: "bg-blue-100", text: "text-blue-600" },
  pemain: { icon: "👥", label: "Pemain baru terdaftar", bg: "bg-green-100", text: "text-green-600" },
  berita: { icon: "📝", label: "Berita baru dipublikasikan", bg: "bg-yellow-100", text: "text-yellow-600" },
  club: { icon: "🛡️", label: "Club afiliasi baru ditambahkan", bg: "bg-purple-100", text: "text-purple-600" },
};

export default async function AdminDashboard() {

  // Menarik data jumlah baris dari MySQL secara paralel agar loading lebih cepat
  // Asumsi: Kamu sudah membuat model di schema.prisma untuk tabel-tabel ini
  const [totalTurnamen, totalPemain, totalBerita, totalClub] = await Promise.all([
    prisma.tournament.count({ where: { deletedAt: null } }),   // Menghitung total turnamen
    prisma.player.count(),                         // Menghitung total pemain
    prisma.post.count(),                           // Menghitung total artikel/berita
    prisma.club.count()                            // Menghitung total club afiliasi
  ]);

  // Ambil 5 data terbaru dari masing-masing tabel, lalu gabungkan & urutkan
  const [recentTurnamen, recentPemain, recentBerita, recentClub] = await Promise.all([
    prisma.tournament.findMany({
      where: { deletedAt: null },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.player.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, createdAt: true },
    }),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.club.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true },
    }),
  ]);

  // ============================================================
  // DATA PEMBAYARAN — SINGLE = 1 pembayaran per Player,
  // DOUBLE/MIXED = 1 pembayaran per Team. Gratis (fee 0) dikecualikan.
  // ============================================================
  const [paymentPlayers, paymentTeams, activeTournaments] = await Promise.all([
    prisma.player.findMany({
      where: { teamId: null },
      select: {
        paymentStatus: true,
        tournamentId: true,
        tournament: { select: { registrationFee: true } },
      },
    }),
    prisma.team.findMany({
      select: {
        paymentStatus: true,
        tournamentId: true,
        tournament: { select: { registrationFee: true } },
      },
    }),
    prisma.tournament.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
    }),
  ]);

  // Gabungkan unit pembayaran (player SINGLE + team) menjadi satu daftar
  const paymentUnits = [
    ...paymentPlayers.map((p) => ({
      tournamentId: p.tournamentId,
      fee: p.tournament.registrationFee,
      status: p.paymentStatus,
    })),
    ...paymentTeams.map((t) => ({
      tournamentId: t.tournamentId,
      fee: t.tournament.registrationFee,
      status: t.paymentStatus,
    })),
  ];

  // Akumulasi per turnamen: belum bayar & lunas + total nominal
  const perTournament = new Map<
    number,
    { unpaidCount: number; unpaidTotal: number; paidCount: number; paidTotal: number }
  >();

  for (const unit of paymentUnits) {
    if (unit.fee <= 0) continue; // Gratis tidak dihitung
    const agg = perTournament.get(unit.tournamentId) ?? {
      unpaidCount: 0,
      unpaidTotal: 0,
      paidCount: 0,
      paidTotal: 0,
    };
    if (unit.status === "PAID") {
      agg.paidCount += 1;
      agg.paidTotal += unit.fee;
    } else {
      agg.unpaidCount += 1;
      agg.unpaidTotal += unit.fee;
    }
    perTournament.set(unit.tournamentId, agg);
  }

  // Total keseluruhan
  let totalUnpaidCount = 0;
  let totalUnpaidNominal = 0;
  let totalPaidCount = 0;
  let totalPaidNominal = 0;
  for (const agg of perTournament.values()) {
    totalUnpaidCount += agg.unpaidCount;
    totalUnpaidNominal += agg.unpaidTotal;
    totalPaidCount += agg.paidCount;
    totalPaidNominal += agg.paidTotal;
  }

  // 5 turnamen dengan tunggakan terbesar
  const topTunggakan = [...perTournament.entries()]
    .filter(([, agg]) => agg.unpaidCount > 0)
    .map(([tournamentId, agg]) => ({
      name: activeTournaments.find((t) => t.id === tournamentId)?.name ?? `Turnamen #${tournamentId}`,
      ...agg,
    }))
    .sort((a, b) => b.unpaidTotal - a.unpaidTotal)
    .slice(0, 5);

  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  const activities: ActivityItem[] = [
    ...recentTurnamen.map((t) => ({ id: t.id, type: "turnamen" as const, title: t.name, createdAt: t.createdAt })),
    ...recentPemain.map((p) => ({ id: p.id, type: "pemain" as const, title: p.fullName, createdAt: p.createdAt })),
    ...recentBerita.map((b) => ({ id: b.id, type: "berita" as const, title: b.title, createdAt: b.createdAt })),
    ...recentClub.map((c) => ({ id: c.id, type: "club" as const, title: c.name, createdAt: c.createdAt })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8); // Tampilkan 8 aktivitas terbaru saja

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Ringkasan Sistem</h1>

      {/* KOTAK STATISTIK (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
            🏆
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Turnamen</p>
            <p className="text-2xl font-bold text-slate-900">{totalTurnamen}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl">
            👥
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pemain Terdaftar</p>
            <p className="text-2xl font-bold text-slate-900">{totalPemain}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-2xl">
            📝
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Berita Aktif</p>
            <p className="text-2xl font-bold text-slate-900">{totalBerita}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Club Afiliasi</p>
            <p className="text-2xl font-bold text-slate-900">{totalClub}</p>
          </div>
        </div>

      </div>

      {/* BAGIAN RINGKASAN PEMBAYARAN */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Ringkasan Pembayaran</h2>
          <Link
            href="/admin/players"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            Kelola Pembayaran →
          </Link>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Belum Bayar */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-2xl">
                ⏳
              </div>
              <div>
                <p className="text-sm text-amber-700 font-semibold">Belum Bayar</p>
                <p className="text-2xl font-bold text-slate-900">{totalUnpaidCount} pendaftaran</p>
                <p className="text-sm text-amber-700 font-medium">{rupiah.format(totalUnpaidNominal)}</p>
              </div>
            </div>

            {/* Sudah Lunas */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">
                ✓
              </div>
              <div>
                <p className="text-sm text-emerald-700 font-semibold">Sudah Lunas</p>
                <p className="text-2xl font-bold text-slate-900">{totalPaidCount} pendaftaran</p>
                <p className="text-sm text-emerald-700 font-medium">{rupiah.format(totalPaidNominal)}</p>
              </div>
            </div>
          </div>

          {/* Tunggakan per turnamen */}
          {topTunggakan.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-600 mb-2">
                Turnamen dengan tunggakan terbesar
              </p>
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {topTunggakan.map((t) => (
                  <li key={t.name} className="flex items-center justify-between px-4 py-3 bg-white text-sm">
                    <span className="text-slate-800 font-medium truncate">{t.name}</span>
                    <span className="flex items-center gap-4 shrink-0">
                      <span className="text-amber-600 font-semibold">{t.unpaidCount} orang</span>
                      <span className="text-slate-700 font-bold">{rupiah.format(t.unpaidTotal)}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 mt-2">
                * Berbayar (biaya &gt; 0). DOUBLE/MIXED dihitung 1x per tim.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BAGIAN TABEL AKTIVITAS TERBARU */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-800">Aktivitas Terbaru</h2>
        </div>
        <div className="p-6">
          {activities.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Belum ada aktivitas terbaru hari ini.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activities.map((item) => {
                const config = activityConfig[item.type];
                return (
                  <li key={`${item.type}-${item.id}`} className="flex items-center gap-4 py-3">
                    <div
                      className={`w-10 h-10 shrink-0 ${config.bg} ${config.text} rounded-lg flex items-center justify-center text-lg`}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 truncate">
                        <span className="font-medium">{config.label}:</span>{" "}
                        <span className="text-slate-600">{item.title}</span>
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                      {getRelativeTime(item.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}