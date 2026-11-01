import type { MabarFormat } from "@/domain/mabar/mabar.types";
import { MIN_PLAYERS } from "@/domain/mabar/mabar.constants";

export type RotationSuggestion = { teamA: string[]; teamB: string[] };

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Fair-rotation helper: picks the players who have played the fewest matches
 * in this session (ties broken randomly) and splits them into two teams at
 * random. Rating-balanced teams are a later feature.
 */
export function suggestNextMatch(
  playerIds: string[],
  playedCounts: Record<string, number>,
  format: MabarFormat,
  random: () => number = Math.random,
): RotationSuggestion | null {
  const needed = MIN_PLAYERS[format];
  if (playerIds.length < needed) return null;

  const picked = shuffle(playerIds, random)
    .sort((x, y) => (playedCounts[x] ?? 0) - (playedCounts[y] ?? 0))
    .slice(0, needed);
  const teams = shuffle(picked, random);
  const half = needed / 2;
  return { teamA: teams.slice(0, half), teamB: teams.slice(half) };
}
