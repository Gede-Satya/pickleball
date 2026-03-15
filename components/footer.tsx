import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* KOLOM 1: IDENTITAS & LOGO */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-white border-2 border-slate-700">
              <Image 
                src="/img/logo.png" 
                alt="Logo IPF Denpasar" 
                width={48} 
                height={48} 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-white tracking-tight leading-none">IPF KOTA DENPASAR</span>
              <span className="text-xs text-yellow-500 mt-1">Indonesia Pickleball Federation</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Mewadahi, membina, dan mengembangkan olahraga Pickleball di Kota Denpasar. Mari bergabung dan jadilah bagian dari olahraga dengan pertumbuhan tercepat di dunia!
          </p>
        </div>

        {/* KOLOM 2: TAUTAN CEPAT */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Tautan Cepat</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                <span className="text-yellow-500">&bull;</span> Berita & Artikel
              </Link>
            </li>
            <li>
              <Link href="/tournament" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                <span className="text-yellow-500">&bull;</span> Jadwal Turnamen
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                <span className="text-yellow-500">&bull;</span> Tentang Kami
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                <span className="text-yellow-500">&bull;</span> Galeri Kegiatan
              </Link>
            </li>
          </ul>
        </div>

        {/* KOLOM 3: KONTAK & SEKRETARIAT */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Hubungi Kami</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <span>
                <strong className="text-slate-200 block mb-1">Sekretariat IPF Denpasar</strong>
                Jl. Contoh Alamat No. 123, <br />
                Denpasar, Bali, Indonesia 80232
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-xl">📞</span>
              <span className="hover:text-yellow-400 transition-colors cursor-pointer">+62 812 3456 7890</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-xl">✉️</span>
              <span className="hover:text-yellow-400 transition-colors cursor-pointer">halo@ipfdenpasar.com</span>
            </li>
            
          </ul>
        </div>

      </div>

      {/* BAGIAN BAWAH (COPYRIGHT) */}
      <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Indonesia Pickleball Federation (IPF) Kota Denpasar. Hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}