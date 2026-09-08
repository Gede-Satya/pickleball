'use server'

import { TournamentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { parseGradeOptionsPayload } from '@/lib/tournamentGrades'
import { requireAdminAction } from '@/lib/requireAdmin'
import { savePublicImageFile } from '@/lib/imageFile'

export async function createTournament(formData: FormData) {
  await requireAdminAction();
  const name = formData.get('name') as string
  const category = formData.get('category') as string // Ambil kategori
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const registrationFee = formData.get('registrationFee') as string
  const maxParticipants = formData.get('maxParticipants') as string
  const status = formData.get('status') as TournamentStatus
  const refereeCode = (formData.get('refereeCode') as string)?.trim() || null
  const isCodeActive = formData.get('isCodeActive') === 'on'

  // --- PROSES UPLOAD GAMBAR (validasi magic bytes + ukuran) ---
  const imageFile = formData.get('image') as File | null
  let imagePath: string | null = null // Default kosong

  // Jika admin memasukkan file gambar (ukurannya > 0)
  if (imageFile && imageFile.size > 0) {
    imagePath = await savePublicImageFile(imageFile, "")
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

  // Tingkat (grade) yang dipilih admin untuk turnamen ini
  const selectedGrades = parseGradeOptionsPayload(formData.getAll('grades') as string[])

  await prisma.tournament.create({
    data: {
      name,
      slug,
      category, // Simpan kategori
      image: imagePath, // Simpan path gambar ("/uploads/namafile.jpg")
      location,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationFee: parseInt(registrationFee) || 0,
      maxParticipants: parseInt(maxParticipants) || 0,
      gradeOptions: selectedGrades.length > 0 ? JSON.stringify(selectedGrades) : null,
      status,
      refereeCode,
      isCodeActive,
    }
  })

  revalidatePath('/admin/tournaments')
  redirect('/admin/tournaments')
}