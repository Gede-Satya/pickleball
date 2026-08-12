'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type ScheduleEntry = {
  type: 'pool' | 'knockout'
  id: number
  court: string | null
  startTime: string | null // ISO string, atau kosong
}

// Simpan jadwal (lapangan + waktu tanding) untuk banyak match sekaligus
export async function saveSchedule(formData: FormData) {
  const tournamentId = parseInt(formData.get('tournamentId') as string)
  const raw = formData.get('entries') as string

  if (!tournamentId) throw new Error("Turnamen tidak valid")
  if (!raw) throw new Error("Tidak ada data jadwal yang dikirim")

  let entries: ScheduleEntry[]
  try {
    entries = JSON.parse(raw)
  } catch {
    throw new Error("Format data jadwal tidak valid")
  }
  if (!Array.isArray(entries)) throw new Error("Format data jadwal tidak valid")

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) throw new Error("Turnamen tidak ditemukan")

  const validCourt = (v: string | null) => {
    const t = (v ?? '').trim().slice(0, 30)
    return t === '' ? null : t
  }
  const validTime = (v: string | null): Date | null => {
    if (!v) return null
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  }

  // Update satu per satu agar aman (gabungan pool + knockout)
  for (const entry of entries) {
    if (!entry || typeof entry.id !== 'number') continue
    const court = validCourt(entry.court)
    const startTime = validTime(entry.startTime)
    const data = { court, startTime }

    if (entry.type === 'pool') {
      await prisma.poolMatch.update({ where: { id: entry.id }, data })
    } else if (entry.type === 'knockout') {
      await prisma.knockoutMatch.update({ where: { id: entry.id }, data })
    }
  }

  revalidatePath(`/admin/schedule/${tournamentId}`)
  revalidatePath('/admin/schedule')
  revalidatePath(`/tournament/${tournamentId}/schedule`)
  return { ok: true }
}