"use client";

import React, { useState } from "react";
import { showWarning, showInfo, showConfirm } from "@/lib/swal";
import dynamic from "next/dynamic";
import type { KnockoutMatch } from "./BracketClient";
import { displayParticipantName, slotTokenToLabel } from "@/lib/bracketSlot";
import type {
  MatchComponentProps,
  MatchType,
  ParticipantType,
  SingleElimLeaderboardProps,
} from "@g-loot/react-tournament-brackets/dist/cjs/types";

// Gunakan dynamic import karena lib ini sering error kalau di render di server
const SingleEliminationBracket = dynamic(
  () =>
    import("@g-loot/react-tournament-brackets").then(
      (mod) => mod.SingleEliminationBracket as unknown as React.ComponentType<SingleElimLeaderboardProps>
    )
);

function CustomBracketMatch({
  bottomHovered,
  bottomParty,
  bottomText,
  bottomWon,
  match,
  onMatchClick,
  onMouseEnter,
  onMouseLeave,
  onPartyClick,
  topHovered,
  topParty,
  topText,
  topWon,
}: MatchComponentProps) {
  const isMatchClickable = Boolean(match?.href || typeof onMatchClick === "function");
  const isPartyClickable = typeof onPartyClick === "function";

  const handleScoreBoxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMatchClickable) {
      onMatchClick?.({
        match,
        topWon,
        bottomWon,
        event: e as unknown as React.MouseEvent<HTMLAnchorElement>,
      });
    }
  };

  const isDone = match?.state === "DONE";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "stretch",
        height: "100%",
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      {/* Top Header: Round name & Action button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "1.25rem",
          marginBottom: "0.25rem",
          padding: "0 2px",
          fontSize: "11px",
          color: "#94a3b8",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          {topText || ""}
        </span>
        {isMatchClickable && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMatchClick?.({
                match,
                topWon,
                bottomWon,
                event: e as unknown as React.MouseEvent<HTMLAnchorElement>,
              });
            }}
            style={{
              cursor: "pointer",
              background: isDone ? "rgba(16, 185, 129, 0.15)" : "rgba(56, 189, 248, 0.15)",
              color: isDone ? "#34d399" : "#38bdf8",
              border: `1px solid ${isDone ? "rgba(16, 185, 129, 0.3)" : "rgba(56, 189, 248, 0.3)"}`,
              borderRadius: "4px",
              padding: "1px 6px",
              fontWeight: 600,
              fontSize: "10px",
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              transition: "all 0.15s ease",
            }}
            title={isDone ? "Klik untuk melihat / reset skor" : "Klik untuk atur skor"}
          >
            {isDone ? "✓ Selesai" : "⚙️ Skor"}
          </button>
        )}
      </div>

      {/* Styled Match Box */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          justifyContent: "space-between",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.35)",
          border: topHovered || bottomHovered ? "1px solid #38bdf8" : "1px solid #1e293b",
          transition: "border-color 0.2s ease",
        }}
      >
        {/* Top Party Row */}
        <div
          onMouseEnter={() => onMouseEnter?.(topParty?.id)}
          onMouseLeave={onMouseLeave}
          onClick={() => isPartyClickable && onPartyClick?.(topParty, topWon)}
          style={{
            display: "flex",
            height: "50%",
            alignItems: "center",
            justifyContent: "space-between",
            background: topWon ? "#1e293b" : "#0f172a",
            borderLeft: `4px solid ${topHovered ? "#38bdf8" : topWon ? "#10b981" : "#334155"}`,
            borderBottom: "1px solid #1e293b",
            cursor: isPartyClickable ? "pointer" : "default",
            transition: "background 0.15s ease, border-color 0.15s ease",
          }}
          title={isPartyClickable ? "Klik untuk edit nama peserta" : undefined}
        >
          <div
            style={{
              paddingLeft: "10px",
              paddingRight: "8px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "12px",
              fontWeight: topWon ? 700 : 500,
              color: topWon ? "#f8fafc" : topHovered ? "#ffffff" : "#cbd5e1",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              flex: "1 1 auto",
            }}
          >
            {topWon && <span style={{ color: "#34d399", fontSize: "11px" }}>★</span>}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {topParty?.name || "-"}
            </span>
          </div>
          <div
            onClick={handleScoreBoxClick}
            style={{
              display: "flex",
              height: "100%",
              width: "44px",
              minWidth: "44px",
              alignItems: "center",
              justifyContent: "center",
              background: topWon ? "rgba(16, 185, 129, 0.18)" : "#0b0f19",
              borderLeft: "1px solid #1e293b",
              fontSize: "13px",
              fontWeight: 700,
              color: topWon ? "#34d399" : "#64748b",
              cursor: isMatchClickable ? "pointer" : "default",
            }}
            title={isMatchClickable ? "Klik untuk atur skor" : undefined}
          >
            {topParty?.resultText !== null && topParty?.resultText !== undefined
              ? topParty.resultText
              : "-"}
          </div>
        </div>

        {/* Bottom Party Row */}
        <div
          onMouseEnter={() => onMouseEnter?.(bottomParty?.id)}
          onMouseLeave={onMouseLeave}
          onClick={() => isPartyClickable && onPartyClick?.(bottomParty, bottomWon)}
          style={{
            display: "flex",
            height: "50%",
            alignItems: "center",
            justifyContent: "space-between",
            background: bottomWon ? "#1e293b" : "#0f172a",
            borderLeft: `4px solid ${bottomHovered ? "#38bdf8" : bottomWon ? "#10b981" : "#334155"}`,
            cursor: isPartyClickable ? "pointer" : "default",
            transition: "background 0.15s ease, border-color 0.15s ease",
          }}
          title={isPartyClickable ? "Klik untuk edit nama peserta" : undefined}
        >
          <div
            style={{
              paddingLeft: "10px",
              paddingRight: "8px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "12px",
              fontWeight: bottomWon ? 700 : 500,
              color: bottomWon ? "#f8fafc" : bottomHovered ? "#ffffff" : "#cbd5e1",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              flex: "1 1 auto",
            }}
          >
            {bottomWon && <span style={{ color: "#34d399", fontSize: "11px" }}>★</span>}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {bottomParty?.name || "-"}
            </span>
          </div>
          <div
            onClick={handleScoreBoxClick}
            style={{
              display: "flex",
              height: "100%",
              width: "44px",
              minWidth: "44px",
              alignItems: "center",
              justifyContent: "center",
              background: bottomWon ? "rgba(16, 185, 129, 0.18)" : "#0b0f19",
              borderLeft: "1px solid #1e293b",
              fontSize: "13px",
              fontWeight: 700,
              color: bottomWon ? "#34d399" : "#64748b",
              cursor: isMatchClickable ? "pointer" : "default",
            }}
            title={isMatchClickable ? "Klik untuk atur skor" : undefined}
          >
            {bottomParty?.resultText !== null && bottomParty?.resultText !== undefined
              ? bottomParty.resultText
              : "-"}
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          color: "#64748b",
          flex: "0 0 none",
          textAlign: "center",
          marginTop: "0.25rem",
          minHeight: "1.25rem",
          fontSize: "10px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {bottomText ?? " "}
      </div>
    </div>
  );
}

interface Props {
  matches: KnockoutMatch[];
  onUpdateScore?: (matchId: number, score1: string, score2: string) => void;
  onResetMatch?: (matchId: number) => void;
  onEditName?: (matchId: number, pNum: 1 | 2, currentName: string) => void;
}

type MappedParticipant = {
  id: string;
  resultText: string | null;
  isWinner?: boolean;
  status: null;
  name: string;
};

type MappedMatch = {
  id: number;
  name: string;
  nextMatchId: number | null;
  tournamentRoundText: string;
  startTime: string;
  state: "DONE" | "SCHEDULED";
  originalMatch: KnockoutMatch;
  participants: MappedParticipant[];
};

export default function KnockoutBracketRender({ matches, onUpdateScore, onResetMatch, onEditName }: Props) {
  const [activeMatch, setActiveMatch] = useState<MappedMatch | null>(null);
  const [tempScore1, setTempScore1] = useState("");
  const [tempScore2, setTempScore2] = useState("");

  // Map db matches to g-loot bracket format
  const mappedMatches: MappedMatch[] = matches.map((m) => {
    return {
      id: m.id,
      name: m.roundText,
      nextMatchId: m.nextMatchId,
      tournamentRoundText: m.roundText,
      startTime: "",
      state: m.status === "DONE" ? "DONE" : "SCHEDULED",
      originalMatch: m,
      participants: [
        {
          id: `p1-${m.id}`,
          resultText: m.score1 !== null ? String(m.score1) : null,
          isWinner: m.status === "DONE" && m.winnerName === m.player1Name,
          status: null,
          name: displayParticipantName(m.player1Name),
        },
        {
          id: `p2-${m.id}`,
          resultText: m.score2 !== null ? String(m.score2) : null,
          isWinner: m.status === "DONE" && m.winnerName === m.player2Name,
          status: null,
          name: displayParticipantName(m.player2Name),
        },
      ],
    };
  });

  const handleMatchClick = ({ match }: { match: MatchType; topWon: boolean; bottomWon: boolean }) => {
    // Kalau no-op (seperti di halaman publik read-only), hentikan interaksi
    if (!onResetMatch || !onUpdateScore) return;

    const clickedMatch = match;
    if (!clickedMatch || !clickedMatch.id) return;

    // Library sering kali membuang properti custom (originalMatch), cari manual pakai ID
    const matchData = mappedMatches.find((m) => String(m.id) === String(clickedMatch.id));
    if (!matchData) return;

    if (matchData.state === "DONE") {
       showConfirm(
         `Skor saat ini ${matchData.originalMatch.score1} - ${matchData.originalMatch.score2}. Reset pertandingan ini?`,
         'Reset Pertandingan?',
         'Ya, Reset!'
       ).then((confirmed) => {
         if (confirmed) onResetMatch?.(matchData.id);
       });
       return;
    }
    
    // Boleh isi skor kalau kedua pemain sudah jelas (bukan Menunggu/null/slot token)
    const p1Unset = !matchData.originalMatch.player1Name || slotTokenToLabel(matchData.originalMatch.player1Name) !== null;
    const p2Unset = !matchData.originalMatch.player2Name || slotTokenToLabel(matchData.originalMatch.player2Name) !== null;
    if (p1Unset || p2Unset) {
        showWarning("Peserta belum lengkap. Nama akan terisi otomatis setelah fase grup selesai.");
        return;
    }

    // Jika salah satu BYE, ini anomali (karena sistem otomatis mengisi kemenangan bye), 
    // tapi kalau terjadi, cegah edit skor
    if (matchData.originalMatch.player1Name === "BYE" || matchData.originalMatch.player2Name === "BYE") {
        showInfo("Peserta ini mendapat BYE (langsung lolos).", "Info Pertandingan");
        return;
    }

    setActiveMatch(matchData);
    setTempScore1("");
    setTempScore2("");
  };

 // 1. Definisikan komponen sebagai tipe bracket agar tidak error di JSX
  const BracketComponent = SingleEliminationBracket as unknown as React.ComponentType<SingleElimLeaderboardProps>;

  return (
    <div className="bracket-wrapper w-full">
      {/* 2. Panggil BracketComponent, bukan SingleEliminationBracket */}
      <BracketComponent
        matches={mappedMatches}
        matchComponent={CustomBracketMatch}
        svgWrapper={({ children }: { children: React.ReactNode }) => (
          <div>
            {children}
          </div>
        )}
        onMatchClick={handleMatchClick}
        onPartyClick={(party: ParticipantType) => {
           if (!onEditName) return;

           // Library sering kali menghilangkan properti custom seperti originalMatch,
           // jadi kita cari manual dari state mappedMatches berdasarkan party.id (yang unik)
           const foundMatch = mappedMatches.find(m => m.participants.some(p => p.id === party.id));
           if (foundMatch) {
               const isP1 = foundMatch.participants[0].id === party.id ? 1 : 2;
               onEditName(foundMatch.id, isP1, party.name ?? "");
           }
        }}
      />
      {/* Input Score Modal for Knockout */}
      {activeMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">
              Input Skor Pertandingan
            </h3>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex-1 text-center">
                <p className="font-bold text-slate-800 mb-3 text-sm">
                  {activeMatch.originalMatch.player1Name}
                </p>
                <input
                  type="number"
                  min="0"
                  value={tempScore1}
                  onChange={(e) => setTempScore1(e.target.value)}
                  className="w-20 h-16 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary block mx-auto"
                />
              </div>
              <span className="text-2xl font-bold text-slate-300 mt-6">VS</span>
              <div className="flex-1 text-center">
                <p className="font-bold text-slate-800 mb-3 text-sm">
                  {activeMatch.originalMatch.player2Name}
                </p>
                <input
                  type="number"
                  min="0"
                  value={tempScore2}
                  onChange={(e) => setTempScore2(e.target.value)}
                  className="w-20 h-16 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary block mx-auto"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveMatch(null)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                   onUpdateScore?.(activeMatch.id, tempScore1, tempScore2);
                   setActiveMatch(null);
                }}
                disabled={tempScore1 === "" || tempScore2 === "" || tempScore1 === tempScore2}
                className="flex-1 px-4 py-3 bg-primary text-[#ffffff] rounded-xl font-semibold hover:bg-primary-hover disabled:opacity-40 transition-all shadow-sm"
              >
                Simpan
              </button>
            </div>
            {tempScore1 !== "" && tempScore2 !== "" && tempScore1 === tempScore2 && (
               <p className="text-red-500 text-xs text-center mt-3">Skor tidak boleh seri di babak gugur.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
