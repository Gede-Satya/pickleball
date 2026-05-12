// app/admin/posts/DeleteButton.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "./actions";
import { showDeleteConfirm, showSuccess, showError } from "@/lib/swal";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition"
      onClick={async () => {
        const confirmed = await showDeleteConfirm("Yakin ingin menghapus artikel ini?");
        if (confirmed) {
          try {
            await deletePost(id);
            showSuccess("Artikel berhasil dihapus!");
            router.refresh(); // 🔥 Refresh data tanpa reload halaman
          } catch (err) {
            showError("Gagal menghapus artikel.");
          }
        }
      }}
    >
      Hapus
    </button>
  );
}