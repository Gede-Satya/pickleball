import { Prisma } from "@prisma/client";

// Field turnamen yang AMAN untuk publik.
// JANGAN tambahkan refereeCode / isCodeActive / deletedAt di sini.
export const publicTournamentSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  location: true,
  category: true,
  image: true,
  startDate: true,
  endDate: true,
  registrationFee: true,
  prizePool: true,
  maxParticipants: true,
  poolSize: true,
  gradeOptions: true,
  status: true,
} satisfies Prisma.TournamentSelect;