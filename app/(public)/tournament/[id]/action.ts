// app/(public)/tournament/[id]/actions.ts
'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache'

import { buildCategoryInfo, autoAssignToPool } from '@/lib/tournamentCategory'

export async function registerPlayer(formData: FormData) {
  const tournamentId = parseInt(formData.get('tournamentId') as string)
  const fullName = formData.get('fullName') as string
  const schoolName = formData.get('schoolName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const gender = (formData.get('gender') as any) || 'MALE'
  const grade = (formData.get('grade') as any) || 'SMA'
  const matchType = (formData.get('matchType') as any) || 'SINGLE'

  // Cek turnamen untuk ambil poolSize
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) throw new Error("Turnamen tidak ditemukan")

  // Simpan data pendaftar ke tabel Player
  const player = await prisma.player.create({
    data: {
      fullName,
      schoolName,
      phoneNumber,
      tournamentId,
      gender,
      grade,
      matchType,
    }
  })

  // Jika pendaftar SINGLE, langsung masukkan ke Pool
  if (matchType === 'SINGLE') {
    const categoryInfo = buildCategoryInfo(grade, gender, matchType)
    const resPool = await autoAssignToPool(
      prisma,
      tournamentId,
      categoryInfo,
      fullName,
      tournament.poolSize,
      { playerId: player.id }
    )

    // Auto-generate pool matches if it reached FULL status
    const updatedPool = await prisma.pool.findUnique({ where: { id: resPool.pool.id } })
    if (updatedPool && updatedPool.status === 'FULL') {
       const { generatePoolMatches } = await import('@/lib/tournamentCategory');
       await generatePoolMatches(prisma, resPool.pool.id);
    }
  }

  // Refresh halaman agar data terbaru termuat
  revalidatePath(`/tournament/${tournamentId}`)
  
  return { success: true }
}