// lib/paymentProof.ts
// Helper penyimpanan bukti pembayaran — dipakai form pendaftaran
// dan halaman "Cek Pembayaran" publik.

import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

/**
 * Validasi & simpan file bukti pembayaran ke public/uploads/payments/.
 * Melempar Error berbahasa Indonesia jika tidak valid.
 * Mengembalikan URL publik file (mis. /uploads/payments/xxx.jpg).
 */
export async function savePaymentProofFile(file: File | null): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("Upload bukti pembayaran wajib diisi")
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error("Bukti pembayaran harus berupa gambar (JPG/PNG/WebP)")
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran bukti pembayaran maksimal 5MB")
  }

  const ext = file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg'
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payments')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

  return `/uploads/payments/${filename}`
}
