// page.tsx (Halaman Utamamu)

import Link from "next/link";
import { PrismaClient } from "@prisma/client";
// Panggil komponen slider yang tadi kita pisah:
import BannerSlider from "@/components/BannerSlider"; // Sesuaikan path-nya jika beda folder

const prisma = new PrismaClient();

export default async function HomePage() {
  const [latestArticles, activeTournaments] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.tournament.findMany({
      where: {
        deletedAt: null,
        status: { in: ["UPCOMING", "ONGOING"] },
      },
      orderBy: { startDate: "asc" },
      take: 3,
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* --- HERO SECTION (SLIDER KOMPONEN) --- */}
      <BannerSlider />

      {/* --- SECTION TURNAMEN AKTIF / MENDATANG --- */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Turnamen Mendatang & Berlangsung
            </h2>
            <div className="h-1 w-20 bg-yellow-400 mt-3 rounded-full"></div>
          </div>
          <Link href="/tournament" className="hidden sm:block text-yellow-600 font-bold hover:text-yellow-700">
            Lihat Semua Turnamen &rarr;
          </Link>
        </div>

        {activeTournaments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
            Belum ada turnamen aktif saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeTournaments.map((t) => (
              <Link
                key={t.id}
                href={`/tournament/${t.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                <div className="h-44 w-full relative bg-slate-800">
                  {t.image ? (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold px-4 text-center">
                      {t.name}
                    </div>
                  )}
                  <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-white ${
                    t.status === "ONGOING" ? "bg-emerald-500" : "bg-blue-600"
                  }`}>
                    {t.status === "ONGOING" ? "Sedang Main 🎾" : "Buka Pendaftaran 📝"}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-yellow-600 transition-colors line-clamp-1">
                    {t.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                    <span>📍</span> {t.location}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">
                      Biaya: {t.registrationFee === 0 ? "Gratis" : `Rp ${t.registrationFee.toLocaleString("id-ID")}`}
                    </span>
                    <span className="font-bold text-yellow-600 group-hover:translate-x-1 transition-transform">
                      Detail Turnamen &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* --- BLOG SECTION (DAFTAR ARTIKEL ASLI DARI DATABASE) --- */}
      <section id="artikel" className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Berita & Artikel Terbaru
            </h2>
            <div className="h-1 w-20 bg-yellow-400 mt-3 rounded-full"></div>
          </div>
          <Link href="/articles" className="hidden sm:block text-yellow-600 font-bold hover:text-yellow-700">
            Lihat Semua Artikel &rarr;
          </Link>
        </div>

        {latestArticles.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            Belum ada artikel terbaru.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              // 🔥 Bungkus seluruh kartu dengan Link agar bisa diklik menuju halaman baca
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer"
              >
                {/* KOTAK GAMBAR */}
                <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
                      Tanpa Gambar
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10"></div>
                </div>

                {/* ISI TEKS ARTIKEL */}
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">
                    Berita
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-yellow-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  {/* line-clamp-3 akan memotong teks konten agar tidak terlalu panjang */}
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                    {article.content}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium">
                      {new Date(article.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-bold text-slate-900 group-hover:text-yellow-600 transition-colors">
                      Baca Selengkapnya &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Tombol Lihat Semua untuk versi HP */}
        <div className="mt-10 text-center sm:hidden">
           <Link href="/articles" className="inline-block px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg">
             Lihat Semua Artikel
           </Link>
        </div>
      </section>
    </div>
  );
}