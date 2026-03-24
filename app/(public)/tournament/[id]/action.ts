// app/(public)/tournament/[id]/actions.ts
'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function registerPlayer(formData: FormData) {
  const tournamentId = parseInt(formData.get('tournamentId') as string)
  const fullName = formData.get('fullName') as string
  const schoolName = formData.get('schoolName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const category = formData.get('category') as string

  // Simpan data pendaftar ke tabel Player
  await prisma.player.create({
    data: {
      fullName,
      schoolName,
      phoneNumber,
      tournamentId,
      category,
    }
  })

  // Refresh halaman agar data terbaru termuat
  revalidatePath(`/tournament/${tournamentId}`)
  
  return { success: true }
}