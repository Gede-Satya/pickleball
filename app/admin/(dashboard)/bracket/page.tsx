"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Redirect ke halaman turnamen (bracket sekarang per-turnamen)
export default function OldBracketRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/tournaments");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="text-4xl animate-bounce mb-4">🔄</div>
        <p className="text-slate-500 font-medium">
          Mengarahkan ke halaman Turnamen...
        </p>
        <p className="text-slate-400 text-sm mt-2">
          Bagan sekarang ada di dalam masing-masing turnamen.
        </p>
      </div>
    </div>
  );
}