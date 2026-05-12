"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OldBracketRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/admin/tournaments");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        {/* ICON ANIMASI */}
        <div className="text-4xl mb-4 animate-spin">🔄</div>

        {/* TEXT */}
        <p className="text-slate-500 font-medium animate-pulse">
          Mengarahkan ke halaman Turnamen...
        </p>

        <p className="text-slate-400 text-sm mt-2">
          Bagan sekarang ada di dalam masing-masing turnamen.
        </p>
      </div>
    </div>
  );
}