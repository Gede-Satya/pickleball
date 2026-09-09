import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteContactButton from "./DeleteContactButton";

export const instant = false;

export default async function AdminContactPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Pesan Kontak</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Pesan yang dikirim pengunjung melalui halaman kontak.
          </p>
        </div>
        <Link
          href="/admin"
          className="bg-slate-900 dark:bg-slate-700 text-[#ffffff] px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Total pesan:
        </span>
        <span className="text-xs font-normal bg-primary/10 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-full">
          {contacts.length}
        </span>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-400 dark:text-slate-500">
          Belum ada pesan kontak masuk.
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700 px-6 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">
                      {c.nama}
                    </h3>
                    <a
                      href={`mailto:${c.email}`}
                      className="text-sm text-primary-700 dark:text-primary-400 hover:underline truncate"
                    >
                      {c.email}
                    </a>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {new Date(c.createdAt).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="shrink-0">
                  <DeleteContactButton id={c.id} />
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {c.pesan}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
