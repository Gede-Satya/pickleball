// app/admin/clubs/DeleteClubButton.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { deleteClub } from "./action";
import { showDeleteConfirm, showSuccess, showError } from "@/lib/swal";

export default function DeleteClubButton({ id }: { id: number }) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        const confirmed = await showDeleteConfirm("Yakin ingin menghapus klub ini?");
        if (confirmed) {
          try {
            await deleteClub(id);
            showSuccess("Klub berhasil dihapus!");
            router.refresh(); // 🔥 Refresh data tanpa reload halaman
          } catch (err) {
            showError("Gagal menghapus klub.");
          }
        }
      }}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition font-medium text-sm"
    >
      Hapus
    </button>
  );
}