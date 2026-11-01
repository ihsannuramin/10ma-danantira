import { isRatingInRange } from "@/domain/rating/rating.service";
import type { JoinCheckInput, JoinCheckResult, MabarStatus, MabarStatusInput } from "./mabar.types";

/**
 * Mirrors the SQL function public.mabar_effective_status. Keep both in sync.
 * A mabar that reaches its start time with every slot taken is LIVE until a
 * result completes it; one that starts short of players has EXPIRED.
 */
export function getEffectiveStatus(mabar: MabarStatusInput, now: Date = new Date()): MabarStatus {
  if (mabar.status === "CANCELLED") return "CANCELLED";
  if (mabar.status === "COMPLETED") return "COMPLETED";

  const isFull = mabar.participantCount >= mabar.maxPlayers;
  if (now >= mabar.startsAt) return isFull ? "LIVE" : "EXPIRED";
  return isFull ? "FULL" : "OPEN";
}

/**
 * Mirrors the checks (and their order) in the SQL function public.join_mabar,
 * which is authoritative. This copy drives the UI before the user taps Join.
 */
export function canJoin(input: JoinCheckInput, now: Date = new Date()): JoinCheckResult {
  if (!input.hasProfile || input.playerRating === null) return { ok: false, code: "PROFILE_REQUIRED" };

  const { mabar } = input;
  if (!mabar) return { ok: false, code: "MABAR_NOT_FOUND" };
  if (mabar.status === "CANCELLED") return { ok: false, code: "MABAR_CANCELLED" };
  if (mabar.status === "COMPLETED" || now >= mabar.startsAt) return { ok: false, code: "MABAR_STARTED" };
  if (mabar.isParticipant) return { ok: false, code: "ALREADY_JOINED" };
  if (mabar.participantCount >= mabar.maxPlayers) return { ok: false, code: "MABAR_FULL" };
  if (!isRatingInRange(input.playerRating, mabar.levelMin, mabar.levelMax)) {
    return { ok: false, code: "LEVEL_NOT_ELIGIBLE" };
  }
  return { ok: true };
}

export function slotsLeft(participantCount: number, maxPlayers: number): number {
  return Math.max(0, maxPlayers - participantCount);
}
