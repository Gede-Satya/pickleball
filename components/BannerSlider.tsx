// BannerSlider.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const banners = [
  {
    id: 1,
    tag: "Portal Resmi IPF Kota Denpasar",
    title: "Selamat Datang di",
    titleHighlight: "Pickleball Denpasar",
    desc: "Temukan berita terbaru, jadwal turnamen, dan tips seputar dunia Pickleball di Kota Denpasar.",
    image: "/img/fotoPeserta.jpg",
    bgGradient: "from-yellow-400 via-[#0F172A] to-[#0F172A]",
  },
  {
    id: 2,
    tag: "Turnamen Mendatang",
    title: "Siapkan Tim Anda Untuk",
    titleHighlight: "Kejuaraan Nasional",
    desc: "Pendaftaran untuk turnamen terbesar tahun ini segera dibuka. Rebut total hadiah puluhan juta rupiah!",
    image: "/img/juaraUmum.png",
    bgGradient: "from-blue-500 via-[#0F172A] to-[#0F172A]",
  },
  {
    id: 3,
    tag: "Komunitas Solid",
    title: "Mari Bergabung Bersama",
    titleHighlight: "Keluarga IPF",
    desc: "Tingkatkan skill, tambah teman baru, dan nikmati keseruan olahraga dengan pertumbuhan tercepat di dunia.",
    image: "/img/panitia.jpg",
    bgGradient: "from-emerald-500 via-[#0F172A] to-[#0F172A]",
  },
];

export default function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-[#0F172A] text-[#ffffff] overflow-hidden h-[85vh] min-h-[500px]">
      <div
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="w-full h-full flex-shrink-0 relative flex items-center justify-center text-center px-6">
            <Image src={banner.image} alt={banner.title} fill priority={banner.id === 1} className="object-cover" />
            <div className="absolute inset-0 bg-black/50 z-10"></div>
            <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center mt-[-5%]">
              <span className="px-4 py-1.5 bg-yellow-400 text-[#0F172A] font-bold tracking-wider rounded-full text-xs uppercase mb-6">
                {banner.tag}
              </span>
              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                {banner.title} <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                  {banner.titleHighlight}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-[#e2e8f0] max-w-2xl mb-10 leading-relaxed font-medium">
                {banner.desc}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/tournament" className="px-8 py-3 bg-yellow-400 text-[#0F172A] font-bold rounded-full hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20">
                  Lihat Turnamen
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-30">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === index ? `w-10 bg-yellow-400` : "w-2.5 bg-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.7)]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}