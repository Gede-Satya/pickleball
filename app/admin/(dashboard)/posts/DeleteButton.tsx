// app/admin/posts/DeleteButton.tsx
"use client";

import React from "react";
import { deletePost } from "./actions";

export default function DeleteButton({ id }: { id: number }) {
  return (
    <form action={deletePost.bind(null, id)}>
      <button
        type="submit"
        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition"
        onClick={(e) => {
          // Munculkan pop-up konfirmasi. Kalau batal, hentikan pengiriman form.
          if (!confirm("Yakin ingin menghapus artikel ini?")) {
            e.preventDefault();
          }
        }}
      >
        Hapus
      </button>
    </form>
  );
}