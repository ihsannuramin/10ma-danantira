import {
  MATCH_TIEBREAK_POINTS,
  SCORING_RULES,
  SET_TIEBREAK_POINTS,
  type ScoringFormat,
  type ScoringRules,
  type Team,
} from "./match.constants";

/** One set as entered: games (or points, for a match tie-break) and optional tie-break points. */
export type SetInput = { a: number; b: number; tbA?: number | null; tbB?: number | null };

export type ValidSet = {
  setNo: number;
  gamesA: number;
  gamesB: number;
  tiebreakA: number | null;
  tiebreakB: number | null;
  isMatchTiebreak: boolean;
  winner: Team;
};

export type ScoreError = { set: number | null; message: string };

export type ScoreResult = { ok: true; winner: Team; sets: ValidSet[] } | { ok: false; errors: ScoreError[] };

const isCount = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0;

/** First to `target`, win by two; beyond the target the margin must be exactly two. */
function isValidTiebreak(winner: number, loser: number, target: number): boolean {
  if (winner < target || winner - loser < 2) return false;
  return winner === target || winner - loser === 2;
}

/** Message for a set score that cannot be final under these rules, or null when it can. */
function regularSetError(w: number, l: number, rules: ScoringRules): "invalid" | "needs-tiebreak" | null {
  const { games, tiebreakAt } = rules;
  if (tiebreakAt === games) {
    // Standard set: win by two, tie-break at games-all.
    if (w === games && l <= games - 2) return null;
    if (w === games + 1 && l === games - 1) return null;
    if (w === games + 1 && l === games) return "needs-tiebreak";
    return "invalid";
  }
  // Short set (Fast4): first to `games`, tie-break at (games-1)-all.
  if (w === games && l < tiebreakAt) return null;
  if (w === games && l === tiebreakAt) return "needs-tiebreak";
  return "invalid";
}

function describeValidSets(rules: ScoringRules): string {
  const { games, tiebreakAt } = rules;
  if (tiebreakAt === games) return `${games}-0 s/d ${games}-${games - 2}, ${games + 1}-${games - 1}, atau ${games + 1}-${games} dengan tie-break`;
  return `${games}-0 s/d ${games}-${tiebreakAt - 1}, atau ${games}-${tiebreakAt} dengan tie-break`;
}

/**
 * Validates a full match score against a scoring preset. The single source
 * of truth for score rules: the server action runs it before anything is
 * written, and the score editor runs it to show errors next to each set.
 */
export function validateScore(format: ScoringFormat, input: SetInput[]): ScoreResult {
  const rules = SCORING_RULES[format];
  const errors: ScoreError[] = [];
  const sets: ValidSet[] = [];
  const won = { A: 0, B: 0 };

  if (input.length === 0) return { ok: false, errors: [{ set: null, message: "Masukkan skor minimal 1 set." }] };
  if (input.length > rules.maxSets) {
    return { ok: false, errors: [{ set: null, message: `Format ini maksimal ${rules.maxSets} set.` }] };
  }

  input.forEach((raw, i) => {
    const setNo = i + 1;
    if (won.A === rules.setsToWin || won.B === rules.setsToWin) {
      errors.push({ set: setNo, message: `Match sudah selesai di set ${i}. Hapus set ${setNo}.` });
      return;
    }
    if (!isCount(raw.a) || !isCount(raw.b)) {
      errors.push({ set: setNo, message: `Set ${setNo}: skor harus angka bulat.` });
      return;
    }

    const isMatchTiebreak = rules.decidingMatchTiebreak && setNo === rules.maxSets;
    const winner: Team = raw.a > raw.b ? "A" : "B";
    const [w, l] = raw.a > raw.b ? [raw.a, raw.b] : [raw.b, raw.a];

    if (isMatchTiebreak) {
      if (!isValidTiebreak(w, l, MATCH_TIEBREAK_POINTS)) {
        errors.push({
          set: setNo,
          message: `Super tie-break: first to ${MATCH_TIEBREAK_POINTS}, menang selisih 2 (mis. 10-7, 12-10).`,
        });
        return;
      }
      sets.push({ setNo, gamesA: raw.a, gamesB: raw.b, tiebreakA: null, tiebreakB: null, isMatchTiebreak, winner });
      won[winner]++;
      return;
    }

    const problem = regularSetError(w, l, rules);
    if (problem === "invalid") {
      errors.push({ set: setNo, message: `Set ${setNo}: ${raw.a}-${raw.b} bukan skor akhir yang sah (${describeValidSets(rules)}).` });
      return;
    }

    let tiebreakA: number | null = null;
    let tiebreakB: number | null = null;
    if (problem === "needs-tiebreak") {
      const tbA = raw.tbA ?? null;
      const tbB = raw.tbB ?? null;
      if (!isCount(tbA) || !isCount(tbB)) {
        errors.push({ set: setNo, message: `Set ${setNo}: masukkan poin tie-break.` });
        return;
      }
      const [tw, tl] = winner === "A" ? [tbA, tbB] : [tbB, tbA];
      if (!isValidTiebreak(tw, tl, SET_TIEBREAK_POINTS)) {
        errors.push({
          set: setNo,
          message: `Set ${setNo}: tie-break first to ${SET_TIEBREAK_POINTS}, menang selisih 2, dan pemenangnya harus sama dengan pemenang set.`,
        });
        return;
      }
      tiebreakA = tbA;
      tiebreakB = tbB;
    }

    sets.push({ setNo, gamesA: raw.a, gamesB: raw.b, tiebreakA, tiebreakB, isMatchTiebreak, winner });
    won[winner]++;
  });

  if (errors.length > 0) return { ok: false, errors };
  if (won.A < rules.setsToWin && won.B < rules.setsToWin) {
    return { ok: false, errors: [{ set: null, message: "Belum ada pemenang. Tambahkan set berikutnya." }] };
  }
  return { ok: true, winner: won.A > won.B ? "A" : "B", sets };
}

/** Whether a regular set score at this point calls for tie-break points (drives the editor UI). */
export function setNeedsTiebreak(format: ScoringFormat, a: number, b: number): boolean {
  const rules = SCORING_RULES[format];
  const [w, l] = a > b ? [a, b] : [b, a];
  return regularSetError(w, l, rules) === "needs-tiebreak";
}

/** "6-4 4-6 10-7" style summary, with tie-break loser points in brackets: "7-6(4)". */
export function formatScoreLine(sets: Pick<ValidSet, "gamesA" | "gamesB" | "tiebreakA" | "tiebreakB">[], perspective: Team = "A"): string {
  return sets
    .map((s) => {
      const [mine, theirs] = perspective === "A" ? [s.gamesA, s.gamesB] : [s.gamesB, s.gamesA];
      const tb =
        s.tiebreakA !== null && s.tiebreakB !== null ? `(${Math.min(s.tiebreakA, s.tiebreakB)})` : "";
      return `${mine}-${theirs}${tb}`;
    })
    .join(" ");
}
