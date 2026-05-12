"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import KnockoutBracketRender from "./KnockoutBracketRender";
import { showError, showSuccess, showWarning, showConfirm, showDeleteConfirm } from "@/lib/swal";

// ============================================================
// TYPES
// ============================================================
interface Player {
  id: number;
  fullName: string;
  gender: string;
  grade: string;
  matchType: string;
  seedOrder: number | null;
}

interface GroupMember {
  id: number;
  groupId: number;
  playerName: string;
  seedOrder: number;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  rank: number | null;
}

interface GroupMatch {
  id: number;
  groupId: number;
  player1Name: string;
  player2Name: string;
  score1: number | null;
  score2: number | null;
  winnerName: string | null;
  status: string;
}

export interface KnockoutMatch {
  id: number;
  tournamentId: number;
  category: string;
  roundText: string;
  matchOrder: number;
  player1Name: string | null;
  player2Name: string | null;
  score1: number | null;
  score2: number | null;
  winnerName: string | null;
  nextMatchId: number | null;
  status: string;
}

interface TournamentGroup {
  id: number;
  name: string;
  category: string;
  tournamentId: number;
  members: GroupMember[];
  matches: GroupMatch[];
}

interface Tournament {
  id: number;
  name: string;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function BracketClient({
  tournament,
  initialGroups,
  initialPlayers,
  initialKnockout,
  categories,
}: {
  tournament: Tournament;
  initialGroups: TournamentGroup[];
  initialPlayers: Player[];
  initialKnockout: KnockoutMatch[];
  categories: string[];
}) {
  const router = useRouter();
  const [groups, setGroups] = useState<TournamentGroup[]>(initialGroups);
  const [players] = useState<Player[]>(initialPlayers);
  const [knockoutData, setKnockoutData] = useState<KnockoutMatch[]>(initialKnockout || []);
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0] || ""
  );
  const [loading, setLoading] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Modal state untuk input skor
  const [scoreModal, setScoreModal] = useState<{
    match: GroupMatch;
    groupId: number;
  } | null>(null);
  const [tempScore1, setTempScore1] = useState("");
  const [tempScore2, setTempScore2] = useState("");

  // Modal state untuk tambah member
  const [addMemberModal, setAddMemberModal] = useState<number | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState("");

  // Modal edit nama knockout
  const [editKnockoutName, setEditKnockoutName] = useState<{
    id: number;
    playerNum: 1 | 2;
    currentName: string;
  } | null>(null);
  const [tempKnockoutName, setTempKnockoutName] = useState("");

  // Filter groups & knockouts berdasarkan kategori aktif
  const filteredGroups = groups.filter((g) => g.category === activeCategory);

  // Pemain yang belum masuk grup manapun (per kategori aktif)
  const assignedNames = new Set(
    filteredGroups.flatMap((g) => g.members.map((m) => m.playerName))
  );
  const availablePlayers = players.filter((p) => {
    const playerCatKey =
      p.matchType === "MIXED"
        ? `${p.grade}_MIXED`
        : `${p.grade}_${p.gender}_${p.matchType}`;
    return playerCatKey === activeCategory && !assignedNames.has(p.fullName);
  });

  // ============================================================
  // FIX: refreshData dengan cache: "no-store" + router.refresh()
  // ============================================================
 const refreshData = useCallback(async () => {
  setLoading(true);
  router.refresh();
  try {
    const resG = await fetch(`/api/tournaments/${tournament.id}/brackets`, {
      cache: "no-store",
    });
    const dataG = await resG.json();
    if (dataG.data?.groups) setGroups(dataG.data.groups); // ← tambah .data

    const resK = await fetch(
      `/api/tournaments/${tournament.id}/brackets/knockout?category=${activeCategory}`,
      { cache: "no-store" }
    );
    const dataK = await resK.json();
    if (Array.isArray(dataK.data)) setKnockoutData(dataK.data); // ← tambah .data
  } catch (err) {
    console.error("Gagal refresh data:", err);
    showError("Gagal memuat data turnamen. Silakan periksa koneksi Anda.");
  } finally {
    setLoading(false);
  }
}, [tournament.id, activeCategory, router]);

  // ============================================================
  // FIX 2: Re-fetch otomatis saat ganti kategori
  // ============================================================
  useEffect(() => {
    if (!activeCategory) return;
    refreshData();
  }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps
  // Note: sengaja tidak taruh refreshData di dep array supaya tidak infinite loop.
  // activeCategory sudah cukup sebagai trigger.

  // ======================== GRUP ========================

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !activeCategory) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/brackets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName.trim(),
          category: activeCategory,
        }),
      });
      if (res.ok) {
        setNewGroupName("");
        await refreshData();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDeleteGroup = async (groupId: number) => {
    const confirmed = await showDeleteConfirm(
      "Hapus grup ini beserta semua data pertandingannya?"
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await fetch(`/api/tournaments/${tournament.id}/brackets`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      await refreshData();
      showSuccess("Grup berhasil dihapus!");
    } catch (err) {
      console.error(err);
      showError("Gagal menghapus grup.");
    }
    setLoading(false);
  };

  // ======================== MEMBER ========================

  const handleAddMember = async (groupId: number) => {
    if (!selectedPlayerName) return;
    setLoading(true);
    try {
      const currentMembers =
        groups.find((g) => g.id === groupId)?.members || [];
      const res = await fetch(
        `/api/tournaments/${tournament.id}/brackets/members`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId,
            playerName: selectedPlayerName,
            seedOrder: currentMembers.length + 1,
          }),
        }
      );
      if (res.ok) {
        setSelectedPlayerName("");
        setAddMemberModal(null);
        await refreshData();
      } else {
        const errorData = await res.json();
        showError(errorData.error || "Gagal menambahkan pemain");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRemoveMember = async (memberId: number) => {
    const confirmed = await showDeleteConfirm("Hapus pemain ini dari grup?");
    if (!confirmed) return;
    setLoading(true);
    try {
      await fetch(`/api/tournaments/${tournament.id}/brackets/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      await refreshData();
      showSuccess("Pemain berhasil dihapus dari grup!");
    } catch (err) {
      console.error(err);
      showError("Gagal menghapus pemain.");
    }
    setLoading(false);
  };

  const handleMoveMember = async (
    groupId: number,
    memberId: number,
    direction: "up" | "down"
  ) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    const sorted = [...group.members].sort((a, b) => a.seedOrder - b.seedOrder);
    const idx = sorted.findIndex((m) => m.id === memberId);
    if (
      (direction === "up" && idx === 0) ||
      (direction === "down" && idx === sorted.length - 1)
    )
      return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newMembers = sorted.map((m, i) => {
      if (i === idx) return { id: m.id, seedOrder: swapIdx + 1 };
      if (i === swapIdx) return { id: m.id, seedOrder: idx + 1 };
      return { id: m.id, seedOrder: i + 1 };
    });

    try {
      await fetch(`/api/tournaments/${tournament.id}/brackets/members`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: newMembers }),
      });
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // ======================== MATCH ========================

  const handleGenerateMatches = async (groupId: number) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.members.length < 2) {
      showWarning("Minimal 2 pemain dalam grup untuk generate pertandingan!");
      return;
    }
    if (group.matches.length > 0) {
      const confirmed = await showConfirm(
        "Ini akan mereset semua pertandingan dan statistik grup ini. Lanjutkan?",
        "Reset Pertandingan?",
        "Ya, Lanjutkan!"
      );
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      await fetch(`/api/tournaments/${tournament.id}/brackets/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      await refreshData();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openScoreModal = (match: GroupMatch, groupId: number) => {
    setScoreModal({ match, groupId });
    setTempScore1(match.score1?.toString() || "");
    setTempScore2(match.score2?.toString() || "");
  };

  const handleSubmitScore = async () => {
    if (!scoreModal || tempScore1 === "" || tempScore2 === "") return;
    setLoading(true);
    try {
      await fetch(`/api/tournaments/${tournament.id}/brackets/matches`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: scoreModal.match.id,
          score1: Number(tempScore1),
          score2: Number(tempScore2),
        }),
      });
      setScoreModal(null);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ======================== KNOCKOUT ========================

  const activeKnockouts = knockoutData.filter(
    (k) => k.category === activeCategory
  );

  const handleGenerateKnockout = async () => {
    const confirmed = await showConfirm(
      "Generate sistem gugur dari Juara dan Runner-Up grup? (Data knockout saat ini akan tertimpa)",
      "Generate Bracket Gugur?",
      "Ya, Generate!"
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await fetch(`/api/tournaments/${tournament.id}/brackets/knockout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: activeCategory }),
      });
      await refreshData();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const submitKnockoutScore = async (
    matchId: number,
    s1: string,
    s2: string
  ) => {
    if (!s1 || !s2) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tournaments/${tournament.id}/brackets/knockout`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId,
            score1: Number(s1),
            score2: Number(s2),
          }),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        showError(d.error || "Gagal update skor");
      }
      await refreshData();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleResetKnockoutMatch = async (matchId: number) => {
    const confirmed = await showConfirm(
      "Reset match ini?",
      "Reset Match?",
      "Ya, Reset!"
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await fetch(`/api/tournaments/${tournament.id}/brackets/knockout`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, reset: true }),
      });
      await refreshData();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const submitKnockoutNameEdit = async () => {
    if (!editKnockoutName) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = { matchId: editKnockoutName.id };
      if (editKnockoutName.playerNum === 1) body.player1Name = tempKnockoutName;
      if (editKnockoutName.playerNum === 2) body.player2Name = tempKnockoutName;

      await fetch(`/api/tournaments/${tournament.id}/brackets/knockout`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setEditKnockoutName(null);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ============================================================
  // LABEL
  // ============================================================
  const categoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      single: "🏓 Single",
      double: "🏓🏓 Double",
      double_mix: "🏓🏓 Mixed Double",
    };
    return labels[cat] || cat;
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            🏆 Bagan Turnamen
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {tournament.name} — Sistem Grup (Round-Robin) + Ranking
          </p>
        </div>
        <Link
          href="/admin/tournaments"
          className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all shadow-sm"
        >
          ← Kembali
        </Link>
      </div>

      {/* Category Tabs */}
      {categories.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Belum Ada Kategori
          </h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Belum ada pemain yang mendaftar ke turnamen ini. Pemain yang
            mendaftar akan otomatis muncul berdasarkan kategorinya.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* Create Group */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              Buat Grup Baru
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Nama grup, misal: Grup A"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
              />
              <button
                onClick={handleCreateGroup}
                disabled={loading || !newGroupName.trim()}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-sm"
              >
                + Tambah Grup
              </button>
            </div>
          </div>

          {/* Groups */}
          {filteredGroups.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <p className="text-slate-500">
                Belum ada grup untuk kategori{" "}
                <strong>{categoryLabel(activeCategory)}</strong>. Buat grup baru
                di atas.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  availablePlayers={availablePlayers}
                  loading={loading}
                  onDeleteGroup={handleDeleteGroup}
                  onAddMember={handleAddMember}
                  onRemoveMember={handleRemoveMember}
                  onMoveMember={handleMoveMember}
                  onGenerateMatches={handleGenerateMatches}
                  onOpenScoreModal={openScoreModal}
                  addMemberModal={addMemberModal}
                  setAddMemberModal={setAddMemberModal}
                  selectedPlayerName={selectedPlayerName}
                  setSelectedPlayerName={setSelectedPlayerName}
                />
              ))}
            </div>
          )}

          {/* Overall Ranking */}
          {filteredGroups.length > 0 && (
            <OverallRanking groups={filteredGroups} category={activeCategory} />
          )}

          {/* KNOCKOUT PHASE */}
          {filteredGroups.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    ⚔️ Fase Knockout (Sistem Gugur)
                  </h3>
                  <p className="text-sm text-slate-500">
                    Bagan gugur berdasarkan Juara & Runner-Up dari semua grup.
                  </p>
                </div>
                <button
                  onClick={handleGenerateKnockout}
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 shadow-sm"
                >
                  ⚡ Generate Bracket Gugur
                </button>
              </div>

              {activeKnockouts.length > 0 ? (
                <div className="overflow-x-auto pb-8">
                  <div className="min-w-[800px] flex justify-start pl-4 py-8 relative">
                    <KnockoutBracketRender
                      matches={activeKnockouts}
                      onUpdateScore={submitKnockoutScore}
                      onResetMatch={handleResetKnockoutMatch}
                      onEditName={(id, pNum, cur) => {
                        setEditKnockoutName({
                          id,
                          playerNum: pNum,
                          currentName: cur,
                        });
                        setTempKnockoutName(cur);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-500">
                    Belum ada bagan gugur. Selesaikan pertandingan grup, lalu
                    klik tombol Generate di atas.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Score Modal */}
      {scoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">
              Input Skor Pertandingan
            </h3>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex-1 text-center">
                <p className="font-bold text-slate-800 mb-3 text-sm">
                  {scoreModal.match.player1Name}
                </p>
                <input
                  type="number"
                  min="0"
                  value={tempScore1}
                  onChange={(e) => setTempScore1(e.target.value)}
                  className="w-20 h-16 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mx-auto block"
                  autoFocus
                />
              </div>
              <span className="text-2xl font-bold text-slate-300 mt-6">VS</span>
              <div className="flex-1 text-center">
                <p className="font-bold text-slate-800 mb-3 text-sm">
                  {scoreModal.match.player2Name}
                </p>
                <input
                  type="number"
                  min="0"
                  value={tempScore2}
                  onChange={(e) => setTempScore2(e.target.value)}
                  className="w-20 h-16 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mx-auto block"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setScoreModal(null)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitScore}
                disabled={loading || tempScore1 === "" || tempScore2 === ""}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-sm"
              >
                {loading ? "Menyimpan..." : "Simpan Skor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Name Modal */}
      {editKnockoutName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">
              Edit Nama Pemain
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              Ubah manual nama pemain di bagan
            </p>
            <input
              type="text"
              value={tempKnockoutName}
              onChange={(e) => setTempKnockoutName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && submitKnockoutNameEdit()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setEditKnockoutName(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-semibold"
              >
                Batal
              </button>
              <button
                onClick={submitKnockoutNameEdit}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIX 3: Loading overlay dipindah ke luar modal supaya selalu tampil */}
      {loading && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white px-6 py-5 rounded-2xl shadow-xl flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">Memproses...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// GROUP CARD COMPONENT
// ============================================================
function GroupCard({
  group,
  availablePlayers,
  loading,
  onDeleteGroup,
  onAddMember,
  onRemoveMember,
  onMoveMember,
  onGenerateMatches,
  onOpenScoreModal,
  addMemberModal,
  setAddMemberModal,
  selectedPlayerName,
  setSelectedPlayerName,
}: {
  group: TournamentGroup;
  availablePlayers: Player[];
  loading: boolean;
  onDeleteGroup: (id: number) => void;
  onAddMember: (groupId: number) => void;
  onRemoveMember: (memberId: number) => void;
  onMoveMember: (groupId: number, memberId: number, dir: "up" | "down") => void;
  onGenerateMatches: (groupId: number) => void;
  onOpenScoreModal: (match: GroupMatch, groupId: number) => void;
  addMemberModal: number | null;
  setAddMemberModal: (id: number | null) => void;
  selectedPlayerName: string;
  setSelectedPlayerName: (name: string) => void;
}) {
  const sortedMembers = [...group.members].sort(
    (a, b) => a.seedOrder - b.seedOrder
  );
  const completedMatches = group.matches.filter(
    (m) => m.status === "DONE"
  ).length;
  const totalMatches = group.matches.length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Group Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{group.name}</h3>
          <p className="text-indigo-200 text-xs mt-0.5">
            {group.members.length} pemain •{" "}
            {totalMatches > 0
              ? `${completedMatches}/${totalMatches} match selesai`
              : "Belum ada pertandingan"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onGenerateMatches(group.id)}
            disabled={loading || group.members.length < 2}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs font-semibold hover:bg-white/30 disabled:opacity-40 transition-all"
            title="Generate ulang match round-robin"
          >
            ⚡ Generate Match
          </button>
          <button
            onClick={() => onDeleteGroup(group.id)}
            className="px-3 py-2 bg-red-500/20 backdrop-blur-sm text-red-100 rounded-lg text-xs font-semibold hover:bg-red-500/40 transition-all"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Members / Seeding List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Daftar Pemain (Seeding)
            </h4>
            <button
              onClick={() => {
                setAddMemberModal(group.id);
                setSelectedPlayerName("");
              }}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-all"
            >
              + Tambah Pemain
            </button>
          </div>

          {sortedMembers.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center border border-dashed border-slate-200 rounded-xl">
              Belum ada pemain. Klik &ldquo;Tambah Pemain&rdquo; untuk memulai.
            </p>
          ) : (
            <div className="space-y-1.5">
              {sortedMembers.map((member, idx) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 group hover:bg-indigo-50 transition-colors"
                >
                  <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1 font-medium text-slate-800 text-sm">
                    {member.playerName}
                  </span>
                  {member.played > 0 && (
                    <span className="text-xs text-slate-400">
                      {member.wins}W {member.losses}L | PD:{" "}
                      {member.pointDiff > 0 ? "+" : ""}
                      {member.pointDiff}
                    </span>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onMoveMember(group.id, member.id, "up")}
                      disabled={idx === 0}
                      className="w-6 h-6 bg-white border border-slate-200 rounded text-xs flex items-center justify-center hover:bg-slate-100 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => onMoveMember(group.id, member.id, "down")}
                      disabled={idx === sortedMembers.length - 1}
                      className="w-6 h-6 bg-white border border-slate-200 rounded text-xs flex items-center justify-center hover:bg-slate-100 disabled:opacity-30"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="w-6 h-6 bg-red-50 border border-red-200 text-red-500 rounded text-xs flex items-center justify-center hover:bg-red-100"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Member Dropdown (inline) */}
          {addMemberModal === group.id && (
            <div className="mt-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex gap-2">
                <select
                  value={selectedPlayerName}
                  onChange={(e) => setSelectedPlayerName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Pemain --</option>
                  {availablePlayers.map((p) => (
                    <option key={p.id} value={p.fullName}>
                      {p.fullName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => onAddMember(group.id)}
                  disabled={!selectedPlayerName || loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-all"
                >
                  Tambah
                </button>
                <button
                  onClick={() => setAddMemberModal(null)}
                  className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
              </div>
              {availablePlayers.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Semua pemain di kategori ini sudah masuk ke dalam grup.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Matches */}
        {group.matches.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              Pertandingan Round-Robin
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {group.matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => onOpenScoreModal(match, group.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all hover:shadow-md ${
                    match.status === "DONE"
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-white border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className={`text-sm font-semibold truncate ${
                        match.winnerName === match.player1Name
                          ? "text-emerald-700"
                          : "text-slate-700"
                      }`}
                    >
                      {match.player1Name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mx-2">
                    {match.status === "DONE" ? (
                      <span className="font-bold text-sm">
                        <span
                          className={
                            match.winnerName === match.player1Name
                              ? "text-emerald-700"
                              : "text-slate-400"
                          }
                        >
                          {match.score1}
                        </span>
                        <span className="text-slate-300 mx-1">-</span>
                        <span
                          className={
                            match.winnerName === match.player2Name
                              ? "text-emerald-700"
                              : "text-slate-400"
                          }
                        >
                          {match.score2}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-indigo-500 font-semibold px-2 py-1 bg-indigo-50 rounded-lg">
                        Input Skor
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                    <span
                      className={`text-sm font-semibold truncate text-right ${
                        match.winnerName === match.player2Name
                          ? "text-emerald-700"
                          : "text-slate-700"
                      }`}
                    >
                      {match.player2Name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Standings / Ranking di dalam grup */}
        {group.members.some((m) => m.played > 0) && (
          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              📊 Klasemen {group.name}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 text-left font-bold">#</th>
                    <th className="py-3 px-4 text-left font-bold">Pemain</th>
                    <th className="py-3 px-3 text-center font-bold">Main</th>
                    <th className="py-3 px-3 text-center font-bold">M</th>
                    <th className="py-3 px-3 text-center font-bold">K</th>
                    <th className="py-3 px-3 text-center font-bold">PF</th>
                    <th className="py-3 px-3 text-center font-bold">PA</th>
                    <th className="py-3 px-3 text-center font-bold">PD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...group.members]
                    .sort((a, b) => (a.rank || 99) - (b.rank || 99))
                    .map((member) => (
                      <tr
                        key={member.id}
                        className={`${
                          member.rank === 1
                            ? "bg-yellow-50"
                            : member.rank === 2
                            ? "bg-slate-50"
                            : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-400">
                          {member.rank || "-"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {member.rank === 1 && "🥇 "}
                          {member.rank === 2 && "🥈 "}
                          {member.rank === 3 && "🥉 "}
                          {member.playerName}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600">
                          {member.played}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-600">
                          {member.wins}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-red-500">
                          {member.losses}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600">
                          {member.pointsFor}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600">
                          {member.pointsAgainst}
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
      </div>
    </div>
  );
}

// ============================================================
// OVERALL RANKING COMPONENT
// ============================================================
function OverallRanking({
  groups,
  category,
}: {
  groups: TournamentGroup[];
  category: string;
}) {
  const allMembers = groups.flatMap((g) =>
    g.members
      .filter((m) => m.played > 0)
      .map((m) => ({ ...m, groupName: g.name }))
  );

  if (allMembers.length === 0) return null;

  const ranked = [...allMembers].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
    return b.pointsFor - a.pointsFor;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4">
        <h3 className="text-lg font-bold text-white">
          🏅 Ranking Keseluruhan — {category}
        </h3>
        <p className="text-yellow-100 text-xs mt-0.5">
          Peringkat gabungan dari semua grup berdasarkan kemenangan dan selisih
          poin
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="py-3 px-4 text-left font-bold">Rank</th>
              <th className="py-3 px-4 text-left font-bold">Pemain</th>
              <th className="py-3 px-4 text-left font-bold">Grup</th>
              <th className="py-3 px-3 text-center font-bold">Main</th>
              <th className="py-3 px-3 text-center font-bold">M</th>
              <th className="py-3 px-3 text-center font-bold">K</th>
              <th className="py-3 px-3 text-center font-bold">PF</th>
              <th className="py-3 px-3 text-center font-bold">PA</th>
              <th className="py-3 px-3 text-center font-bold">PD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ranked.map((member, idx) => (
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
                } hover:bg-indigo-50 transition-colors`}
              >
                <td className="py-3 px-4 font-bold">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-800">
                  {member.playerName}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold">
                    {member.groupName}
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  {member.played}
                </td>
                <td className="py-3 px-3 text-center font-bold text-emerald-600">
                  {member.wins}
                </td>
                <td className="py-3 px-3 text-center font-bold text-red-500">
                  {member.losses}
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  {member.pointsFor}
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  {member.pointsAgainst}
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
  );
}
