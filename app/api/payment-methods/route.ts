import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/apiResponse'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { savePublicImageFile } from '@/lib/imageFile'


export async function GET() {
  const methods = await prisma.paymentMethodConfig.findMany({
    orderBy: { order: 'asc' },
  })
  return successResponse('Daftar metode pembayaran berhasil diambil', methods)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return errorResponse('Akses ditolak', 403, 'FORBIDDEN')
  }

  try {
    const formData = await request.formData()
    const method = formData.get('method') as string
    const label = formData.get('label') as string
    const imageFile = formData.get('image') as File | null

    if (!method || !label) {
      return errorResponse('Tipe metode dan label wajib diisi', 400, 'VALIDATION_ERROR')
    }

    let imageUrl: string | null = null
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await savePublicImageFile(imageFile, 'payment-methods')
      } catch (e) {
        return errorResponse(e instanceof Error ? e.message : 'Gambar tidak valid', 400, 'INVALID_IMAGE')
      }
    }

    const maxOrder = await prisma.paymentMethodConfig.aggregate({ _max: { order: true } })

    const created = await prisma.paymentMethodConfig.create({
      data: {
        method,
        label,
        image: imageUrl,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    })

    return successResponse('Metode pembayaran berhasil ditambahkan', created, 201)
  } catch {
    return errorResponse('Gagal menambahkan metode pembayaran', 500, 'SERVER_ERROR')
  }
}
