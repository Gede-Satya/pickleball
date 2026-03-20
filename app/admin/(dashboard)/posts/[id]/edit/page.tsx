// app/admin/posts/[id]/edit/page.tsx
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import EditPostForm from "./EditPostForm"; // Kita akan buat file ini di Langkah 3

const prisma = new PrismaClient();

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Ambil data artikel berdasarkan ID
  const post = await prisma.post.findUnique({
    where: { id },
  });

  // Jika artikel tidak ditemukan, tampilkan halaman 404
  if (!post) {
    return notFound();
  }

  // Kirim data ke komponen form di bawah
  return <EditPostForm post={post} />;
}