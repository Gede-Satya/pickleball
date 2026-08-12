'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DeleteButton from './DeleteButton';
import PaymentActions from './PaymentActions';

function CategoryBadge({ grade, gender, matchType }: { grade: string; gender: string | null; matchType: string }) {
  const genderLabel = gender === 'MALE' ? 'Putra' : gender === 'FEMALE' ? 'Putri' : '';
  const matchLabel = matchType === 'SINGLE' ? 'Single' : matchType === 'DOUBLE' ? 'Double' : 'Mixed';
  const label = matchType === 'MIXED' ? `${grade} Mixed` : `${grade} ${genderLabel} ${matchLabel}`;

  const styleMap: Record<string, string> = {
    SINGLE: "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-xs",
    DOUBLE: "bg-blue-50 text-blue-700 border-blue-200/80 shadow-xs",
    MIXED:  "bg-purple-50 text-purple-700 border-purple-200/80 shadow-xs",
  };
  const styleClass = styleMap[matchType] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`px-3 py-1 border rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1.5 ${styleClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
}

function paymentMethodLabel(method: string | null): string | null {
  if (!method) return null;
  const map: Record<string, string> = {
    TRANSFER: 'Transfer Bank',
    QRIS: 'QRIS',
    EWALLET: 'E-Wallet',
    VENUE: 'Bayar di Venue',
  };
  return map[method] || method;
}

export type PlayerRow = {
  key: string;
  name: string;
  members: string[];
  grade: string;
  gender: string | null;
  matchType: string;
  school: string;
  phone: string;
  isTeam: boolean;
  memberIds: number[];
  teamId: number | null;
  registrationFee: number;
  paymentMethod: string | null;
  paymentStatus: string | null;
  paymentProof: string | null;
};

export type TournamentGroup = {
  tournamentId: number;
  tournamentName: string;
  tournamentStatus: string;
  rows: PlayerRow[];
};

const statusStyleMap: Record<string, { bg: string; text: string; label: string }> = {
  UPCOMING: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Buka Pendaftaran' },
  ONGOING: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Sedang Berlangsung' },
  COMPLETED: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: 'Selesai' },
  CANCELED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Dibatalkan' },
  DRAFT: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Draft' },
};

function exportRowsToCSV(rows: PlayerRow[], filename: string) {
  const headers = [
    'No',
    'Nama / Tim',
    'Anggota Tim',
    'Grade',
    'Gender',
    'Match Type',
    'Instansi / Klub',
    'No. WhatsApp',
    'Biaya Pendaftaran',
    'Metode Pembayaran',
    'Status Pembayaran',
  ];
  const csvLines = [headers.join(',')];

  rows.forEach((row, i) => {
    const cleanMembers = row.members.map((m) => m.replace(/^[👦👧]\s*/, '')).join('; ');
    const line = [
      i + 1,
      `"${row.name.replace(/"/g, '""')}"`,
      `"${cleanMembers.replace(/"/g, '""')}"`,
      `"${row.grade.replace(/"/g, '""')}"`,
      `"${row.gender || ''}"`,
      `"${row.matchType}"`,
      `"${(row.school || '').replace(/"/g, '""')}"`,
      `"${(row.phone || '').replace(/"/g, '""')}"`,
      row.registrationFee,
      `"${paymentMethodLabel(row.paymentMethod) || ''}"`,
      `"${row.registrationFee === 0 ? 'Gratis' : row.paymentStatus === 'PAID' ? 'Lunas' : 'Belum Bayar'}"`,
    ];
    csvLines.push(line.join(','));
  });

  const csvContent = '\uFEFF' + csvLines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PlayerTableClient({ tournamentGroups }: { tournamentGroups: TournamentGroup[] }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [collapsedTournaments, setCollapsedTournaments] = useState<Set<number>>(new Set());

  const toggleCollapse = (id: number) => {
    setCollapsedTournaments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filterRows = (rows: PlayerRow[]) => {
    return rows.filter((row) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.school.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q) ||
        row.grade.toLowerCase().includes(q) ||
        row.members.some((m) => m.toLowerCase().includes(q));

      const matchTypeFilter =
        filterType === 'ALL' || row.matchType === filterType;

      const matchPaymentFilter =
        filterPayment === 'ALL' ||
        (filterPayment === 'FREE' && row.registrationFee === 0) ||
        (filterPayment === 'PAID' && row.registrationFee > 0 && row.paymentStatus === 'PAID') ||
        (filterPayment === 'UNPAID' && row.registrationFee > 0 && row.paymentStatus !== 'PAID');

      return matchSearch && matchTypeFilter && matchPaymentFilter;
    });
  };

  // Metrics
  const totalAllRows = tournamentGroups.reduce((sum, g) => sum + g.rows.length, 0);
  const totalPaid = tournamentGroups.reduce((sum, g) => sum + g.rows.filter(r => r.paymentStatus === 'PAID').length, 0);
  const totalUnpaid = tournamentGroups.reduce((sum, g) => sum + g.rows.filter(r => r.registrationFee > 0 && r.paymentStatus !== 'PAID').length, 0);
  const totalFiltered = tournamentGroups.reduce((sum, g) => sum + filterRows(g.rows).length, 0);

  const resetFilters = () => {
    setSearch('');
    setFilterType('ALL');
    setFilterPayment('ALL');
  };

  const handleExportAllFiltered = () => {
    const allFiltered: PlayerRow[] = [];
    tournamentGroups.forEach((g) => {
      allFiltered.push(...filterRows(g.rows));
    });
    exportRowsToCSV(allFiltered, `Daftar_Peserta_Pickleball_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-8">
      {/* METRICS DASHBOARD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            🏆
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Turnamen</p>
            <p className="text-2xl font-black text-slate-900">{tournamentGroups.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
            👥
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Peserta</p>
            <p className="text-2xl font-black text-slate-900">{totalAllRows}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            ✓
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sudah Lunas</p>
            <p className="text-2xl font-black text-emerald-600">{totalPaid}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            ⏳
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Belum Bayar</p>
            <p className="text-2xl font-black text-amber-600">{totalUnpaid}</p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Cari nama pemain, instansi, No HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔍</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="SINGLE">Single</option>
            <option value="DOUBLE">Double</option>
            <option value="MIXED">Mixed</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="ALL">Semua Status Bayar</option>
            <option value="PAID">Lunas</option>
            <option value="UNPAID">Belum Bayar</option>
            <option value="FREE">Gratis</option>
          </select>

          {(search || filterType !== 'ALL' || filterPayment !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-200"
            >
              Reset Filter
            </button>
          )}

          <button
            onClick={handleExportAllFiltered}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            title="Export data peserta ke file CSV/Excel"
          >
            <span>📥 Export Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* PER-TOURNAMENT SECTIONS */}
      {tournamentGroups.map((group) => {
        const filteredRows = filterRows(group.rows);
        if (filteredRows.length === 0 && (search || filterType !== 'ALL' || filterPayment !== 'ALL')) return null;

        const isCollapsed = collapsedTournaments.has(group.tournamentId);
        const paidCount = group.rows.filter((r) => r.paymentStatus === 'PAID').length;
        const unpaidCount = group.rows.filter((r) => r.registrationFee > 0 && r.paymentStatus !== 'PAID').length;
        const statusMeta = statusStyleMap[group.tournamentStatus] || { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: group.tournamentStatus };

        return (
          <div
            key={group.tournamentId}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/30 overflow-hidden transition-all"
          >
            {/* Tournament Header */}
            <div className="w-full px-6 py-5 flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white gap-4">
              <div
                onClick={() => toggleCollapse(group.tournamentId)}
                className="flex items-center gap-4 cursor-pointer flex-1"
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-xl shadow-inner border border-white/10 group-hover:scale-105 transition-transform">
                  🎾
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white hover:text-yellow-400 transition-colors">
                    {group.tournamentName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${statusMeta.bg} ${statusMeta.text}`}>
                      {statusMeta.label}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold bg-white/10 px-2.5 py-0.5 rounded-full">
                      👥 {group.rows.length} Peserta
                    </span>
                    {paidCount > 0 && (
                      <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                        ✓ {paidCount} Lunas
                      </span>
                    )}
                    {unpaidCount > 0 && (
                      <span className="text-xs text-amber-300 font-bold bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800">
                        ⏳ {unpaidCount} Belum Bayar
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between md:justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    exportRowsToCSV(filteredRows, `Peserta_${group.tournamentName.replace(/[^a-zA-Z0-9]/g, '_')}`);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-1"
                >
                  📥 Export CSV
                </button>

                <button
                  type="button"
                  onClick={() => toggleCollapse(group.tournamentId)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <svg className={`w-4 h-4 text-white transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Player Table */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                {filteredRows.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">
                        <th className="py-4 px-6 w-14 text-center">No</th>
                        <th className="py-4 px-6 whitespace-nowrap">Nama Lengkap / Tim</th>
                        <th className="py-4 px-6 w-40">Kategori</th>
                        <th className="py-4 px-6">Instansi / Klub</th>
                        <th className="py-4 px-6 whitespace-nowrap">No. WhatsApp</th>
                        <th className="py-4 px-6">Pembayaran</th>
                        <th className="py-4 px-6 text-center w-40">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRows.map((row, index) => (
                        <tr
                          key={row.key}
                          className="hover:bg-indigo-50/40 transition-colors duration-150 group"
                        >
                          <td className="py-4 px-6 text-slate-400 font-bold text-center text-sm">
                            {index + 1}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {row.name}
                            </div>
                            {row.members.length > 0 && (
                              <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                {row.members.map((m, i) => (
                                  <span key={i} className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px]">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <CategoryBadge grade={row.grade} gender={row.gender} matchType={row.matchType} />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                              <span className="text-slate-400">🏫</span>
                              {row.school || '-'}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-700 text-sm">
                            {row.phone}
                          </td>

                          {/* Kolom Pembayaran */}
                          <td className="py-4 px-6">
                            {row.registrationFee > 0 ? (
                              row.paymentStatus === 'PAID' ? (
                                <div className="flex flex-col items-start gap-1">
                                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold whitespace-nowrap inline-flex items-center gap-1">
                                    <span>✓</span> Lunas
                                  </span>
                                  {paymentMethodLabel(row.paymentMethod) && (
                                    <span className="text-[11px] font-semibold text-slate-400">
                                      {paymentMethodLabel(row.paymentMethod)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-start gap-1.5">
                                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-extrabold whitespace-nowrap inline-flex items-center gap-1">
                                    <span>⏳</span> Belum Bayar
                                  </span>
                                  {paymentMethodLabel(row.paymentMethod) && (
                                    <span className="text-[11px] font-semibold text-slate-400">
                                      {paymentMethodLabel(row.paymentMethod)}
                                    </span>
                                  )}
                                  {row.paymentProof && (
                                    <button
                                      type="button"
                                      onClick={() => setModalImage(row.paymentProof)}
                                      className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-extrabold flex items-center gap-1"
                                    >
                                      🖼️ Preview Bukti
                                    </button>
                                  )}
                                  <PaymentActions
                                    type={row.isTeam ? 'team' : 'player'}
                                    id={row.isTeam ? row.teamId! : row.memberIds[0]}
                                    status={row.paymentStatus}
                                  />
                                </div>
                              )
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold whitespace-nowrap">
                                Gratis
                              </span>
                            )}
                          </td>

                          {/* Tombol Aksi (Edit & Delete) */}
                          <td className="py-4 px-6">
                            {row.isTeam ? (
                              <div className="flex flex-col items-end gap-1.5">
                                {row.memberIds.map((id, i) => (
                                  <Link
                                    key={id}
                                    href={`/admin/players/${id}`}
                                    className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white font-bold rounded-xl text-xs transition-all shadow-xs"
                                  >
                                    ✏️ Pemain {i + 1}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="flex justify-center items-center gap-2">
                                <Link
                                  href={`/admin/players/${row.memberIds[0]}`}
                                  className="px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 shadow-xs"
                                >
                                  ✏️ Edit
                                </Link>
                                <DeleteButton playerId={row.memberIds[0]} />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mb-3 text-2xl">
                      📭
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Belum Ada Pemain</h3>
                    <p className="text-slate-500 text-xs">
                      Belum ada peserta yang mendaftar untuk turnamen ini.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {tournamentGroups.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 py-24 text-center">
          <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mb-4 mx-auto text-4xl">
            📭
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Belum Ada Pemain</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Tabel ini masih kosong. Pemain yang mendaftar melalui halaman publik akan otomatis muncul di sini.
          </p>
        </div>
      )}

      {/* MODAL PREVIEW BUKTI PEMBAYARAN */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Preview Bukti Transfer</h3>
                <p className="text-xs text-slate-400">Verifikasi keaslian foto sebelum konfirmasi lunas.</p>
              </div>
              <button
                onClick={() => setModalImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[65vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-950 flex justify-center p-2">
              <img
                src={modalImage}
                alt="Bukti Pembayaran"
                className="max-w-full h-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setModalImage(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Tutup
              </button>
              <a
                href={modalImage}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5"
              >
                <span>Buka Ukuran Penuh</span> ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
