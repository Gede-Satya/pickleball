// app/admin/clubs/actions.ts
'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

// Fungsi Tambah Klub
export async function createClub(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const contact = formData.get('contact') as string
  const logo = formData.get('logo') as string

  await prisma.club.create({
    data: { name, description, location, contact, logo }
  })

  revalidatePath('/admin/clubs')
  redirect('/admin/clubs')
}

// Fungsi Hapus Klub
export async function deleteClub(id: number) {
  await prisma.club.delete({
    where: { id }
  })
  revalidatePath('/admin/clubs')
}

// Fungsi Edit/Update Klub
export async function updateClub(id: number, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const contact = formData.get('contact') as string
  const logo = formData.get('logo') as string

  await prisma.club.update({
    where: { id },
    data: { name, description, location, contact, logo }
  })

  revalidatePath('/admin/clubs')
  redirect('/admin/clubs')
}