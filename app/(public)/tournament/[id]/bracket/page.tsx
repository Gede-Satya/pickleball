import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import KnockoutBracketRender from "@/app/admin/(dashboard)/tournaments/[id]/brackets/KnockoutBracketRender";

const prisma = new PrismaClient();

export default async function PublicBracketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournamentId = Number(id);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      groups: {
        include: {
          members: { orderBy: { seedOrder: "asc" } },
          matches: { orderBy: { id: "asc" } },
        },
        orderBy: { id: "asc" },
      },
      knockoutMatches: { orderBy: { id: "asc" } },
    },
  });

  if (!tournament) return notFound();

  // Ambil kategori unik dari groups
  const categories = [
    ...new Set(tournament.groups.map((g) => g.category)),
  ] as string[];

  const categoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      single: "🏓 Single",
      double: "🏓🏓 Double",
      double_mix: "🏓🏓 Mixed Double",
    };
    return labels[cat] || cat;
  };

  if (tournament.groups.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href={`/tournament/${tournamentId}`}
            className="text-yellow-600 font-semibold text-sm hover:underline mb-6 inline-block"
          >
            &larr; Kembali ke Detail Turnamen
          </Link>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 mt-4">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Bagan Belum Tersedia
            </h2>
            <p className="text-slate-500">
              Bagan pertandingan untuk turnamen ini belum disusun oleh panitia.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`/tournament/${tournamentId}`}
          className="text-yellow-600 font-semibold text-sm hover:underline mb-6 inline-block"
        >
          &larr; Kembali ke Detail Turnamen
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
            🏆 Bagan {tournament.name}
          </h1>
          <p className="text-slate-500">
            Fase Grup (Round-Robin) — Hasil \u0026 Klasemen Terkini
          </p>
        </div>

        {categories.map((category) => {
          const categoryGroups = tournament.groups.filter(
            (g) => g.category === category
          );

          // Overall ranking for this category
          const allMembers = categoryGroups
            .flatMap((g) =>
              g.members
                .filter((m) => m.played > 0)
                .map((m) => ({ ...m, groupName: g.name }))
            )
            .sort((a, b) => {
              if (b.wins !== a.wins) return b.wins - a.wins;
              if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
              return b.pointsFor - a.pointsFor;
            });

          const categoryKnockouts = tournament.knockoutMatches.filter(
             (k) => k.category === category
          );

          return (
            <div key={category} className="mb-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                  {categoryLabel(category)}
                </span>
              </h2>

              {/* Groups */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {categoryGroups.map((group) => {
                  const sortedMembers = [...group.members].sort(
                    (a, b) => (a.rank || 99) - (b.rank || 99)
                  );

                  return (
                    <div
                      key={group.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3">
                        <h3 className="text-base font-bold text-white">
                          {group.name}
                        </h3>
                        <p className="text-indigo-200 text-xs">
                          {group.members.length} pemain
                        </p>
                      </div>

                      {/* Standings Table */}
                      {sortedMembers.some((m) => m.played > 0) && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="py-2.5 px-3 text-left font-bold">
                                  #
                                </th>
                                <th className="py-2.5 px-3 text-left font-bold">
                                  Pemain
                                </th>
                                <th className="py-2.5 px-2 text-center font-bold">
                                  M
                                </th>
                                <th className="py-2.5 px-2 text-center font-bold">
                                  K
                                </th>
                                <th className="py-2.5 px-2 text-center font-bold">
                                  PD
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {sortedMembers.map((member) => (
                                <tr
                                  key={member.id}
                                  className={
                                    member.rank === 1 ? "bg-yellow-50" : ""
                                  }
                                >
                                  <td className="py-2.5 px-3 font-bold text-slate-400">
                                    {member.rank === 1 && "🥇"}
                                    {member.rank === 2 && "🥈"}
                                    {member.rank === 3 && "🥉"}
                                    {(member.rank || 0) > 3 && member.rank}
                                    {!member.rank && "-"}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                                    {member.playerName}
                                  </td>
                                  <td className="py-2.5 px-2 text-center font-bold text-emerald-600">
                                    {member.wins}
                                  </td>
                                  <td className="py-2.5 px-2 text-center font-bold text-red-500">
                                    {member.losses}
                                  </td>
                                  <td
                                    className={`py-2.5 px-2 text-center font-bold ${
                                      member.pointDiff > 0
                                        ? "text-emerald-600"
                                        : member.pointDiff < 0
                                        ? "text-red-500"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {member.pointDiff > 0 ? "+" : ""}
                                    {member.pointDiff}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Match Results */}
                      <div className="p-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Hasil Pertandingan
                        </h4>
                        <div className="space-y-1.5">
                          {group.matches.map((match) => (
                            <div
                              key={match.id}
                              className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg ${
                                match.status === "DONE"
                                  ? "bg-emerald-50"
                                  : "bg-slate-50"
                              }`}
                            >
                              <span
                                className={`font-medium truncate flex-1 ${
                                  match.winnerName === match.player1Name
                                    ? "text-emerald-700 font-bold"
                                    : "text-slate-600"
                                }`}
                              >
                                {match.player1Name}
                              </span>
                              <span className="mx-2 font-bold text-slate-400 flex-shrink-0">
                                {match.status === "DONE"
                                  ? `${match.score1} - ${match.score2}`
                                  : "vs"}
                              </span>
                              <span
                                className={`font-medium truncate flex-1 text-right ${
                                  match.winnerName === match.player2Name
                                    ? "text-emerald-700 font-bold"
                                    : "text-slate-600"
                                }`}
                              >
                                {match.player2Name}
                              </span>
                            </div>
                          ))}
                          {group.matches.length === 0 && (
                            <p className="text-slate-400 text-xs text-center py-2">
                              Belum ada pertandingan
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall Ranking */}
              {allMembers.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4">
                    <h3 className="text-base font-bold text-white">
                      🏅 Ranking Keseluruhan — {categoryLabel(category)}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="py-3 px-4 text-left font-bold">
                            Rank
                          </th>
                          <th className="py-3 px-4 text-left font-bold">
                            Pemain
                          </th>
                          <th className="py-3 px-4 text-left font-bold">
                            Grup
                          </th>
                          <th className="py-3 px-3 text-center font-bold">M</th>
                          <th className="py-3 px-3 text-center font-bold">K</th>
                          <th className="py-3 px-3 text-center font-bold">
                            PD
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allMembers.map((member, idx) => (
                          <tr
                            key={member.id}
                            className={`${
                              idx === 0
                                ? "bg-yellow-50"
                                : idx === 1
                                ? "bg-slate-50/50"
                                : idx === 2
                                ? "bg-amber-50/30"
                                : ""
                            }`}
                          >
                            <td className="py-3 px-4 font-bold">
                              {idx === 0
                                ? "🥇"
                                : idx === 1
                                ? "🥈"
                                : idx === 2
                                ? "🥉"
                                : idx + 1}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              {member.playerName}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold">
                                {member.groupName}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-emerald-600">
                              {member.wins}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-red-500">
                              {member.losses}
                            </td>
                            <td
                              className={`py-3 px-3 text-center font-bold ${
                                member.pointDiff > 0
                                  ? "text-emerald-600"
                                  : member.pointDiff < 0
                                  ? "text-red-500"
                                  : "text-slate-400"
                              }`}
                            >
                              {member.pointDiff > 0 ? "+" : ""}
                              {member.pointDiff}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Knockout Bracket */}
              {categoryKnockouts.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 mt-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900">⚔️ Fase Knockout</h3>
                    <p className="text-sm text-slate-500">Bagan sistem gugur (Juara & Runner-Up grup).</p>
                  </div>
                  <div className="overflow-x-auto pb-8">
                    <div className="min-w-[800px] flex justify-start pl-4 py-8 relative">
                      <KnockoutBracketRender
                        matches={categoryKnockouts}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
