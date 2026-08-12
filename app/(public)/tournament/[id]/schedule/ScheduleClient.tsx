'use client';

import React, { useState } from 'react';

type MatchItem = {
  id: number;
  type: 'POOL' | 'KNOCKOUT' | 'GROUP';
  groupOrPoolName: string;
  category: string;
  player1: string;
  player2: string;
  score1: number | null;
  score2: number | null;
  status: string;
  court?: string | null;
  startTime?: string | null;
  winner?: string | null;
};

type PoolStandingsItem = {
  poolName: string;
  category: string;
  members: Array<{
    name: string;
    played: number;
    wins: number;
    losses: number;
    pointDiff: number;
    rank?: number | null;
  }>;
};

type MemberLike = {
  player?: { fullName?: string | null } | null;
  team?: { name?: string | null } | null;
};

type PoolMemberLike = MemberLike & {
  played?: number;
  wins?: number;
  losses?: number;
  pointDiff?: number;
  rank?: number | null;
};

type LegacyMemberLike = {
  playerName?: string;
  played?: number;
  wins?: number;
  losses?: number;
  pointDiff?: number;
  rank?: number | null;
};

type PoolLike = {
  label?: string;
  categoryKey?: string;
  members?: PoolMemberLike[];
  matches?: Array<{
    id: number;
    score1?: number | null;
    score2?: number | null;
    status?: string;
    court?: string | null;
    startTime?: string | Date | null;
    winnerName?: string | null;
    member1?: MemberLike | null;
    member2?: MemberLike | null;
  }>;
};

type GroupLike = {
  name?: string;
  category?: string;
  members?: LegacyMemberLike[];
  matches?: Array<{
    id: number;
    score1?: number | null;
    score2?: number | null;
    status?: string;
    winnerName?: string | null;
    player1Name?: string | null;
    player2Name?: string | null;
  }>;
};

type KnockoutLike = {
  id: number;
  round?: number;
  category?: string;
  score1?: number | null;
  score2?: number | null;
  status?: string;
  court?: string | null;
  startTime?: string | Date | null;
  winnerName?: string | null;
  player1Name?: string | null;
  player2Name?: string | null;
};

type TournamentLike = {
  pools?: PoolLike[];
  groups?: GroupLike[];
  knockoutMatches?: KnockoutLike[];
};

export default function ScheduleClient({ tournament }: { tournament: TournamentLike }) {
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'STANDINGS'>('SCHEDULE');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Build match list
  const matches: MatchItem[] = [];

  // 1. From Pool matches
  if (tournament.pools) {
    for (const pool of tournament.pools) {
      for (const m of pool.matches ?? []) {
        const memberName = (x: MemberLike | null | undefined) =>
          x?.player?.fullName || x?.team?.name || null;
        matches.push({
          id: m.id,
          type: 'POOL',
          groupOrPoolName: pool.label ?? '',
          category: pool.categoryKey ?? '',
          player1: memberName(m.member1) || 'TBD',
          player2: memberName(m.member2) || 'TBD',
          score1: m.score1 ?? null,
          score2: m.score2 ?? null,
          status: m.status ?? 'SCHEDULED',
          court: m.court,
          startTime: m.startTime ? new Date(m.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
          winner: m.winnerName,
        });
      }
    }
  }

  // 2. From Legacy Group matches
  if (tournament.groups) {
    for (const group of tournament.groups) {
      for (const m of group.matches ?? []) {
        matches.push({
          id: m.id,
          type: 'GROUP',
          groupOrPoolName: group.name ?? '',
          category: group.category ?? '',
          player1: m.player1Name || 'TBD',
          player2: m.player2Name || 'TBD',
          score1: m.score1 ?? null,
          score2: m.score2 ?? null,
          status: m.status ?? 'SCHEDULED',
          winner: m.winnerName,
        });
      }
    }
  }

  // 3. From Knockout matches
  if (tournament.knockoutMatches) {
    for (const k of tournament.knockoutMatches) {
      matches.push({
        id: k.id,
        type: 'KNOCKOUT',
        groupOrPoolName: `Knockout R${k.round ?? ''}`,
        category: k.category ?? '',
        player1: k.player1Name || 'TBD',
        player2: k.player2Name || 'TBD',
        score1: k.score1 ?? null,
        score2: k.score2 ?? null,
        status: k.status ?? 'SCHEDULED',
        court: k.court,
        startTime: k.startTime ? new Date(k.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
        winner: k.winnerName,
      });
    }
  }

  // Build pool standings list
  const poolStandings: PoolStandingsItem[] = [];
  if (tournament.pools && tournament.pools.length > 0) {
    for (const pool of tournament.pools) {
      const members = (pool.members ?? []).map((m) => ({
        name: m.player?.fullName || m.team?.name || 'Pemain',
        played: m.played || 0,
        wins: m.wins || 0,
        losses: m.losses || 0,
        pointDiff: m.pointDiff || 0,
        rank: m.rank,
      })).sort((a, b) => (a.rank || 99) - (b.rank || 99));

      poolStandings.push({
        poolName: pool.label ?? '',
        category: pool.categoryKey ?? '',
        members,
      });
    }
  } else if (tournament.groups && tournament.groups.length > 0) {
    for (const group of tournament.groups) {
      const members = (group.members ?? []).map((m) => ({
        name: m.playerName + '',
        played: m.played || 0,
        wins: m.wins || 0,
        losses: m.losses || 0,
        pointDiff: m.pointDiff || 0,
        rank: m.rank,
      })).sort((a, b) => (a.rank || 99) - (b.rank || 99));

      poolStandings.push({
        poolName: group.name ?? '',
        category: group.category ?? '',
        members,
      });
    }
  }

  // Filter matches
  const filteredMatches = matches.filter((m) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      m.player1.toLowerCase().includes(q) ||
      m.player2.toLowerCase().includes(q) ||
      m.groupOrPoolName.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q);

    const matchStatus =
      statusFilter === 'ALL' || m.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* TABS & SEARCH HEADER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all w-1/2 md:w-auto ${
              activeTab === 'SCHEDULE'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📅 Jadwal Pertandingan ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('STANDINGS')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all w-1/2 md:w-auto ${
              activeTab === 'STANDINGS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📊 Klasemen Pool ({poolStandings.length})
          </button>
        </div>

        {activeTab === 'SCHEDULE' && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari nama pemain / tim..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="SCHEDULED">Mendatang</option>
              <option value="ONGOING">Sedang Tanding</option>
              <option value="DONE">Selesai</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: SCHEDULE */}
      {activeTab === 'SCHEDULE' && (
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
              <span className="text-4xl block mb-2">🏸</span>
              <p className="font-semibold text-slate-700">Belum Ada Pertandingan Ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Jadwal pertandingan akan ditampilkan di sini setelah diatur oleh panitia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMatches.map((m) => (
                <div
                  key={`${m.type}-${m.id}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-extrabold uppercase">
                      {m.groupOrPoolName}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      m.status === 'DONE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : m.status === 'ONGOING'
                        ? 'bg-amber-100 text-amber-700 animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {m.status === 'DONE' ? 'Selesai ✓' : m.status === 'ONGOING' ? 'Sedang Main 🎾' : 'Terjadwal ⏳'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-3 mb-3">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm truncate flex-1 ${m.winner === m.player1 ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {m.player1}
                      </span>
                      <span className="font-black text-slate-900 ml-4 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm">
                        {m.score1 !== null ? m.score1 : '-'}
                      </span>
                    </div>

                    <div className="border-t border-slate-200/60 my-1"></div>

                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm truncate flex-1 ${m.winner === m.player2 ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {m.player2}
                      </span>
                      <span className="font-black text-slate-900 ml-4 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm">
                        {m.score2 !== null ? m.score2 : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>📍 {m.court ? `Lapangan ${m.court}` : 'Lapangan TBD'}</span>
                    <span>🕒 {m.startTime || 'Waktu TBD'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: STANDINGS */}
      {activeTab === 'STANDINGS' && (
        <div className="space-y-6">
          {poolStandings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
              <span className="text-4xl block mb-2">📊</span>
              <p className="font-semibold text-slate-700">Belum Ada Klasemen Pool</p>
              <p className="text-xs text-slate-400 mt-1">Klasemen pool akan diperbarui otomatis setelah skor dimasukkan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {poolStandings.map((pool, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-5 py-3 text-white flex justify-between items-center">
                    <h3 className="font-bold text-base">{pool.poolName}</h3>
                    <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full uppercase">
                      {pool.category}
                    </span>
                  </div>

                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100">
                        <th className="py-2.5 px-4">#</th>
                        <th className="py-2.5 px-4">Nama Peserta / Tim</th>
                        <th className="py-2.5 px-2 text-center">M</th>
                        <th className="py-2.5 px-2 text-center">K</th>
                        <th className="py-2.5 px-3 text-center">PD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pool.members.map((m, i) => (
                        <tr key={i} className={m.rank === 1 ? 'bg-yellow-50/70 font-semibold' : ''}>
                          <td className="py-3 px-4 font-bold text-slate-500">
                            {m.rank === 1 ? '🥇' : m.rank === 2 ? '🥈' : m.rank === 3 ? '🥉' : i + 1}
                          </td>
                          <td className="py-3 px-4 text-slate-800 font-bold">{m.name}</td>
                          <td className="py-3 px-2 text-center text-emerald-600 font-bold">{m.wins}</td>
                          <td className="py-3 px-2 text-center text-red-500 font-bold">{m.losses}</td>
                          <td className={`py-3 px-3 text-center font-bold ${m.pointDiff > 0 ? 'text-emerald-600' : m.pointDiff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                            {m.pointDiff > 0 ? `+${m.pointDiff}` : m.pointDiff}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
