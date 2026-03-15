"use client"; // Wajib ditambahkan untuk fitur interaktif (slider)

import React, { useState, useEffect } from "react";
import Link from "next/link";
// IMPORT IMAGE DARI NEXT.JS
import Image from "next/image";

// --- DATA UNTUK SLIDER BANNER (SEKARANG PAKAI GAMBAR) ---
const banners = [
  {
    id: 1,
    tag: "Portal Resmi IPF Kota Denpasar",
    title: "Selamat Datang di",
    titleHighlight: "Pickleball Denpasar",
    desc: "Temukan berita terbaru, jadwal turnamen, dan tips seputar dunia Pickleball di Kota Denpasar.",
    // JALUR GAMBAR DI FOLDER public/img/
    image: "/img/fotoPeserta.jpg",
    bgGradient: "from-yellow-400 via-slate-900 to-slate-900", // Tetap simpan untuk dots warna
  },
  {
    id: 2,
    tag: "Turnamen Mendatang",
    title: "Siapkan Tim Anda Untuk",
    titleHighlight: "Kejuaraan Nasional",
    desc: "Pendaftaran untuk turnamen terbesar tahun ini segera dibuka. Rebut total hadiah puluhan juta rupiah!",
    image: "/img/panitia.jpg",
    bgGradient: "from-blue-500 via-slate-900 to-slate-900",
  },
  {
    id: 3,
    tag: "Komunitas Solid",
    title: "Mari Bergabung Bersama",
    titleHighlight: "Keluarga IPF",
    desc: "Tingkatkan skill, tambah teman baru, dan nikmati keseruan olahraga dengan pertumbuhan tercepat di dunia.",
    image: "/img/hero-3.jpg",
    bgGradient: "from-emerald-500 via-slate-900 to-slate-900",
  },
];

// Data Artikel (Tetap sama seperti sebelumnya)
const articles = [
  {
    id: 1,
    title: "Kejuaraan Walikota cup Pickleball Digelar di Denpasar",
    excerpt:
      "Persiapkan tim Anda! IPF Kota Denpasar akan menjadi tuan rumah untuk kejuaraan tingkat nasional tahun ini.",
    category: "Berita Utama",
    image: "/img/juaraUmum.png", // Contoh gambar untuk artikel, pastikan sudah ada di folder public/img/
    date: "15 Maret 2026",
    color: "bg-blue-600",
  },
  {
    id: 2,
    title: "5 Teknik Dasar Pickleball yang Wajib Dikuasai Pemula",
    excerpt:
      "Baru mulai bermain Pickleball? Jangan khawatir, pelajari 5 teknik dasar ini untuk meningkatkan kontrol permainanmu.",
    category: "Tips & Trik",
    date: "12 Maret 2026",
    color: "bg-emerald-500",
  },
  {
    id: 3,
    title: "Pentingnya Pemanasan Dinamis Sebelum Bertanding",
    excerpt:
      "Hindari cedera dengan melakukan rutinitas pemanasan dinamis ini sebelum Anda melangkah ke lapangan.",
    category: "Kesehatan",
    date: "10 Maret 2026",
    color: "bg-orange-500",
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Efek untuk mengganti slide otomatis setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000); // 5000 milidetik = 5 detik

    return () => clearInterval(timer); // Membersihkan timer agar tidak bocor/error
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HERO SECTION (BANNER SLIDER DENGAN GAMBAR) --- */}
      <section className="relative bg-slate-900 text-white overflow-hidden h-[85vh] min-h-[500px]">
        {/* Wadah yang Bergeser */}
        <div
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="w-full h-full flex-shrink-0 relative flex items-center justify-center text-center px-6"
            >
              {/* --- GAMBAR BACKGROUND --- */}
              <Image
                src={banner.image} // Mengambil jalur gambar dari data 'const banners'
                alt={banner.title}
                fill // Memenuhi seluruh kotak banner
                priority={banner.id === 1} // Prioritas muat untuk gambar pertama
                className="object-cover" // Memastikan gambar tidak gepeng
              />

              {/* Efek Gelap (Overlay) agar teks terbaca jelas */}
              <div className="absolute inset-0 bg-black/50 z-10"></div>

              {/* Konten Slide (Dinaikkan z-indexnya agar di atas gambar) */}
              <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center mt-[-5%]">
                <span className="px-4 py-1.5 bg-yellow-400 text-slate-900 font-bold tracking-wider rounded-full text-xs uppercase mb-6 border border-yellow-400/20">
                  {banner.tag}
                </span>

                <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                  {banner.title} <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                    {banner.titleHighlight}
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-100 max-w-2xl mb-10 leading-relaxed font-medium">
                  {banner.desc}
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/tournament"
                    className="px-8 py-3 bg-yellow-400 text-slate-900 font-bold rounded-full hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
                  >
                    Lihat Turnamen
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Titik Navigasi (Dots) di bawah banner */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-30">
          {banners.map((banner, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              // Warna dots sekarang dinamis mengikuti bgGradient lama agar seru
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? `w-10 bg-yellow-400`
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* --- BLOG SECTION (DAFTAR ARTIKEL) --- */}
      <section id="artikel" className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Berita & Artikel Terbaru
          </h2>
          <div className="h-1 w-20 bg-yellow-400 mt-3 rounded-full"></div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer"
            >
              
              {/* KOTAK KHUSUS GAMBAR (Hanya butuh 1 kotak ini saja) */}
              <div className="h-48 w-full relative overflow-hidden">
                <Image
                  src={article.image} // Pastikan kamu sudah menambahkan ini di const articles
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Efek gelap tipis yang muncul saat mouse diarahkan (hover) */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10"></div>
              </div>

              {/* ISI TEKS ARTIKEL */}
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">
                  {article.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-yellow-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">{article.date}</span>
                  <span className="font-bold text-slate-900 group-hover:text-yellow-600 transition-colors">
                    Baca Selengkapnya &rarr;
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
