import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import type {
  AvailabilitySlot,
  DominantHand,
  Gender,
  PlayingObjective,
  PlayingStyle,
  PreferredFormat,
} from "@/domain/player/player.constants";
import { levelFromRating } from "@/domain/rating/rating.service";
import type { TennisLevel } from "@/domain/rating/rating.types";
import { LOGIN_PATH } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

export type Player = {
  id: string;
  displayName: string;
  photoUrl: string | null;
  areaId: string;
  areaName: string;
  gender: Gender | null;
  dominantHand: DominantHand | null;
  playingStyle: PlayingStyle;
  playingObjective: PlayingObjective;
  preferredFormat: PreferredFormat;
  availability: AvailabilitySlot[];
  rating: number;
  reliability: number;
  matchesCounted: number;
  level: TennisLevel;
};

/** Verified id of the signed-in user, or null. Deduped per request. */
export const getUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
});

export async function requireUserId(): Promise<string> {
  const userId = await getUserId();
  if (!userId) redirect(LOGIN_PATH);
  return userId;
}

type PlayerRow = {
  user_id: string;
  display_name: string;
  photo_url: string | null;
  area_id: string;
  gender: Gender | null;
  dominant_hand: DominantHand | null;
  playing_style: PlayingStyle;
  playing_objective: PlayingObjective;
  preferred_format: PreferredFormat;
  availability: AvailabilitySlot[];
  areas: { name: string } | null;
  player_ratings: { rating: number; reliability: number; matches_counted: number } | null;
};

/** The signed-in player's profile and rating, or null if not onboarded. */
export const getCurrentPlayer = cache(async (): Promise<Player | null> => {
  const userId = await requireUserId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "user_id, display_name, photo_url, area_id, gender, dominant_hand, playing_style, playing_objective, preferred_format, availability, areas(name), player_ratings(rating, reliability, matches_counted)",
    )
    .eq("user_id", userId)
    .maybeSingle<PlayerRow>();

  if (error) throw new Error(`Failed to load player: ${error.message}`);
  if (!data || !data.player_ratings) return null;

  const rating = Number(data.player_ratings.rating);
  return {
    id: data.user_id,
    displayName: data.display_name,
    photoUrl: data.photo_url,
    areaId: data.area_id,
    areaName: data.areas?.name ?? "",
    gender: data.gender,
    dominantHand: data.dominant_hand,
    playingStyle: data.playing_style,
    playingObjective: data.playing_objective,
    preferredFormat: data.preferred_format,
    availability: data.availability,
    rating,
    reliability: data.player_ratings.reliability,
    matchesCounted: data.player_ratings.matches_counted,
    level: levelFromRating(rating),
  };
});

/**
 * BR-001: every app page past onboarding needs a profile. Pages players land
 * on from outside (shared mabar links) pass `returnTo` so onboarding can send
 * them back.
 */
export async function requirePlayer(returnTo?: string): Promise<Player> {
  const player = await getCurrentPlayer();
  if (!player) redirect(returnTo ? `/onboarding?next=${encodeURIComponent(returnTo)}` : "/onboarding");
  return player;
}
