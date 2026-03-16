import React from "react";

export default function AdminDashboard() {
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
            <p className="text-2xl font-bold text-slate-900">12</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl">
            👥
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pemain Terdaftar</p>
            <p className="text-2xl font-bold text-slate-900">148</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-2xl">
            📝
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Berita Aktif</p>
            <p className="text-2xl font-bold text-slate-900">24</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Club Afiliasi</p>
            <p className="text-2xl font-bold text-slate-900">8</p>
          </div>
        </div>

      </div>

      {/* BAGIAN TABEL AKTIVITAS TERBARU */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-800">Aktivitas Terbaru</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-500 text-sm text-center py-8">Belum ada aktivitas terbaru hari ini.</p>
        </div>
      </div>

    </div>
  );
}