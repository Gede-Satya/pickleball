"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/admin", icon: "📊", label: "Dashboard", exact: true },
  { href: "/admin/tournaments", icon: "🏆", label: "Turnamen" },
  { href: "/admin/schedule", icon: "📅", label: "Jadwal Pertandingan" },
  { href: "/admin/posts", icon: "📝", label: "Berita & Artikel" },
  { href: "/admin/players", icon: "🥎", label: "Pemain terdaftar" },
  { href: "/admin/clubs", icon: "🛡️", label: "Daftar Club" },
  { href: "/admin/struktur", icon: "🌳", label: "Struktur Organisasi" },
  { href: "/admin/wasit-log", icon: "🏁", label: "Log Wasit" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* SIDEBAR (Kiri) */}
      <aside className="w-64 bg-[#0F172A] text-[#ffffff] flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-[#1E293B]">
          <span className="text-xl font-bold text-yellow-400">Admin IPF</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item)
                  ? "bg-[#1E293B] text-[#ffffff] font-medium"
                  : "text-slate-400 hover:bg-[#1E293B] hover:text-[#ffffff]"
              }`}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
          <a
            href="/wasit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-[#1E293B] hover:text-[#ffffff] transition-colors"
          >
            <span>🔗</span> Buka Portal Wasit
          </a>
        </nav>

        <div className="p-4 border-t border-[#1E293B]">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#1E293B] text-[#A8B3C6] rounded-lg hover:text-[#ffffff] hover:bg-[#334155] transition-colors text-sm"
          >
            <span>&larr;</span> Lihat Website
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA (Kanan) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <h2 className="text-xl font-bold text-slate-800">Dashboard Panel</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">
              Halo, Admin
            </span>
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-[#0F172A]">
              A
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="px-4 py-2 text-sm bg-[#EF4444] text-[#ffffff] rounded-lg hover:bg-[#DC2626]"
            >
              Logout
            </button>
          </div>
        </header>

        {/* ISI HALAMAN (Berubah-ubah sesuai menu yang diklik) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
