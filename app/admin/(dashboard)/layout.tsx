"use client";
import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* SIDEBAR (Kiri) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-yellow-400">Admin IPF</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 text-white font-medium"
          >
            <span>📊</span> Dashboard
          </Link>
          <Link
            href="/admin/tournaments"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>🏆</span> Turnamen
          </Link>
          <Link
            href="/admin/posts"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>📝</span> Berita & Artikel
          </Link>
          <Link
            href="/admin/clubs"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>🛡️</span> Daftar Club
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white hover:bg-slate-700 transition-colors text-sm"
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
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-slate-900">
              A
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
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
