import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function WasitLogPage() {
  // Ambil semua group matches yang sudah selesai dan ada refereeName
  const groupMatches = await prisma.groupMatch.findMany({
    where: { status: "DONE" },
    include: {
      group: {
        include: { tournament: { select: { id: true, name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const knockoutMatches = await prisma.knockoutMatch.findMany({
    where: { status: "DONE" },
    include: {
      tournament: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Log Pertandingan Wasit</h1>
          <p className="text-sm text-slate-500 mt-1">Rekam jejak wasit yang telah menginput skor.</p>
        </div>
        <Link
          href="/admin"
          className="text-sm px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Fase Grup */}
      <section>
        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          🏓 Fase Grup
          <span className="text-xs font-normal bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            {groupMatches.length} pertandingan
          </span>
        </h2>

        {groupMatches.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
            Belum ada data pertandingan grup yang selesai.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Turnamen</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Grup</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Pemain</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Skor</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Wasit</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groupMatches.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {m.group.tournament.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{m.group.name}</td>
                    <td className="px-4 py-3">
                      <span className={m.winnerName === m.player1Name ? "font-bold text-green-600" : "text-slate-700"}>
                        {m.player1Name}
                      </span>
                      <span className="text-slate-300 mx-1">vs</span>
                      <span className={m.winnerName === m.player2Name ? "font-bold text-green-600" : "text-slate-700"}>
                        {m.player2Name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                      {m.score1} – {m.score2}
                    </td>
                    <td className="px-4 py-3">
                      {m.refereeName ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                          🏁 {m.refereeName}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs italic">Tidak tercatat</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(m.updatedAt).toLocaleString("id-ID", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Fase Knockout */}
      <section>
        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          ⚔️ Fase Knockout
          <span className="text-xs font-normal bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            {knockoutMatches.filter(k => k.status === "DONE").length} pertandingan
          </span>
        </h2>

        {knockoutMatches.filter(k => k.status === "DONE").length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
            Belum ada data pertandingan knockout yang selesai.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Turnamen</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Babak</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Pemain</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Skor</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Wasit</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {knockoutMatches.filter(k => k.status === "DONE").map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-700 font-medium">{k.tournament.name}</td>
                    <td className="px-4 py-3 text-slate-500">{k.roundText}</td>
                    <td className="px-4 py-3">
                      <span className={k.winnerName === k.player1Name ? "font-bold text-green-600" : "text-slate-700"}>
                        {k.player1Name || "TBD"}
                      </span>
                      <span className="text-slate-300 mx-1">vs</span>
                      <span className={k.winnerName === k.player2Name ? "font-bold text-green-600" : "text-slate-700"}>
                        {k.player2Name || "TBD"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                      {k.score1} – {k.score2}
                    </td>
                    <td className="px-4 py-3">
                      {k.refereeName ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                          🏁 {k.refereeName}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs italic">Tidak tercatat</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(k.updatedAt).toLocaleString("id-ID", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
