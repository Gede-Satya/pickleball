'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminAction } from '@/lib/requireAdmin'

// Fungsi Tambah Post/Artikel
export async function createPost(formData: FormData) {
  await requireAdminAction();
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const imageUrl = formData.get('image') as string

  await prisma.post.create({
    data: {
      title,
      content,
      image: imageUrl || null,
      published: true, // Langsung kita publish
      // 🔥 PENTING: Karena skemamu mewajibkan authorId, 
      // untuk sementara kita pakai ID 1. Pastikan ada User dengan ID 1 di databasemu!
      authorId: 1, 
    }
  })

  

  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}

// Fungsi Hapus Post/Artikel
export async function deletePost(id: number) {
  await requireAdminAction();
  await prisma.post.delete({
    where: { id }
  })

  revalidatePath('/admin/posts')

  
}

export async function updatePost(formData: FormData) {
  await requireAdminAction();
  const id = parseInt(formData.get('id') as string)
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const imageUrl = formData.get('image') as string // URL dari hasil upload

  await prisma.post.update({
    where: { id: id },
    data: {
      title,
      content,
      // Jika ada gambar baru, update. Jika kosong, biarkan gambar lama.
      ...(imageUrl ? { image: imageUrl } : {})
    }
  })

  // Refresh halaman agar perubahannya terlihat
  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}