'use client';

import React from 'react';

export default function DeleteButton() {
  return (
    <button 
      type="submit"
      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/30 font-semibold rounded-xl text-sm transition-all active:scale-95 flex items-center gap-1"
      onClick={(e) => {
        if (!window.confirm('Yakin ingin menghapus pemain ini? Data yang dihapus tidak bisa dikembalikan.')) {
          e.preventDefault();
        }
      }}
    >
      🗑️ Hapus
    </button>
  );
}