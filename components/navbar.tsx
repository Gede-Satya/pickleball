"use client"; // Wajib untuk fitur klik menu HP & Dropdown

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";



export default function Navbar() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
  
      if (currentScroll > lastScroll && currentScroll > 50) {
        setShowNavbar(false); // scroll ke bawah
      } else {
        setShowNavbar(true); // scroll ke atas
      }
  
      setLastScroll(currentScroll);
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);
  // Catatan state untuk menu HP dan Dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Menutup menu saat berpindah halaman
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsAboutOpen(false);
  };

  return (
    // Mempertahankan desain asli kamu: Putih transparan + Efek blur
  <nav
  className={`fixed top-0 left-0 w-full z-50 
  bg-white/70 backdrop-blur-lg shadow-sm text-slate-900 
  transition-all duration-300
  ${showNavbar ? "translate-y-0" : "-translate-y-full"}`}
>
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        
        {/* KIRI: LOGO (Persis seperti aslimu) */}
        <div className="flex items-center gap-2">
          <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-3">
            <div className="shrink-0">
              <Image
                src="/img/logo.png"
                alt="Logo IPF Denpasar"
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight leading-none mb-1">
                IPF KOTA DENPASAR
              </span>
              <span className="text-xs text-slate-500 leading-none">
                Indonesia Pickleball Federation
              </span>
            </div>
          </Link>
        </div>

        {/* TENGAH/KANAN: MENU DESKTOP (Sembunyi di HP) */}
        <div className="hidden md:flex gap-6 font-medium items-center">
          <Link href="/" className="hover:text-yellow-600 transition-colors">
            Beranda
          </Link>
          <Link href="/tournament" className="hover:text-yellow-600 transition-colors">
            Turnamen
          </Link>
          <Link href="/articles" className="hover:text-yellow-600 transition-colors">
            Berita
          </Link>
          
          {/* DROPDOWN DESKTOP: Tentang Kami */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1 hover:text-yellow-600 transition-colors focus:outline-none">
              Tentang Kami
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Kotak Laci (Muncul saat di-hover) */}
            <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden flex flex-col">
              <Link href="/struktur" className="px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-yellow-600 border-b border-slate-100 transition-colors">
                Struktur Organisasi
              </Link>
              <Link href="/clubs" className="px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-yellow-600 transition-colors">
                Daftar Club
              </Link>
            </div>
          </div>

          <Link href="/contact" className="hover:text-yellow-600 transition-colors">
            Kontak
          </Link>
        </div>

        {/* KANAN: TOMBOL HAMBURGER HP (Sembunyi di Desktop) */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-900 hover:text-yellow-600 focus:outline-none p-2"
          >
            {isMobileMenuOpen ? (
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* --- MENU DROPDOWN UNTUK HP --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full left-0 top-full shadow-lg">
          <div className="px-4 py-4 flex flex-col space-y-2">
            <Link href="/" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md font-medium text-slate-900 hover:bg-slate-50 hover:text-yellow-600">
              Beranda
            </Link>
            <Link href="/tournament" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md font-medium text-slate-900 hover:bg-slate-50 hover:text-yellow-600">
              Turnamen
            </Link>
            <Link href="/articles" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md font-medium text-slate-900 hover:bg-slate-50 hover:text-yellow-600">
              Berita
            </Link>
            
            {/* DROPDOWN HP: Tentang Kami */}
            <div className="rounded-md overflow-hidden bg-slate-50/50">
              <button 
                onClick={() => setIsAboutOpen(!isAboutOpen)}
                className="flex items-center justify-between w-full px-3 py-2 font-medium text-slate-900 hover:text-yellow-600 focus:outline-none"
              >
                <span>Tentang Kami</span>
                <svg className={`w-5 h-5 transition-transform duration-300 ${isAboutOpen ? 'rotate-180 text-yellow-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isAboutOpen && (
                <div className="px-3 py-2 ml-4 flex flex-col space-y-2 border-l-2 border-slate-200">
                  <Link href="/struktur" onClick={closeMobileMenu} className="text-sm font-medium text-slate-600 hover:text-yellow-600">
                    Struktur Organisasi
                  </Link>
                  <Link href="/clubs" onClick={closeMobileMenu} className="text-sm font-medium text-slate-600 hover:text-yellow-600">
                    Daftar Club
                  </Link>
                </div>
              )}
            </div>

            <Link href="/contact" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md font-medium text-slate-900 hover:bg-slate-50 hover:text-yellow-600">
              Kontak
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}