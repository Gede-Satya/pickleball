// clean-next.js — hapus .next dengan retry (workaround ENOTEMPTY di Windows,
// biasanya file handle transien dari antivirus/scanner yang masih menahan file).
"use strict";

const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), ".next");
const MAX_OUTER_ATTEMPTS = 5;

function removeNext() {
  return new Promise((resolve, reject) => {
    fs.rm(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 }, (err) => {
      if (err && err.code !== "ENOENT") reject(err);
      else resolve();
    });
  });
}

(async () => {
  for (let attempt = 1; attempt <= MAX_OUTER_ATTEMPTS; attempt++) {
    try {
      await removeNext();
      console.log("[clean-next] .next berhasil dihapus");
      process.exit(0);
    } catch (err) {
      console.error(`[clean-next] percobaan ${attempt}/${MAX_OUTER_ATTEMPTS} gagal: ${err.code} (${err.path})`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  console.error("[clean-next] tidak bisa menghapus .next setelah beberapa percobaan. Tutup editor/antivirus yang mengunci lalu ulangi.");
  process.exit(1);
})();