// app/(public)/tournament/[id]/actions.ts
'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache'

import type { PaymentMethod, Gender, MatchType } from "@prisma/client";

import { buildCategoryInfo } from '@/lib/tournamentCategory'
import { parseTournamentGrades } from '@/lib/tournamentGrades'
import { savePaymentProofFile } from '@/lib/paymentProof'

// Validasi & simpan bukti pembayaran ke public/uploads/payments/
// Mengembalikan objek field pembayaran untuk create Player/Team.
async function buildPaymentFields(
  formData: FormData,
  registrationFee: number
): Promise<{
  paymentMethod: PaymentMethod | null;
  paymentStatus: 'UNPAID' | 'PAID' | null;
  paymentProof: string | null;
}> {
  if (registrationFee <= 0) {
    return { paymentMethod: null, paymentStatus: null, paymentProof: null };
  }

  const method = formData.get('paymentMethod') as string | null;
  const allowed: PaymentMethod[] = ['TRANSFER', 'QRIS', 'EWALLET', 'VENUE'];
  if (!method || !allowed.includes(method as PaymentMethod)) {
    throw new Error("Pilih metode pembayaran yang valid");
  }

  // Bayar di tempat: tanpa bukti, dikonfirmasi panitia saat hari-H
  if (method === 'VENUE') {
    return { paymentMethod: method as PaymentMethod, paymentStatus: 'UNPAID', paymentProof: null };
  }

  const proof = await savePaymentProofFile(formData.get('paymentProof') as File | null);

  return {
    paymentMethod: method as PaymentMethod,
    paymentStatus: 'UNPAID',
    paymentProof: proof,
  };
}

export async function registerPlayer(formData: FormData) {
  const tournamentId = parseInt(formData.get('tournamentId') as string)
  const fullName = formData.get('fullName') as string
  const schoolName = formData.get('schoolName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const gender = (formData.get('gender') as Gender) || 'MALE'
  const grade = (formData.get('grade') as string) || 'SMA'
  const matchType = (formData.get('matchType') as MatchType) || 'SINGLE'

  // Satu transaksi: player/team dicatat sebagai pendaftar.
  // Penempatan ke pool dilakukan panitia setelah TM/pengundian
  // melalui halaman admin kelola pool.
  await prisma.$transaction(async (tx) => {
    // Cek turnamen untuk ambil poolSize
    const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } })
    if (!tournament) throw new Error("Turnamen tidak ditemukan")

    // Validasi: tingkat harus termasuk yang dibuka admin untuk turnamen ini
    const allowedGrades = parseTournamentGrades(tournament.gradeOptions)
    if (!allowedGrades.includes(grade)) {
      throw new Error("Tingkat tidak tersedia untuk turnamen ini")
    }

    // Pembayaran: simpan metode + bukti transfer (UNPAID sampai dikonfirmasi panitia)
    const paymentFields = await buildPaymentFields(formData, tournament.registrationFee)

    // DOUBLE: buat 1 tim berisi 2 pemain dengan gender SAMA
    if (matchType === 'DOUBLE') {
      const namaPemain1 = formData.get('namaPemain1') as string
      const namaPemain2 = formData.get('namaPemain2') as string
      if (!namaPemain1 || !namaPemain2) {
        throw new Error("Nama kedua pemain wajib diisi")
      }

      const categoryInfo = buildCategoryInfo(grade, gender, 'DOUBLE')

      const team = await tx.team.create({
        data: {
          name: `${namaPemain1} & ${namaPemain2}`,
          matchType,
          grade,
          categoryKey: categoryInfo.key,
          tournamentId,
          paymentMethod: paymentFields.paymentMethod,
          paymentStatus: paymentFields.paymentStatus,
          paymentProof: paymentFields.paymentProof,
        },
      })

      await tx.player.create({
        data: {
          fullName: namaPemain1,
          gender,
          schoolName,
          phoneNumber,
          grade,
          matchType,
          tournamentId,
          teamId: team.id,
        },
      })

      await tx.player.create({
        data: {
          fullName: namaPemain2,
          gender,
          schoolName,
          phoneNumber,
          grade,
          matchType,
          tournamentId,
          teamId: team.id,
        },
      })

      return
    }

    // MIXED: buat 1 tim berisi 2 pemain (putra + putri) — konsisten
    // dengan alur admin (Team + Player ber-gender MALE/FEMALE).
    if (matchType === 'MIXED') {
      const namaPutra = formData.get('namaPutra') as string
      const namaPutri = formData.get('namaPutri') as string
      if (!namaPutra || !namaPutri) {
        throw new Error("Nama pemain putra dan putri wajib diisi")
      }

      const categoryInfo = buildCategoryInfo(grade, null, 'MIXED')

      const team = await tx.team.create({
        data: {
          name: `${namaPutra} & ${namaPutri}`,
          matchType,
          grade,
          categoryKey: categoryInfo.key,
          tournamentId,
          paymentMethod: paymentFields.paymentMethod,
          paymentStatus: paymentFields.paymentStatus,
          paymentProof: paymentFields.paymentProof,
        },
      })

      await tx.player.create({
        data: {
          fullName: namaPutra,
          gender: 'MALE',
          schoolName,
          phoneNumber,
          grade,
          matchType,
          tournamentId,
          teamId: team.id,
        },
      })

      await tx.player.create({
        data: {
          fullName: namaPutri,
          gender: 'FEMALE',
          schoolName,
          phoneNumber,
          grade,
          matchType,
          tournamentId,
          teamId: team.id,
        },
      })

      return
    }

    // Simpan data pendaftar ke tabel Player
    await tx.player.create({
      data: {
        fullName,
        schoolName,
        phoneNumber,
        tournamentId,
        gender,
        grade,
        matchType,
        paymentMethod: paymentFields.paymentMethod,
        paymentStatus: paymentFields.paymentStatus,
        paymentProof: paymentFields.paymentProof,
      }
    })
  })

  // Refresh halaman agar data terbaru termuat
  revalidatePath(`/tournament/${tournamentId}`)
  
  return { success: true }
}