"use client";
import React, { useState } from 'react';
import Image from 'next/image';

// --- DATA SIMULASI: DAFTAR TURNAMEN ---
const tournamentList = [
  {
    id: "T001",
    title: "Pickleball Summer Open 2024",
    category: "Men's Doubles 3.5+",
    date: "12 - 15 Agustus 2024",
    location: "GOR Liga Tenis Denpasar",
    status: "Ongoing", // Berjalan
    image: "/img/hero-1.jpg", // Ganti dengan gambar aslimu
  },
  {
    id: "T002",
    title: "Kejuaraan Walikota Cup Bali",
    category: "Mixed Doubles All Age",
    date: "20 - 22 September 2024",
    location: "Lapangan Renon",
    status: "Upcoming", // Akan Datang
    image: "/img/hero-2.jpg", // Ganti dengan gambar aslimu
  },
  {
    id: "T003",
    title: "IPF Denpasar Liga Pelajar",
    category: "Singles U-18",
    date: "1 - 3 Mei 2024",
    location: "GOR Ngurah Rai",
    status: "Completed", // Selesai
    image: "/img/hero-3.jpg", // Ganti dengan gambar aslimu
  }
];

// --- DATA SIMULASI: BAGAN (Khusus untuk Summer Open) ---
const groups = [
  {
    name: "Group A",
    teams: [
      { id: 1, name: "Andi/Budi", wins: 3, loss: 0, points: 33 },
      { id: 2, name: "Citra/Dewi", wins: 2, loss: 1, points: 28 },
      { id: 3, name: "Eko/Fajar", wins: 1, loss: 2, points: 20 },
    ]
  }
];

const knockoutMatches = [
  { 
    round: "Semi-Final", 
    matches: [
      { id: 101, t1: "Andi/Budi", t2: "Gani/Hadi", score1: 11, score2: 8 },
      { id: 102, t1: "Irfan/Joko", t2: "Citra/Dewi", score1: 5, score2: 11 },
    ]
  },
  { 
    round: "Final", 
    matches: [
      { id: 201, t1: "Andi/Budi", t2: "Citra/Dewi", score1: null, score2: null },
    ]
  }
];

export default function TournamentPage() {
  // state 'activeTournament' menyimpan turnamen mana yang sedang dibuka (null = tampilkan daftar)
  const [activeTournament, setActiveTournament] = useState<any>(null);
  // state 'view' untuk tab Fase Grup atau Knockout (hanya terpakai saat buka detail turnamen)
  const [view, setView] = useState('group');

  // --- TAMPILAN 1: DAFTAR TURNAMEN (HOMEPAGE TURNAMEN) ---
  if (!activeTournament) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Pusat Turnamen IPF</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Pantau jadwal, hasil pertandingan, dan bagan klasemen dari berbagai kejuaraan Pickleball resmi di Kota Denpasar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tournamentList.map((tourney) => (
              <div key={tourney.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                
                {/* Gambar Turnamen */}
                <div className="h-48 w-full relative overflow-hidden bg-slate-200">
                  <Image 
                    src={tourney.image} 
                    alt={tourney.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Label Status */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm shadow-sm">
                    {tourney.status === 'Ongoing' && <span className="text-green-600">Sedang Berjalan</span>}
                    {tourney.status === 'Upcoming' && <span className="text-yellow-600">Akan Datang</span>}
                    {tourney.status === 'Completed' && <span className="text-slate-600">Selesai</span>}
                  </div>
                </div>

                {/* Info Turnamen */}
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">
                    {tourney.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2">
                    {tourney.title}
                  </h3>
                  
                  <div className="space-y-2 mb-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span>📅</span> {tourney.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span> {tourney.location}
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <button 
                    onClick={() => setActiveTournament(tourney)}
                    className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-yellow-500 hover:text-slate-900 transition-colors"
                  >
                    Lihat Detail & Bagan
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // --- TAMPILAN 2: DETAIL & BAGAN TURNAMEN ---
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => setActiveTournament(null)}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          &larr; Kembali ke Daftar Turnamen
        </button>

        {/* Header Detail Turnamen */}
        <header className="mb-10 text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <span className="inline-block px-4 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold mb-4">
            {activeTournament.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{activeTournament.title}</h1>
          <p className="text-slate-500">{activeTournament.location} • {activeTournament.date}</p>
          
          {/* Tab Menu: Fase Grup / Knockout */}
          <div className="flex justify-center mt-8 gap-2 bg-slate-100 p-1 rounded-xl max-w-sm mx-auto">
            <button 
              onClick={() => setView('group')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${view === 'group' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Fase Grup
            </button>
            <button 
              onClick={() => setView('knockout')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${view === 'knockout' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Knockout
            </button>
          </div>
        </header>

        {/* --- KONTEN: TAB FASE GRUP --- */}
        {view === 'group' ? (
          <div className="space-y-8 animate-fade-in">
            {groups.map((group, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 text-white px-6 py-4 font-bold text-lg">{group.name}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Tim (Pemain)</th>
                        <th className="px-6 py-4 text-center w-24">Menang</th>
                        <th className="px-6 py-4 text-center w-24">Kalah</th>
                        <th className="px-6 py-4 text-center w-24">Poin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.teams.map((team, tIdx) => (
                        <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            <span className="text-slate-400 mr-3">{tIdx + 1}.</span> {team.name}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-green-600">{team.wins}</td>
                          <td className="px-6 py-4 text-center font-bold text-red-500">{team.loss}</td>
                          <td className="px-6 py-4 text-center font-bold text-slate-900">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          
          /* --- KONTEN: TAB KNOCKOUT --- */
          <div className="flex gap-12 overflow-x-auto pb-12 pt-4 px-4 justify-start md:justify-center animate-fade-in snap-x">
            {knockoutMatches.map((round, idx) => (
              <div key={idx} className="min-w-[280px] space-y-12 shrink-0 snap-center">
                <h3 className="text-center font-bold text-slate-400 uppercase tracking-widest text-sm mb-6">
                  {round.round}
                </h3>
                <div className="flex flex-col gap-8 justify-center h-full">
                  {round.matches.map((m) => (
                    <div key={m.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:border-yellow-400 hover:shadow-md transition-all">
                      {/* Pemain 1 */}
                      <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${m.score1 > m.score2 ? 'bg-yellow-50/50' : ''}`}>
                        <span className={`truncate pr-3 ${m.score1 > m.score2 ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{m.t1}</span>
                        <span className={`font-bold text-lg ${m.score1 > m.score2 ? 'text-yellow-600' : 'text-slate-400'}`}>{m.score1 ?? '-'}</span>
                      </div>
                      {/* Pemain 2 */}
                      <div className={`p-4 flex justify-between items-center ${m.score2 > m.score1 ? 'bg-yellow-50/50' : ''}`}>
                        <span className={`truncate pr-3 ${m.score2 > m.score1 ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{m.t2}</span>
                        <span className={`font-bold text-lg ${m.score2 > m.score1 ? 'text-yellow-600' : 'text-slate-400'}`}>{m.score2 ?? '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}