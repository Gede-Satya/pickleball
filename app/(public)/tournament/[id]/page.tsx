// app/(public)/tournament/[id]/page.tsx
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import RegistrationModal from "./RegistrationModal"; // Import modal yang kita buat

const prisma = new PrismaClient();

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Ambil detail turnamen
  const tournament = await prisma.tournament.findUnique({
    where: { id: id },
  });

  if (!tournament) return notFound();

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Gambar Banner Turnamen */}
        {tournament.image ? (
          <div className="w-full h-[300px] md:h-[400px] bg-[#1E293B]">
            <img src={tournament.image} alt={tournament.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-48 bg-[#1E293B] flex items-center justify-center text-[#ffffff] font-bold text-2xl">
            {tournament.name}
          </div>
        )}

        <div className="p-8 md:p-12">
          <Link href="/tournament" className="text-yellow-600 font-semibold text-sm hover:underline mb-6 inline-block">
            &larr; Kembali ke Daftar Turnamen
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900">{tournament.name}</h1>
            {/* Label Status Cepat */}
            <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
              {tournament.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 py-6 border-y border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Kategori</p>
              <p className="font-semibold text-slate-800">{tournament.category || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Lokasi</p>
              <p className="font-semibold text-slate-800">{tournament.location}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Biaya Daftar</p>
              <p className="font-semibold text-slate-800">
                {tournament.registrationFee === 0 ? "Gratis" : `Rp ${tournament.registrationFee.toLocaleString('id-ID')}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Maks. Peserta</p>
              <p className="font-semibold text-slate-800">{tournament.maxParticipants} Tim</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none whitespace-pre-wrap mb-12">
            <h3 className="text-xl font-bold mb-4">Deskripsi / Peraturan</h3>
            {tournament.description || "Belum ada deskripsi lengkap."}
          </div>

          {/* 🏆 TOMBOL LIHAT JADWAL, KLASEMEN & BAGAN TURNAMEN */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-100 mb-6">
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">📅 Jadwal, Klasemen & Bagan</h4>
              <p className="text-sm text-slate-500">Cek jadwal tanding per lapangan, poin klasemen pool, dan bagan knockout terkini.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link 
                href={`/tournament/${id}/schedule`}
                className="px-5 py-3 bg-amber-500 text-slate-950 rounded-xl font-bold hover:bg-amber-400 transition-all shadow-sm whitespace-nowrap"
              >
                📅 Jadwal & Klasemen →
              </Link>
              <Link 
                href={`/tournament/${id}/bracket`}
                className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm whitespace-nowrap"
              >
                🏆 Bagan Knockout →
              </Link>
            </div>
          </div>

          {/* 🔥 TOMBOL MODAL PENDAFTARAN (Client Component) */}
          <div className="bg-slate-50 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100">
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">Tertarik untuk ikut?</h4>
              <p className="text-sm text-slate-500">Pastikan Anda telah membaca seluruh syarat dan ketentuan sebelum mendaftar.</p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              {/* Memanggil Modal dan mengirimkan data turnamen */}
              <RegistrationModal tournament={tournament} />
              {tournament.registrationFee > 0 && (
                <Link
                  href="/payment"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-semibold whitespace-nowrap"
                >
                  Sudah daftar? Cek status pembayaran →
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}