"use client";

import React, { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  const root = document.documentElement;
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

/**
 * Tombol toggle mode gelap/terang.
 * Floating di pojok kanan bawah (dipasang di root layout) sehingga
 * tersedia di semua halaman: publik, admin, dan wasit.
 */
export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={dark ? "Mode terang ☀️" : "Mode gelap 🌙"}
      className="fixed bottom-5 right-5 z-[70] flex h-11 w-11 items-center justify-center rounded-full bg-[#0F2A3D] text-lg shadow-lg shadow-black/25 ring-1 ring-white/20 hover:bg-[#1C4E67] hover:scale-105 transition-all"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
