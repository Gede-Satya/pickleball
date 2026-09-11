// lib/rateLimit.ts
// Rate limiter in-memory yang reusable untuk berbagai endpoint.
// Catatan: in-memory berjalan per instance proses. Untuk skala horizontal,
// pindahkan ke penyimpanan shared (Redis/DB) jika diperlukan.
type Bucket = { count: number; firstAt: number }

const buckets = new Map<string, Bucket>()

type HeadersLike = { get?: (name: string) => string | null }

export function getClientIp(req?: { headers?: HeadersLike }): string {
  const fwd = req?.headers?.get?.('x-forwarded-for')
  if (fwd) {
    // Ambil IP terakhir — di chain proxy, IP paling kanan = true client
    const parts = fwd.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]
  }
  const realIp = req?.headers?.get?.('x-real-ip')
  return realIp || 'unknown'
}

function pruneExpired(now: number) {
  if (buckets.size > 1000) {
    for (const [key, record] of buckets) {
      if (now - record.firstAt > 60 * 60 * 1000) buckets.delete(key)
    }
  }
}

/**
 * Periksa apakah suatu aksi melebihi batas rate.
 * Mengembalikan `true` jika harus DITOLAK, `false` jika diizinkan.
 *
 * @param key   Kunci unik (mis. `ip:1.2.3.4` atau `phone:08xxx`).
 * @param maxAttempts  Jumlah izin maksimum dalam window.
 * @param windowMs     Durasi window (ms).
 */
export function isRateLimited(
  key: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const now = Date.now()
  pruneExpired(now)
  const record = buckets.get(key)
  if (!record || now - record.firstAt > windowMs) {
    buckets.set(key, { count: 1, firstAt: now })
    return false
  }
  record.count += 1
  return record.count > maxAttempts
}

export function resetAttempts(key: string) {
  buckets.delete(key)
}
