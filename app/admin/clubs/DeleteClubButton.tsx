// app/admin/clubs/DeleteClubButton.tsx
"use client";

import React from "react";
import { deleteClub } from "./action";

export default function DeleteClubButton({ id }: { id: number }) {
  return (
    <button
      onClick={async () => {
        if (confirm("Yakin ingin menghapus klub ini?")) {
          await deleteClub(id);
        }
      }}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition font-medium text-sm"
    >
      Hapus
    </button>
  );
}