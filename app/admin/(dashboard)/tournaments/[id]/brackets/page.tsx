import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import BracketClient from "./BracketClient";

const prisma = new PrismaClient();

export default async function BracketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournamentId = Number(id);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      players: { orderBy: { seedOrder: "asc" } },
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

  // Ambil kategori unik dari pemain
  const categories = [
    ...new Set(tournament.players.map((p) => p.category).filter(Boolean)),
  ] as string[];

  return (
    <BracketClient
      tournament={tournament}
      initialGroups={tournament.groups}
      initialPlayers={tournament.players}
      initialKnockout={tournament.knockoutMatches}
      categories={categories}
    />
  );
}
