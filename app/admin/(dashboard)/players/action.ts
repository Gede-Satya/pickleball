'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 1. Fungsi Hapus (Delete)
export async function deletePlayer(formData: FormData) {
  const id = parseInt(formData.get('id') as string)

  await prisma.player.delete({
    where: { id }
  })

  revalidatePath('/admin/players')
}

// 2. Fungsi Edit (Update)
export async function updatePlayer(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  const fullName = formData.get('fullName') as string
  const schoolName = formData.get('schoolName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  
  // Ambil tipe baru (sekarang bisa di-update)
  const grade = formData.get('grade') as any
  const gender = formData.get('gender') as any
  const matchType = formData.get('matchType') as any

  await prisma.player.update({
    where: { id },
    data: {
      fullName,
      schoolName,
      phoneNumber,
      grade,
      gender,
      matchType
    }
  })

  revalidatePath('/admin/players')
  redirect('/admin/players') // Kembali ke tabel setelah berhasil edit
}