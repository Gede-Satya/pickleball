# Rencana: Deduplikasi UI Bagan & Pool

Status: **disetujui user, menunggu eksekusi** (keluar dari plan mode dulu).

## Tujuan

Kurangi duplikasi pola UI antara `BracketClient` (sistem legacy `TournamentGroup`) dan `PoolManagerClient` (sistem baru `Pool`). Dua sistem **tetap terpisah** — hanya komponen UI generik yang diekstrak. Tanpa perubahan logika bisnis, API, schema, atau auth.

## Komponen baru

### 1. `components/SearchInput.tsx` — "use client"
Props: `value`, `onChange`, `placeholder`, `variant: "light" | "dark"`, `resultCount?`, `containerClassName?`.
- Light: input slate, ikon 🔍 kiri, tombol "Reset (N peserta ditemukan)" kanan saat ada query.
- Dark: input white/10, ikon kuning/hijau sesuai gaya wasit.
- Default container: `relative w-full`; PoolManager pakai `relative w-full md:w-72`.

### 2. `components/EmptyState.tsx`
Props: `icon`, `title`, `description?` (ReactNode), `dashed?`.
- dashed=false: `bg-white border border-slate-200 rounded-2xl p-12 text-center`
- dashed=true: `bg-slate-50 border-dashed border-slate-300`
- Isi: ikon text-5xl, h2 font-bold, desc text-sm text-slate-500 max-w-md.

### 3. `components/Badge.tsx`
Props: `color: "emerald" | "amber" | "red" | "indigo" | "slate" | "purple" | "sky"`, `children`.
- Class: `shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold` + warna.

### 4. `components/LoadingOverlay.tsx`
Props: `text?` (default "Memproses...").
- Copy dari BracketClient (overlay z-[999] + spinner indigo).

## Perubahan file yang ada

### `app/admin/(dashboard)/tournaments/[id]/pools/PoolManagerClient.tsx`
- Import `Badge`, `EmptyState`, `SearchInput`.
- `PaymentBadge` → pakai `Badge` (emerald Lunas / amber Bayar di Tempat / red Belum Bayar).
- Empty state "Belum Ada Peserta" → `EmptyState`.
- Blok search (line 276-295) → `SearchInput` + resultCount.
- "Belum ada pool untuk kategori ini" → `EmptyState dashed`.
- Badge status pool (FULL/COMPLETED) → `Badge`.
- Badge SINGLE/TIM → `Badge`.

### `app/admin/(dashboard)/tournaments/[id]/brackets/BracketClient.tsx`
- Import `EmptyState`, `LoadingOverlay`.
- "Belum Ada Kategori" → `EmptyState`.
- "Belum ada grup..." → `EmptyState dashed` (description dengan `<strong>` label kategori).
- "Belum ada bagan gugur..." → `EmptyState dashed`.
- Loading overlay (line 752-759) → `<LoadingOverlay />`.
- Tab count badge TIDAK diubah (ukuran text-xs berbeda).

### `app/wasit/page.tsx`
- Import `SearchInput`.
- Blok search dark (line 408-414) → `<SearchInput variant="dark" .../>`.

## Tidak dilakukan (sengaja)
- Hook bersama add/remove/move member (endpoint beda, risiko regresi).
- ScoreModal bersama, GroupCard/PoolCard digabung (struktur beda).
- Migrasi BracketClient ke server actions.
- Bonus dedup category key di BracketClient (opsional, di luar scope yang disetujui).

## Verifikasi
1. `npx eslint` pada 7 file terkait (komponen baru tanpa `any`).
2. `npm run build`.
3. Cek manual: pools (search, badge, empty state), bagan (tab, empty state, overlay), wasit (search dark).
