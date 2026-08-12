// app/(public)/payment/actions.ts
'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache'
import { savePaymentProofFile } from '@/lib/paymentProof'

export type PaymentLookupItem = {
  type: 'player' | 'team'
  id: number
  name: string
  tournamentName: string
  tournamentId: number
  registrationFee: number
  paymentStatus: string | null
  paymentMethod: string | null
  paymentProof: string | null
}

// Cari seluruh pendaftaran milik satu nomor WhatsApp
export async function lookupPayments(phoneNumber: string): Promise<PaymentLookupItem[]> {
  const phone = (phoneNumber || '').trim()
  if (!phone) {
    throw new Error("Masukkan nomor WhatsApp Anda")
  }

  const players = await prisma.player.findMany({
    where: { phoneNumber: phone },
    include: {
      tournament: { select: { id: true, name: true, registrationFee: true } },
      team: {
        select: {
          id: true,
          name: true,
          paymentStatus: true,
          paymentMethod: true,
          paymentProof: true,
        },
      },
    },
  })

  const items: PaymentLookupItem[] = []
  const seenTeams = new Set<number>()

  for (const p of players) {
    if (p.teamId && p.team) {
      if (seenTeams.has(p.teamId)) continue
      seenTeams.add(p.teamId)
      items.push({
        type: 'team',
        id: p.team.id,
        name: p.team.name,
        tournamentName: p.tournament.name,
        tournamentId: p.tournament.id,
        registrationFee: p.tournament.registrationFee,
        paymentStatus: p.team.paymentStatus,
        paymentMethod: p.team.paymentMethod,
        paymentProof: p.team.paymentProof,
      })
    } else {
      items.push({
        type: 'player',
        id: p.id,
        name: p.fullName,
        tournamentName: p.tournament.name,
        tournamentId: p.tournament.id,
        registrationFee: p.tournament.registrationFee,
        paymentStatus: p.paymentStatus,
        paymentMethod: p.paymentMethod,
        paymentProof: p.paymentProof,
      })
    }
  }

  return items
}

// Upload bukti pembayaran belakangan (status tetap UNPAID sampai dikonfirmasi panitia)
export async function uploadPaymentProof(formData: FormData) {
  const type = formData.get('type') as 'player' | 'team'
  const id = parseInt(formData.get('id') as string)

  if (!['player', 'team'].includes(type) || !id) {
    throw new Error("Data pendaftaran tidak valid")
  }

  const proof = await savePaymentProofFile(formData.get('paymentProof') as File | null)

  if (type === 'team') {
    await prisma.team.update({
      where: { id },
      data: { paymentProof: proof, paymentStatus: 'UNPAID' },
    })
  } else {
    await prisma.player.update({
      where: { id },
      data: { paymentProof: proof, paymentStatus: 'UNPAID' },
    })
  }

  revalidatePath('/payment')
  return { ok: true }
}
