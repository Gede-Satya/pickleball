'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

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
  const category = formData.get('category') as string
  const schoolName = formData.get('schoolName') as string
  const phoneNumber = formData.get('phoneNumber') as string

  await prisma.player.update({
    where: { id },
    data: {
      fullName,
      category,
      schoolName,
      phoneNumber
    }
  })

  revalidatePath('/admin/players')
  redirect('/admin/players') // Kembali ke tabel setelah berhasil edit
}