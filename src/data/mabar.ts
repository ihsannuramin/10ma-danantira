import "server-only";
import { LEVEL_MIN_RATING, TENNIS_LEVELS } from "@/domain/rating/rating.constants";
import type { TennisLevel } from "@/domain/rating/rating.types";
import { MABAR_FORMATS, MATCH_TYPES, SEARCH_PAGE_SIZE, TIME_SLOTS } from "@/domain/mabar/mabar.constants";
import type { MabarFormat, MabarStatus, MatchType, StoredMabarStatus } from "@/domain/mabar/mabar.types";
import { dateFilterRange } from "@/domain/mabar/schedule";
import { createClient } from "@/lib/supabase/server";

export type MabarListing = {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  format: MabarFormat;
  matchType: MatchType;
  startsAt: Date;
  endsAt: Date;
  venueId: string;
  venueName: string;
  areaId: string;
  areaName: string;
  levelMin: number;
  levelMax: number;
  maxPlayers: number;
  participantCount: number;
  costPerPlayer: number | null;
  description: string | null;
  status: StoredMabarStatus;
  effectiveStatus: MabarStatus;
};

type ListingRow = {
  id: string;
  organizer_id: string;
  organizer_name: string;
  title: string;
  format: MabarFormat;
  match_type: MatchType;
  starts_at: string;
  ends_at: string;
  venue_id: string;
  venue_name: string;
  area_id: string;
  area_name: string;
  level_min: number | string;
  level_max: number | string;
  max_players: number;
  participant_count: number;
  cost_per_player: number | null;
  description: string | null;
  status: StoredMabarStatus;
  effective_status: MabarStatus;
};

function toListing(row: ListingRow): MabarListing {
  return {
    id: row.id,
    organizerId: row.organizer_id,
    organizerName: row.organizer_name,
    title: row.title,
    format: row.format,
    matchType: row.match_type,
    startsAt: new Date(row.starts_at),
    endsAt: new Date(row.ends_at),
    venueId: row.venue_id,
    venueName: row.venue_name,
    areaId: row.area_id,
    areaName: row.area_name,
    levelMin: Number(row.level_min),
    levelMax: Number(row.level_max),
    maxPlayers: row.max_players,
    participantCount: row.participant_count,
    costPerPlayer: row.cost_per_player,
    description: row.description,
    status: row.status,
    effectiveStatus: row.effective_status,
  };
}

// --- Search -----------------------------------------------------------------

export type MabarFilters = {
  area?: string;
  date?: string;
  time?: keyof typeof TIME_SLOTS;
  level?: TennisLevel;
  format?: MabarFormat;
  type?: MatchType;
  q?: string;
  cursor?: string;
};

const isOneOf = <T extends string>(values: readonly T[], v: unknown): v is T =>
  typeof v === "string" && (values as readonly string[]).includes(v);

/** Untrusted query string → known filter values; anything else is dropped. */
export function parseMabarFilters(params: Record<string, string | string[] | undefined>): MabarFilters {
  const get = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);
  const uuid = /^[0-9a-f-]{36}$/i;
  const area = get("area");
  const date = get("date");
  const q = get("q")?.trim().slice(0, 60);
  return {
    area: area && uuid.test(area) ? area : undefined,
    date: date && dateFilterRange(date) ? date : undefined,
    time: isOneOf(Object.keys(TIME_SLOTS) as (keyof typeof TIME_SLOTS)[], get("time")) ? (get("time") as keyof typeof TIME_SLOTS) : undefined,
    level: isOneOf(TENNIS_LEVELS, get("level")) ? (get("level") as TennisLevel) : undefined,
    format: isOneOf(MABAR_FORMATS, get("format")) ? (get("format") as MabarFormat) : undefined,
    type: isOneOf(MATCH_TYPES, get("type")) ? (get("type") as MatchType) : undefined,
    q: q || undefined,
    cursor: get("cursor"),
  };
}

function levelBand(level: TennisLevel): { min: number; max: number | null } {
  const i = TENNIS_LEVELS.indexOf(level);
  const next = TENNIS_LEVELS[i + 1];
  return { min: LEVEL_MIN_RATING[level], max: next ? LEVEL_MIN_RATING[next] : null };
}

// Opaque keyset cursor: "<starts_at ISO>_<id>".
function encodeCursor(m: MabarListing): string {
  return `${m.startsAt.toISOString()}_${m.id}`;
}
function decodeCursor(cursor: string | undefined): { startsAt: string; id: string } | null {
  if (!cursor) return null;
  const [startsAt, id] = cursor.split("_");
  if (!startsAt || !id || Number.isNaN(Date.parse(startsAt))) return null;
  return { startsAt, id };
}

export async function searchMabars(
  filters: MabarFilters,
): Promise<{ items: MabarListing[]; nextCursor: string | null }> {
  const supabase = await createClient();
  const range = filters.date ? dateFilterRange(filters.date) : null;
  const band = filters.level ? levelBand(filters.level) : null;
  const after = decodeCursor(filters.cursor);

  const { data, error } = await supabase.rpc("search_mabars", {
      p_area_id: filters.area ?? null,
      p_from: range?.from.toISOString() ?? null,
      p_to: range?.to.toISOString() ?? null,
      p_time_slot: filters.time ?? null,
      p_level_min: band?.min ?? null,
      p_level_max: band?.max ?? null,
      p_format: filters.format ?? null,
      p_match_type: filters.type ?? null,
      p_query: filters.q ?? null,
      p_after_starts_at: after?.startsAt ?? null,
      p_after_id: after?.id ?? null,
      p_limit: SEARCH_PAGE_SIZE + 1,
    });
  if (error) throw new Error(`Failed to search mabar: ${error.message}`);

  // Untyped until `npm run db:types` generates the schema types.
  const rows = (data ?? []) as ListingRow[];
  const items = rows.slice(0, SEARCH_PAGE_SIZE).map(toListing);
  const nextCursor = rows.length > SEARCH_PAGE_SIZE ? encodeCursor(items.at(-1)!) : null;
  return { items, nextCursor };
}

// --- Own sessions ------------------------------------------------------------

export async function getMyMabars(scope: "upcoming" | "past"): Promise<MabarListing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_mabars", { p_scope: scope });
  if (error) throw new Error(`Failed to load my mabar: ${error.message}`);
  return ((data ?? []) as ListingRow[]).map(toListing);
}

// --- Detail -------------------------------------------------------------------

export type MabarParticipant = {
  userId: string;
  displayName: string;
  photoUrl: string | null;
  rating: number | null;
  joinedAt: Date;
};

export type MabarDetail = MabarListing & { participants: MabarParticipant[] };

type ParticipantRow = {
  user_id: string;
  joined_at: string;
  profiles: { display_name: string; photo_url: string | null; player_ratings: { rating: number | string } | null } | null;
};

export async function getMabarDetail(id: string): Promise<MabarDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();

  const [listing, participants] = await Promise.all([
    supabase.from("mabar_listings").select("*").eq("id", id).maybeSingle<ListingRow>(),
    supabase
      .from("mabar_participants")
      .select("user_id, joined_at, profiles(display_name, photo_url, player_ratings(rating))")
      .eq("mabar_id", id)
      .order("joined_at")
      .returns<ParticipantRow[]>(),
  ]);
  if (listing.error) throw new Error(`Failed to load mabar: ${listing.error.message}`);
  if (participants.error) throw new Error(`Failed to load participants: ${participants.error.message}`);
  if (!listing.data) return null;

  return {
    ...toListing(listing.data),
    participants: participants.data.map((p) => ({
      userId: p.user_id,
      displayName: p.profiles?.display_name ?? "Player",
      photoUrl: p.profiles?.photo_url ?? null,
      rating: p.profiles?.player_ratings ? Number(p.profiles.player_ratings.rating) : null,
      joinedAt: new Date(p.joined_at),
    })),
  };
}
