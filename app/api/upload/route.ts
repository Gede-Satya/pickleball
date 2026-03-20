import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises"; // 🔥 Tambahkan mkdir di sini
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    // 1. Ubah file menjadi format Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Buat nama file unik
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, "-")}`;

    // 3. Tentukan lokasi penyimpanan
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filepath = path.join(uploadDir, filename);

    // 🔥 4. BARIS BARU: Cek & buat folder otomatis jika belum ada!
    await mkdir(uploadDir, { recursive: true });

    // 5. Simpan file fisik ke dalam folder
    await writeFile(filepath, buffer);

    // 6. Kembalikan URL gambar aslinya
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: imageUrl });

  } catch (error) {
    console.error("Gagal mengunggah gambar:", error);
    return NextResponse.json(
      { error: "Gagal memproses gambar di server" },
      { status: 500 }
    );
  }
}