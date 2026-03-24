// app/(public)/tournament/[id]/RegistrationModal.tsx
"use client";

import React, { useState } from "react";
import { registerPlayer } from "./action";

export default function RegistrationModal({ tournament }: { tournament: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 LOGIKA PENTING: Tombol HANYA MUNCUL jika status turnamen UPCOMING
  if (tournament.status !== "UPCOMING") {
    return (
      <div className="bg-slate-100 text-slate-500 font-semibold px-6 py-3 rounded-xl inline-block">
        Pendaftaran Belum Dibuka / Sudah Tutup
      </div>
    );
  }

  // Fungsi saat form dikirim
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    await registerPlayer(formData);
    
    setIsSubmitting(false);
    setIsOpen(false); // Tutup modal
    alert("🎉 Pendaftaran Berhasil!");
  };

  return (
    <>
      {/* Tombol Daftar Utama */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-lg shadow-yellow-400/30 transition-all hover:scale-105"
      >
        Daftar Sekarang
      </button>

      {/* Background Gelap & Modal Pop-Up (Muncul jika isOpen == true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Tombol Silang (Tutup) */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Form Pendaftaran</h2>
            <p className="text-sm text-slate-500 mb-6">Mendaftar untuk: <strong className="text-yellow-600">{tournament.name}</strong></p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden Input untuk menyimpan ID turnamen secara diam-diam */}
              <input type="hidden" name="tournamentId" value={tournament.id} />

            <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Lengkap Tim/Pemain *</label>
                <input type="text" name="fullName" required className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>

              {/* Input Kategori yang baru ditambahkan */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Kategori Pertandingan *</label>
                <select name="category" required className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                  <option value="" disabled selected>-- Pilih Kategori --</option>
                  <option value="single">Single (Tunggal)</option>
                  <option value="double">Double (Ganda)</option>
                  <option value="double_mix">Double Mix (Ganda Campuran)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Instansi / Sekolah / Klub *</label>
                <input type="text" name="schoolName" required className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Nomor WhatsApp *</label>
                <input type="tel" name="phoneNumber" required className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl transition-colors mt-4"
              >
                {isSubmitting ? "Memproses..." : "Kirim Pendaftaran"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}