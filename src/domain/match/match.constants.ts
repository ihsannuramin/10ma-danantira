// Scoring presets an organizer picks per mabar. Researched from Indonesian
// mabar listings ("4 games"), local PELTI/PTWP tournaments (pro set) and
// ITF/ATP/WTA formats (best of 3, match tie-break in lieu of a third set).
export const SCORING_FORMATS = ["FAST4", "ONE_SET", "PRO_SET", "BEST_OF_3", "BEST_OF_3_MTB"] as const;

export type ScoringFormat = (typeof SCORING_FORMATS)[number];

export type ScoringRules = {
  /** Sets needed to win the match. */
  setsToWin: number;
  maxSets: number;
  /** Games that win a set. */
  games: number;
  /** Games-all score at which a 7-point tie-break decides the set. */
  tiebreakAt: number;
  /** The deciding set is a 10-point match tie-break. */
  decidingMatchTiebreak: boolean;
};

export const SCORING_RULES: Record<ScoringFormat, ScoringRules> = {
  FAST4: { setsToWin: 1, maxSets: 1, games: 4, tiebreakAt: 3, decidingMatchTiebreak: false },
  ONE_SET: { setsToWin: 1, maxSets: 1, games: 6, tiebreakAt: 6, decidingMatchTiebreak: false },
  PRO_SET: { setsToWin: 1, maxSets: 1, games: 8, tiebreakAt: 8, decidingMatchTiebreak: false },
  BEST_OF_3: { setsToWin: 2, maxSets: 3, games: 6, tiebreakAt: 6, decidingMatchTiebreak: false },
  BEST_OF_3_MTB: { setsToWin: 2, maxSets: 3, games: 6, tiebreakAt: 6, decidingMatchTiebreak: true },
};

export const SCORING_FORMAT_INFO: Record<ScoringFormat, { label: string; description: string }> = {
  FAST4: { label: "4 Games", description: "1 set cepat, first to 4, tie-break di 3-3. Pas buat mabar rotasi." },
  ONE_SET: { label: "1 Set", description: "1 set 6 games, tie-break di 6-6." },
  PRO_SET: { label: "Pro Set 8 Games", description: "First to 8 games, tie-break di 8-8. Umum di turnamen lokal." },
  BEST_OF_3: { label: "Best of 3", description: "Menang 2 dari 3 set, tie-break di 6-6. Format pro singles." },
  BEST_OF_3_MTB: { label: "2 Set + Super Tie-Break", description: "Kalau 1-1, set ketiga diganti tie-break 10 poin." },
};

export const DEUCE_RULES = ["ADVANTAGE", "NO_AD", "ONE_DEUCE"] as const;
export type DeuceRule = (typeof DEUCE_RULES)[number];

export const DEUCE_RULE_LABEL: Record<DeuceRule, string> = {
  ADVANTAGE: "Advantage",
  NO_AD: "No-Ad (sudden deuce)",
  ONE_DEUCE: "1x Deuce",
};

export const DEFAULT_SCORING_FORMAT: ScoringFormat = "ONE_SET";
export const DEFAULT_DEUCE_RULE: DeuceRule = "ADVANTAGE";

export const SET_TIEBREAK_POINTS = 7;
export const MATCH_TIEBREAK_POINTS = 10;

export const MATCH_STATUSES = ["LIVE", "PENDING_CONFIRMATION", "COMPLETED", "CANCELLED"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const RESULT_STATUSES = ["PENDING", "REJECTED", "CONFIRMED", "AUTO_CONFIRMED"] as const;
export type ResultStatus = (typeof RESULT_STATUSES)[number];

export type Team = "A" | "B";

/** Hours an opponent has to confirm before a competitive result becomes official. */
export const CONFIRM_WINDOW_HOURS = 24;
