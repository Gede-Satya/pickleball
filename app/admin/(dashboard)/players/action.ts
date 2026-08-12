'use server'

import { prisma } from '@/lib/prisma'
import type { Gender, MatchType } from '@prisma/client'
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
  const grade = formData.get('grade') as string
  const gender = formData.get('gender') as Gender
  const matchType = formData.get('matchType') as MatchType

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

// 3. Konfirmasi pembayaran (SINGLE → Player, DOUBLE/MIXED → Team)
export async function confirmPayment(formData: FormData) {
  const type = formData.get('type') as 'player' | 'team'
  const id = parseInt(formData.get('id') as string)

  if (type === 'team') {
    await prisma.team.update({
      where: { id },
      data: { paymentStatus: 'PAID', paymentConfirmedAt: new Date() }
    })
  } else {
    await prisma.player.update({
      where: { id },
      data: { paymentStatus: 'PAID', paymentConfirmedAt: new Date() }
    })
  }

  revalidatePath('/admin/players')
}

// 4. Batalkan konfirmasi (kembali ke status belum bayar)
export async function resetPayment(formData: FormData) {
  const type = formData.get('type') as 'player' | 'team'
  const id = parseInt(formData.get('id') as string)

  if (type === 'team') {
    await prisma.team.update({
      where: { id },
      data: { paymentStatus: 'UNPAID', paymentConfirmedAt: null }
    })
  } else {
    await prisma.player.update({
      where: { id },
      data: { paymentStatus: 'UNPAID', paymentConfirmedAt: null }
    })
  }

  revalidatePath('/admin/players')
}