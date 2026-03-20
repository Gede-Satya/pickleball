// app/(public)/articles/[id]/page.tsx
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Ambil ID dari URL
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // 2. Ambil artikel utama yang sedang dibaca
  const post = await prisma.post.findUnique({
    where: { id: id },
    include: { author: true },
  });

  // Jika tidak ada di database, lempar ke halaman 404
  if (!post) {
    return notFound();
  }

  // 3. Cari Artikel Sebelumnya (ID lebih kecil dari artikel saat ini)
  const prevPost = await prisma.post.findFirst({
    where: { 
      id: { lt: id },
      published: true 
    },
    orderBy: { id: 'desc' }, // Ambil yang paling mendekati ID saat ini
  });

  // 4. Cari Artikel Selanjutnya (ID lebih besar dari artikel saat ini)
  const nextPost = await prisma.post.findFirst({
    where: { 
      id: { gt: id },
      published: true 
    },
    orderBy: { id: 'asc' }, // Ambil yang paling mendekati ID saat ini
  });

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Container Utama Artikel */}
      <article className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Gambar Cover (Menyatu dengan batas atas container) */}
        {post.image && (
          <div className="w-full h-[300px] md:h-[450px] relative bg-slate-100">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Area Konten Dalam */}
        <div className="p-8 md:p-12 lg:p-16">
          
          {/* Tombol Kembali */}
          <Link 
            href="/articles" 
            className="inline-flex items-center text-sm font-semibold text-yellow-600 hover:text-yellow-700 mb-8 transition-colors"
          >
            &larr; Kembali ke Daftar Artikel
          </Link>

          {/* Header Artikel (Judul & Penulis) */}
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                {/* Avatar Dummy Sederhana */}
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
                  {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <strong className="text-slate-800">{post.author?.name || "Admin"}</strong>
              </div>
              <span>•</span>
              <time dateTime={post.createdAt.toISOString()}>
                {new Date(post.createdAt).toLocaleDateString("id-ID", { 
                  day: 'numeric', month: 'long', year: 'numeric' 
                })}
              </time>
            </div>
          </header>

          {/* Teks Isi Konten */}
          <div className="prose prose-lg prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed border-b border-slate-100 pb-16 mb-12">
            {post.content}
          </div>

          {/* Navigasi: Artikel Sebelumnya & Selanjutnya */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tombol Previous (Kiri) */}
            {prevPost ? (
              <Link 
                href={`/articles/${prevPost.id}`} 
                className="group p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-yellow-400 hover:shadow-md transition-all flex flex-col items-start text-left"
              >
                <span className="text-xs font-bold text-slate-400 group-hover:text-yellow-600 mb-2 uppercase tracking-wider">
                  &larr; Artikel Sebelumnya
                </span>
                <span className="font-semibold text-slate-900 line-clamp-2">
                  {prevPost.title}
                </span>
              </Link>
            ) : (
              <div></div> /* Spacer kosong jika tidak ada artikel sebelumnya */
            )}

            {/* Tombol Next (Kanan) */}
            {nextPost ? (
              <Link 
                href={`/articles/${nextPost.id}`} 
                className="group p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-yellow-400 hover:shadow-md transition-all flex flex-col items-end text-right"
              >
                <span className="text-xs font-bold text-slate-400 group-hover:text-yellow-600 mb-2 uppercase tracking-wider">
                  Artikel Selanjutnya &rarr;
                </span>
                <span className="font-semibold text-slate-900 line-clamp-2">
                  {nextPost.title}
                </span>
              </Link>
            ) : (
              <div></div> /* Spacer kosong jika tidak ada artikel selanjutnya */
            )}
          </div>

        </div>
      </article>
    </main>
  );
}