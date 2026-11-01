import "server-only";
import type { MabarFormat, MatchType } from "@/domain/mabar/mabar.types";
import type { MatchStatus, ResultStatus, ScoringFormat, Team } from "@/domain/match/match.constants";
import { APP_TIME_ZONE } from "@/domain/mabar/mabar.constants";
import { createClient } from "@/lib/supabase/server";

export type MatchPlayer = { userId: string; name: string; photoUrl: string | null };

export type MatchSet = {
  setNo: number;
  gamesA: number;
  gamesB: number;
  tiebreakA: number | null;
  tiebreakB: number | null;
  isMatchTiebreak: boolean;
};

export type MatchResultInfo = {
  winner: Team;
  status: ResultStatus;
  version: number;
  submittedBy: string;
  submittedAt: Date;
  deadline: Date | null;
  confirmedBy: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
};

export type MatchSummary = {
  id: string;
  mabarId: string;
  mabarTitle: string;
  organizerId: string;
  seqNo: number;
  status: MatchStatus;
  format: MabarFormat;
  matchType: MatchType;
  scoringFormat: ScoringFormat;
  startedAt: Date;
  completedAt: Date | null;
  playerIds: string[];
  teamA: MatchPlayer[];
  teamB: MatchPlayer[];
  sets: MatchSet[];
  result: MatchResultInfo | null;
};

type PlayerJson = { user_id: string; name: string; photo_url: string | null };
type SetJson = {
  set_no: number;
  games_a: number;
  games_b: number;
  tiebreak_a: number | null;
  tiebreak_b: number | null;
  is_match_tiebreak: boolean;
};

type OverviewRow = {
  match_id: string;
  mabar_id: string;
  mabar_title: string;
  organizer_id: string;
  seq_no: number;
  status: MatchStatus;
  format: MabarFormat;
  match_type: MatchType;
  scoring_format: ScoringFormat;
  started_at: string;
  completed_at: string | null;
  winner_team: Team | null;
  result_status: ResultStatus | null;
  result_version: number | null;
  submitted_by: string | null;
  submitted_at: string | null;
  confirm_deadline: string | null;
  confirmed_by: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  player_ids: string[];
  team_a: PlayerJson[];
  team_b: PlayerJson[];
  sets: SetJson[];
};

const toPlayer = (p: PlayerJson): MatchPlayer => ({ userId: p.user_id, name: p.name, photoUrl: p.photo_url });
export const toSet = (s: SetJson): MatchSet => ({
  setNo: s.set_no,
  gamesA: s.games_a,
  gamesB: s.games_b,
  tiebreakA: s.tiebreak_a,
  tiebreakB: s.tiebreak_b,
  isMatchTiebreak: s.is_match_tiebreak,
});

function toSummary(r: OverviewRow): MatchSummary {
  return {
    id: r.match_id,
    mabarId: r.mabar_id,
    mabarTitle: r.mabar_title,
    organizerId: r.organizer_id,
    seqNo: r.seq_no,
    status: r.status,
    format: r.format,
    matchType: r.match_type,
    scoringFormat: r.scoring_format,
    startedAt: new Date(r.started_at),
    completedAt: r.completed_at ? new Date(r.completed_at) : null,
    playerIds: r.player_ids,
    teamA: r.team_a.map(toPlayer),
    teamB: r.team_b.map(toPlayer),
    sets: r.sets.map(toSet),
    result:
      r.result_status && r.winner_team && r.submitted_by && r.submitted_at && r.result_version !== null
        ? {
            winner: r.winner_team,
            status: r.result_status,
            version: r.result_version,
            submittedBy: r.submitted_by,
            submittedAt: new Date(r.submitted_at),
            deadline: r.confirm_deadline ? new Date(r.confirm_deadline) : null,
            confirmedBy: r.confirmed_by,
            rejectedBy: r.rejected_by,
            rejectionReason: r.rejection_reason,
          }
        : null,
  };
}

const UUID = /^[0-9a-f-]{36}$/i;

export async function getSessionMatches(mabarId: string): Promise<MatchSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_overview")
    .select("*")
    .eq("mabar_id", mabarId)
    .order("seq_no", { ascending: false })
    .returns<OverviewRow[]>();
  if (error) throw new Error(`Failed to load matches: ${error.message}`);
  return data.map(toSummary);
}

export async function getMatch(matchId: string): Promise<MatchSummary | null> {
  if (!UUID.test(matchId)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("match_overview").select("*").eq("match_id", matchId).maybeSingle<OverviewRow>();
  if (error) throw new Error(`Failed to load match: ${error.message}`);
  return data ? toSummary(data) : null;
}

/** Competitive results this player can confirm: they played, someone else submitted. */
export async function getPendingConfirmations(userId: string): Promise<MatchSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_overview")
    .select("*")
    .eq("result_status", "PENDING")
    .contains("player_ids", [userId])
    .neq("submitted_by", userId)
    .order("submitted_at", { ascending: true })
    .returns<OverviewRow[]>();
  if (error) throw new Error(`Failed to load confirmations: ${error.message}`);
  return data.map(toSummary);
}

export type MyRatingChange = { before: number; after: number; delta: number };

export async function getRatingChange(matchId: string, userId: string): Promise<MyRatingChange | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rating_changes")
    .select("rating_before, rating_after, delta")
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .maybeSingle<{ rating_before: string; rating_after: string; delta: string }>();
  if (error) throw new Error(`Failed to load rating change: ${error.message}`);
  return data ? { before: Number(data.rating_before), after: Number(data.rating_after), delta: Number(data.delta) } : null;
}

// --- History -------------------------------------------------------------------------

export const HISTORY_FILTERS = ["ALL", "WINS", "LOSSES", "CASUAL", "COMPETITIVE", "SINGLES", "DOUBLES"] as const;
export type HistoryFilter = (typeof HISTORY_FILTERS)[number];
export const HISTORY_PAGE_SIZE = 10;

export type HistoryEntry = {
  matchId: string;
  mabarId: string;
  mabarTitle: string;
  venueName: string;
  team: Team;
  won: boolean;
  format: MabarFormat;
  matchType: MatchType;
  completedAt: Date;
  ratingDelta: number | null;
  ratingAfter: number | null;
  partnerNames: string[];
  opponentNames: string[];
  sets: MatchSet[];
};

type HistoryRow = {
  match_id: string;
  mabar_id: string;
  mabar_title: string;
  venue_name: string;
  team: Team;
  won: boolean;
  format: MabarFormat;
  match_type: MatchType;
  completed_at: string;
  rating_delta: string | null;
  rating_after: string | null;
  partner_names: string[];
  opponent_names: string[];
  sets: SetJson[];
};

const toHistory = (r: HistoryRow): HistoryEntry => ({
  matchId: r.match_id,
  mabarId: r.mabar_id,
  mabarTitle: r.mabar_title,
  venueName: r.venue_name,
  team: r.team,
  won: r.won,
  format: r.format,
  matchType: r.match_type,
  completedAt: new Date(r.completed_at),
  ratingDelta: r.rating_delta === null ? null : Number(r.rating_delta),
  ratingAfter: r.rating_after === null ? null : Number(r.rating_after),
  partnerNames: r.partner_names,
  opponentNames: r.opponent_names,
  sets: r.sets.map(toSet),
});

export async function getMatchHistory(
  userId: string,
  filter: HistoryFilter = "ALL",
  before?: string,
): Promise<{ items: HistoryEntry[]; nextCursor: string | null }> {
  const supabase = await createClient();
  let query = supabase.from("player_match_history").select("*").eq("user_id", userId);
  if (filter === "WINS") query = query.eq("won", true);
  if (filter === "LOSSES") query = query.eq("won", false);
  if (filter === "CASUAL" || filter === "COMPETITIVE") query = query.eq("match_type", filter);
  if (filter === "SINGLES" || filter === "DOUBLES") query = query.eq("format", filter);
  if (before && !Number.isNaN(Date.parse(before))) query = query.lt("completed_at", before);

  const { data, error } = await query
    .order("completed_at", { ascending: false })
    .limit(HISTORY_PAGE_SIZE + 1)
    .returns<HistoryRow[]>();
  if (error) throw new Error(`Failed to load history: ${error.message}`);

  const items = data.slice(0, HISTORY_PAGE_SIZE).map(toHistory);
  const nextCursor = data.length > HISTORY_PAGE_SIZE ? items.at(-1)!.completedAt.toISOString() : null;
  return { items, nextCursor };
}

// --- Stats -----------------------------------------------------------------------------

export type RatingPoint = { at: Date; rating: number };

export type PlayerStats = {
  matches: number;
  wins: number;
  losses: number;
  winRate: number | null;
  /** Oldest → newest, W/L of the last 10 completed matches. */
  recentForm: ("W" | "L")[];
  /** Rating after each counted match, starting from the rating before the first one. */
  ratingSeries: RatingPoint[];
  /** Net rating change since the start of the current month (WIB). */
  monthDelta: number;
};

function startOfMonthWib(now = new Date()): Date {
  const [y, m] = new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE, year: "numeric", month: "2-digit" })
    .format(now)
    .split("-");
  return new Date(`${y}-${m}-01T00:00:00+07:00`);
}

export async function getPlayerStats(userId: string): Promise<PlayerStats> {
  const supabase = await createClient();
  const [history, changes] = await Promise.all([
    supabase
      .from("player_match_history")
      .select("won, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(500)
      .returns<{ won: boolean; completed_at: string }[]>(),
    supabase
      .from("rating_changes")
      .select("rating_before, rating_after, delta, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(500)
      .returns<{ rating_before: string; rating_after: string; delta: string; created_at: string }[]>(),
  ]);
  if (history.error) throw new Error(`Failed to load stats: ${history.error.message}`);
  if (changes.error) throw new Error(`Failed to load rating history: ${changes.error.message}`);

  const wins = history.data.filter((h) => h.won).length;
  const matches = history.data.length;
  const monthStart = startOfMonthWib();
  const series: RatingPoint[] = [];
  if (changes.data.length > 0) {
    const first = changes.data[0]!;
    // Anchor just before the first counted match so the line starts at the old rating.
    series.push({ at: new Date(new Date(first.created_at).getTime() - 1), rating: Number(first.rating_before) });
    for (const c of changes.data) series.push({ at: new Date(c.created_at), rating: Number(c.rating_after) });
  }

  return {
    matches,
    wins,
    losses: matches - wins,
    winRate: matches > 0 ? Math.round((wins / matches) * 100) : null,
    recentForm: history.data
      .slice(0, 10)
      .reverse()
      .map((h) => (h.won ? "W" : "L")),
    ratingSeries: series,
    monthDelta:
      Math.round(
        changes.data.filter((c) => new Date(c.created_at) >= monthStart).reduce((sum, c) => sum + Number(c.delta), 0) * 100,
      ) / 100,
  };
}
