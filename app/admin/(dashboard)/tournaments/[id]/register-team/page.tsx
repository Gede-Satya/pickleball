import React from 'react'
import { PrismaClient } from '@prisma/client'
import RegistrationForm from './RegistrationForm'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function RegisterTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const tournamentId = parseInt(resolvedParams.id)

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  })

  if (!tournament) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Turnamen tidak ditemukan</h2>
      </div>
    )
  }

  // Fetch all players for this tournament who DO NOT have a team assigned YET 
  // Wait, if they are SINGLE, maybe they shouldn't be pulled if they are already in a single pool?
  // By getting players, we'll just get all players so admin knows who they are assigning.
  const players = await prisma.player.findMany({
    where: { tournamentId },
    orderBy: { fullName: 'asc' }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/tournaments/${tournamentId}/edit`} className="text-slate-500 hover:text-slate-900 transition-colors">
          ← Kembali ke Detail Turnamen
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/30">
            🤝
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Form Pendaftaran Tim & Kategori</h1>
            <p className="text-slate-500 text-sm mt-1">
              {tournament.name} — Pasangkan pemain untuk berlaga dalam turnamen.
            </p>
          </div>
        </div>
      </div>

      <RegistrationForm tournamentId={tournamentId} players={players} />

    </div>
  )
}
