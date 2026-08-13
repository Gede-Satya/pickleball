# Rencana: Konsolidasi Knockout — Sumber Tunggal dari Pool

Status: **disetujui user (Setuju, eksekusi)** — menunggu keluar dari plan mode.

## Tujuan
- Knockout turnamen digenerate **satu jalur: dari pool** (bukan lagi dari grup legacy).
- Halaman Bagan admin: saat kategori punya pool → bagian grup legacy **disembunyikan**; tanpa pool → fallback legacy tetap tampil.
- Hasil generate dari pool langsung tampil di halaman Bagan admin (revalidatePath).

## Perubahan

### 1. `app/admin/(dashboard)/tournaments/[id]/brackets/page.tsx`
- Tambah query: `prisma.pool.findMany({ where: { tournamentId }, select: { categoryKey: true }, distinct: ["categoryKey"] })` → `poolCategories: string[]`
- Kirim sebagai prop baru ke `BracketClient`

### 2. `BracketClient.tsx`
- Props: tambah `poolCategories: string[]`; hitung `hasPool = poolCategories.includes(activeCategory)`
- **Saat `hasPool`:** sembunyikan "Buat Grup Baru", daftar grup, Overall Ranking legacy → ganti `EmptyState` info ("Kelola pool/klasemen di halaman Kelola Pool")
- Hapus tombol **"⚡ Generate Bracket Gugur"** & handler `handleGenerateKnockout` (satu jalur dari pool; `showConfirm` masih dipakai `handleGenerateMatches`)
- Bagian knockout: kondisi render `filteredGroups.length > 0` → `hasPool || filteredGroups.length > 0`
- Empty state knockout: teks → "Generate dari halaman Kelola Pool"
- Fallback (`!hasPool`): manajemen grup legacy tetap tampil (tanpa generate knockout)

### 3. `PoolManagerClient.tsx`
- Tombol **"⚡ Generate Bracket"** di header tiap kategori (samping "Generate Pertandingan"):
  - `disabled` bila `pending` atau `cat.pools.length === 0`
  - `showConfirm` → `fetch POST /api/tournaments/${tournament.id}/pools/${cat.pools[0].id}/bracket` (topN default 2)
  - `showSuccess/Error` dari respons; `router.refresh()`
  - Dibalut pola `run(...)` yang sudah ada (bungkus fetch → `{ success, error }`)

### 4. `app/api/tournaments/[id]/pools/[poolId]/bracket/route.ts` (POST)
- Setelah `buildBracket`: tambah `revalidatePath`:
  - `/admin/tournaments/${tournamentId}/brackets`
  - `/tournament/${tournamentId}/bracket`
  - `/tournament/${tournamentId}/schedule`

## Tidak diubah
- Schema/DB/migrasi
- Halaman wasit & public bracket (tetap legacy untuk sekarang)
- Input skor pool UI (tidak dijawab user → langkah lanjutan)

## Konsekuensi
- Turnamen tanpa pool tidak bisa generate knockout lagi via UI (harus buat pool dulu)

## Verifikasi
1. `npx eslint` 4 file terkait
2. `npm run build`
3. Manual: kategori ber-pool (hanya knockout+info) vs tanpa pool (fallback grup); generate dari pools → muncul di bagan