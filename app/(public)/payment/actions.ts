// app/(public)/payment/actions.ts
'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { savePaymentProofFile } from '@/lib/paymentProof'
import { isRateLimited } from '@/lib/rateLimit'

// Batasi pencarian pembayaran per IP: 5 request / 60 detik
const PAYMENT_LOOKUP_MAX = 5
const PAYMENT_LOOKUP_WINDOW_MS = 60 * 1000
// Batasi upload bukti per nomor HP: 3 upload / 1 jam
const PAYMENT_UPLOAD_MAX = 3
const PAYMENT_UPLOAD_WINDOW_MS = 60 * 60 * 1000

async function getRequestIp(): Promise<string> {
  try {
    const h = await headers()
    const fwd = h.get('x-forwarded-for')
    if (fwd) {
      const parts = fwd.split(',').map((s) => s.trim()).filter(Boolean)
      if (parts.length > 0) return parts[parts.length - 1]
    }
    return h.get('x-real-ip') || 'unknown'
  } catch {
    return 'unknown'
  }
}

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
  const ip = await getRequestIp()
  if (isRateLimited(`payment-lookup:${ip}`, PAYMENT_LOOKUP_MAX, PAYMENT_LOOKUP_WINDOW_MS)) {
    throw new Error("Terlalu banyak permintaan. Silakan tunggu beberapa saat.")
  }

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
  const phoneNumber = (formData.get('phoneNumber') as string)?.trim()

  if (!['player', 'team'].includes(type) || !id || !phoneNumber) {
    throw new Error("Data pendaftaran tidak valid")
  }

  // Batasi upload per nomor HP untuk mencegah spam/penyalahgunaan disk.
  if (isRateLimited(`payment-upload:${phoneNumber}`, PAYMENT_UPLOAD_MAX, PAYMENT_UPLOAD_WINDOW_MS)) {
    throw new Error("Terlalu banyak percobaan upload. Coba lagi nanti.")
  }

  const proof = await savePaymentProofFile(formData.get('paymentProof') as File | null)

  if (type === 'team') {
    // Verifikasi kepemilikan: minimal satu pemain dalam tim memakai nomor ini
    const team = await prisma.team.findUnique({
      where: { id },
      include: { players: { select: { phoneNumber: true } } },
    })
    if (!team || !team.players.some((p) => p.phoneNumber === phoneNumber)) {
      throw new Error("Bukti pembayaran hanya dapat diunggah oleh pemilik pendaftaran")
    }
    if (team.paymentStatus === 'PAID') {
      throw new Error("Pembayaran sudah dikonfirmasi oleh panitia")
    }
    await prisma.team.update({
      where: { id },
      data: { paymentProof: proof, paymentStatus: 'UNPAID' },
    })
  } else {
    const player = await prisma.player.findUnique({
      where: { id },
      select: { phoneNumber: true, paymentStatus: true },
    })
    if (!player || player.phoneNumber !== phoneNumber) {
      throw new Error("Bukti pembayaran hanya dapat diunggah oleh pemilik pendaftaran")
    }
    if (player.paymentStatus === 'PAID') {
      throw new Error("Pembayaran sudah dikonfirmasi oleh panitia")
    }
    await prisma.player.update({
      where: { id },
      data: { paymentProof: proof, paymentStatus: 'UNPAID' },
    })
  }

  revalidatePath('/payment')
  return { ok: true }
}
