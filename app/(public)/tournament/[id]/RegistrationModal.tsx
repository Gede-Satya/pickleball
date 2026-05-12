// app/(public)/tournament/[id]/RegistrationModal.tsx
"use client";

import React, { useState } from "react";
import { registerPlayer } from "./action";
import { showSuccess } from "@/lib/swal";

export default function RegistrationModal({ tournament }: { tournament: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchType, setMatchType] = useState("");

  if (tournament.status !== "UPCOMING") {
    return (
      <div className="bg-slate-100 text-slate-500 font-semibold px-6 py-3 rounded-xl inline-block">
        Pendaftaran Belum Dibuka / Sudah Tutup
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Kalau MIXED, gabungkan nama putra + putri jadi fullName
    if (matchType === "MIXED") {
      const namaPutra = formData.get("namaPutra") as string;
      const namaPutri = formData.get("namaPutri") as string;
      formData.set("fullName", `${namaPutra} / ${namaPutri}`);
      formData.delete("namaPutra");
      formData.delete("namaPutri");
    }

    await registerPlayer(formData);

    form.reset();
    setMatchType("");
    setIsSubmitting(false);
    setIsOpen(false);
    showSuccess("Data Anda telah berhasil dikirim.", "Pendaftaran Berhasil! 🎉");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-lg shadow-yellow-400/30 transition-all hover:scale-105"
      >
        Daftar Sekarang
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Form Pendaftaran</h2>
            <p className="text-sm text-slate-500 mb-6">
              Mendaftar untuk: <strong className="text-yellow-600">{tournament.name}</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="tournamentId" value={tournament.id} />

              {/* Tipe Pertandingan & Grade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Tipe Pertandingan *</label>
                  <select
                    name="matchType"
                    required
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                  >
                    <option value="" disabled>-- Pilih Tipe --</option>
                    <option value="SINGLE">Single (Tunggal)</option>
                    <option value="DOUBLE">Double (Ganda)</option>
                    <option value="MIXED">Double Mix (Ganda Campuran)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Tingkat Sekolah (Grade) *</label>
                  <select
                    name="grade"
                    required
                    defaultValue=""
                    className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                  >
                    <option value="" disabled>-- Pilih Grade --</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>
              </div>

              {/* Nama — kondisional berdasarkan matchType */}
              {matchType === "MIXED" ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 font-medium">
                    🏓 Double Mix: isi nama pemain putra dan putri secara terpisah
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Pemain Putra *</label>
                    <input
                      type="text"
                      name="namaPutra"
                      required
                      placeholder="Nama lengkap pemain putra"
                      className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Pemain Putri *</label>
                    <input
                      type="text"
                      name="namaPutri"
                      required
                      placeholder="Nama lengkap pemain putri"
                      className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">
                    Nama Lengkap {matchType === "DOUBLE" ? "Tim/Pemain" : "Pemain"} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              )}

              {/* Gender — sembunyikan kalau MIXED */}
              {matchType !== "MIXED" && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Gender *</label>
                  <select
                    name="gender"
                    required
                    defaultValue=""
                    className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                  >
                    <option value="" disabled>-- Pilih Gender --</option>
                    <option value="MALE">Putra (Male)</option>
                    <option value="FEMALE">Putri (Female)</option>
                  </select>
                </div>
              )}

              {/* Kalau MIXED, kirim gender MIXED secara hidden */}
              {matchType === "MIXED" && (
                <input type="hidden" name="gender" value="MIXED" />
              )}

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Nama Instansi / Sekolah / Klub *</label>
                <input
                  type="text"
                  name="schoolName"
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Nomor WhatsApp *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
                />
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
