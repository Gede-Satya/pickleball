"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { deleteContact } from "./action";
import { showDeleteConfirm, showSuccess, showError } from "@/lib/swal";

export default function DeleteContactButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        const confirmed = await showDeleteConfirm(
          "Pesan yang dihapus tidak bisa dikembalikan."
        );
        if (confirmed) {
          try {
            await deleteContact(id);
            showSuccess("Pesan berhasil dihapus!");
            router.refresh();
          } catch {
            showError("Gagal menghapus pesan.");
          }
        }
      }}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1 rounded-md transition font-medium text-sm"
    >
      Hapus
    </button>
  );
}
