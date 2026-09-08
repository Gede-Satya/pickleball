// lib/imageFile.ts
// Validasi file gambar berdasarkan isi (magic bytes), bukan hanya MIME type.
// Dipakai oleh API /api/upload dan helper bukti pembayaran.

import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
// PNG header: 89 50 4E 47 0D 0A 1A 0A
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP_RIFF = "RIFF";
const WEBP_FILE_KEY = "WEBP";

export type ImageFileType = "jpeg" | "png" | "webp";

/**
 * Deteksi tipe gambar dari magic bytes file.
 * Mengembalikan null jika file bukan gambar JPG/PNG/WebP yang valid.
 */
export function detectImageFileType(
  buffer: Buffer | ArrayBuffer
): ImageFileType | null {
  const bytes = Buffer.isBuffer(buffer)
    ? buffer
    : Buffer.from(new Uint8Array(buffer));
  if (bytes.length < 12) return null;

  if (
    bytes[0] === JPEG_MAGIC[0] &&
    bytes[1] === JPEG_MAGIC[1] &&
    bytes[2] === JPEG_MAGIC[2]
  ) {
    return "jpeg";
  }

  const header = bytes.subarray(0, 8);
  if (header.equals(Buffer.from(PNG_MAGIC))) return "png";

  // WebP: "RIFF" + ukuran(4 byte) + "WEBP"
  const riff = bytes.toString("latin1", 0, 4);
  const webp = bytes.toString("latin1", 8, 12);
  if (riff === WEBP_RIFF && webp === WEBP_FILE_KEY) return "webp";

  return null;
}

const EXTENSION_BY_TYPE: Record<ImageFileType, string> = {
  jpeg: ".jpg",
  png: ".png",
  webp: ".webp",
};

export function imageFileExtension(type: ImageFileType): string {
  return EXTENSION_BY_TYPE[type];
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validasi (ukuran + magic bytes) dan simpan file gambar ke public/uploads/<subdir>/.
 * Nama file memakai UUID server-side; ekstensi ditentukan dari isi file.
 * Mengembalikan URL publik (mis. /uploads/<subdir>/xxx.jpg).
 * Melempar Error berbahasa Indonesia jika file tidak valid.
 */
export async function savePublicImageFile(
  file: File | null,
  subdir: string
): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("File gambar wajib diisi")
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ukuran gambar maksimal 5MB")
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const imageType = detectImageFileType(buffer)
  if (!imageType) {
    throw new Error("File harus berupa gambar JPG/PNG/WebP yang valid")
  }

  const filename = `${crypto.randomUUID()}${imageFileExtension(imageType)}`
  const dir = path.join(process.cwd(), "public", "uploads", subdir)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)

  return `/uploads/${subdir ? `${subdir}/` : ""}${filename}`
}