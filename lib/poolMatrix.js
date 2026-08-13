"use strict";
/**
 * lib/poolMatrix.ts
 * ============================================================
 * Bagan Grup (round-robin matrix) untuk satu pool.
 * Pure logic — tanpa import prisma/server, aman dipakai dari
 * client component.
 *
 * Matrix N x N: baris & kolom = anggota pool (urutan id asc,
 * kode sintetis "A1", "A2", ... dari poolCode + posisi).
 * Diagonal kosong, sel lain berisi skor "X–Y" (X = skor pemain
 * baris) plus penanda pemenang untuk highlight.
 *
 * Peringkat: jumlah menang → head-to-head (mini-league antar
 * member dengan menang sama) → selisih poin → poin for.
 * ============================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPoolMatrix = buildPoolMatrix;
exports.computeStandings = computeStandings;
/**
 * Susun matrix N x N dari member & match satu pool.
 * Posisi member TIDAK diubah — urutan input dianggap urutan kode
 * (page.tsx mengambil member dengan orderBy id asc, sama dengan
 * urutan generate round-robin).
 */
function buildPoolMatrix(args) {
    const members = args.members.map((m, i) => ({
        id: m.id,
        name: m.name,
        code: `${args.poolCode}${i + 1}`,
    }));
    const memberIndex = new Map();
    members.forEach((m, i) => memberIndex.set(m.id, i));
    // match lookup: pasangan (a,b) yang sudah DONE
    const matchByPair = new Map();
    for (const match of args.matches) {
        const a = memberIndex.get(match.member1Id);
        const b = memberIndex.get(match.member2Id);
        if (a === undefined || b === undefined)
            continue;
        const key = a < b ? `${a}:${b}` : `${b}:${a}`;
        matchByPair.set(key, match);
    }
    const cells = members.map((row, i) => members.map((col, j) => {
        if (i === j)
            return null; // diagonal
        const key = i < j ? `${i}:${j}` : `${j}:${i}`;
        const match = matchByPair.get(key);
        if (!match) {
            return {
                matchId: 0,
                rowScore: null,
                colScore: null,
                rowWins: false,
                status: 'SCHEDULED',
            };
        }
        const isRowAsP1 = match.member1Id === row.id;
        return {
            matchId: match.id,
            rowScore: isRowAsP1 ? match.score1 : match.score2,
            colScore: isRowAsP1 ? match.score2 : match.score1,
            rowWins: match.winnerId === row.id,
            status: match.status,
        };
    }));
    return {
        poolId: args.poolId,
        poolCode: args.poolCode,
        label: args.label,
        members,
        cells,
        standings: computeStandings(members, args.matches),
    };
}
/**
 * Hitung peringkat round-robin dari match yang sudah DONE.
 *
 * Urutan: jumlah menang desc → head-to-head (di antara member
 * dengan jumlah menang sama, dihitung mini-league: menang
 * intra-grup desc, lalu selisih poin intra-grup desc) → selisih
 * poin global desc → poin for desc.
 */
function computeStandings(members, matches) {
    const stats = new Map();
    for (const m of members) {
        stats.set(m.id, {
            played: 0,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            pointDiff: 0,
        });
    }
    const done = matches.filter((m) => m.status === 'DONE' && m.score1 !== null && m.score2 !== null);
    for (const match of done) {
        const a = stats.get(match.member1Id);
        const b = stats.get(match.member2Id);
        if (!a || !b)
            continue;
        a.played++;
        b.played++;
        a.pointsFor += match.score1;
        a.pointsAgainst += match.score2;
        b.pointsFor += match.score2;
        b.pointsAgainst += match.score1;
        if (match.winnerId === match.member1Id) {
            a.wins++;
            b.losses++;
        }
        else if (match.winnerId === match.member2Id) {
            b.wins++;
            a.losses++;
        }
    }
    for (const m of members) {
        const s = stats.get(m.id);
        s.pointDiff = s.pointsFor - s.pointsAgainst;
    }
    // Kelompokkan member dengan jumlah menang sama untuk tie-break head-to-head
    const groups = new Map();
    for (const m of members) {
        const wins = stats.get(m.id).wins;
        const group = groups.get(wins) ?? [];
        group.push(m.id);
        groups.set(wins, group);
    }
    const rows = [];
    const pushRow = (id) => {
        const s = stats.get(id);
        const member = members.find((m) => m.id === id);
        rows.push({
            rank: rows.length + 1,
            memberId: id,
            code: member.code,
            name: member.name,
            wins: s.wins,
            losses: s.losses,
            pointDiff: s.pointDiff,
            pointsFor: s.pointsFor,
        });
    };
    for (const wins of [...groups.keys()].sort((a, b) => b - a)) {
        const group = groups.get(wins);
        if (group.length === 1) {
            pushRow(group[0]);
            continue;
        }
        // Mini-league: hanya pertandingan antar member dalam grup ini
        const idSet = new Set(group);
        const sub = new Map();
        for (const id of group)
            sub.set(id, { wins: 0, pointDiff: 0 });
        for (const match of done) {
            if (!idSet.has(match.member1Id) || !idSet.has(match.member2Id))
                continue;
            const a = sub.get(match.member1Id);
            const b = sub.get(match.member2Id);
            if (match.winnerId === match.member1Id)
                a.wins++;
            else if (match.winnerId === match.member2Id)
                b.wins++;
            a.pointDiff += match.score1 - match.score2;
            b.pointDiff += match.score2 - match.score1;
        }
        const sorted = [...group].sort((a, b) => {
            const sa = sub.get(a);
            const sb = sub.get(b);
            if (sb.wins !== sa.wins)
                return sb.wins - sa.wins;
            if (sb.pointDiff !== sa.pointDiff)
                return sb.pointDiff - sa.pointDiff;
            const ga = stats.get(a);
            const gb = stats.get(b);
            if (gb.pointDiff !== ga.pointDiff)
                return gb.pointDiff - ga.pointDiff;
            return gb.pointsFor - ga.pointsFor;
        });
        for (const id of sorted)
            pushRow(id);
    }
    return rows;
}
