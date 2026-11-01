"use server";

import { refresh } from "next/cache";
import { getUserId } from "@/data/auth";
import { getMatch } from "@/data/match";
import type { ResultStatus } from "@/domain/match/match.constants";
import { validateScore, type ScoreError, type SetInput } from "@/domain/match/scoring";
import { fromSupabaseError, userError, type ActionResult } from "@/lib/errors";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;
const isUuidList = (ids: unknown): ids is string[] => Array.isArray(ids) && ids.every((id) => typeof id === "string" && UUID.test(id));

type ScoreActionResult<T> = ActionResult<T> | { ok: false; error: ReturnType<typeof userError>; scoreErrors: ScoreError[] };

async function requireUser(): Promise<string | ActionResult<never>> {
  const userId = await getUserId();
  return userId ?? { ok: false, error: userError("NOT_AUTHENTICATED") };
}

export async function startMatch(mabarId: string, teamA: string[], teamB: string[]): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  if (typeof user !== "string") return user;
  if (!UUID.test(mabarId) || !isUuidList(teamA) || !isUuidList(teamB)) {
    return { ok: false, error: userError("TEAM_SIZE_INVALID") };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_match", { p_mabar_id: mabarId, p_team_a: teamA, p_team_b: teamB });
  if (error) return { ok: false, error: fromSupabaseError(error, "startMatch") };
  refresh();
  return { ok: true, data: { id: data as string } };
}

export async function cancelMatch(matchId: string): Promise<ActionResult> {
  return runPlayerCommand("cancel_match", { p_match_id: matchId }, matchId);
}

export async function confirmMatchResult(matchId: string): Promise<ActionResult> {
  return runPlayerCommand("confirm_match_result", { p_match_id: matchId }, matchId);
}

export async function rejectMatchResult(matchId: string, reason: string): Promise<ActionResult> {
  return runPlayerCommand("reject_match_result", { p_match_id: matchId, p_reason: String(reason ?? "").slice(0, 200) }, matchId);
}

export async function endMabar(mabarId: string): Promise<ActionResult> {
  return runPlayerCommand("end_mabar", { p_mabar_id: mabarId }, mabarId);
}

async function runPlayerCommand(fn: string, args: Record<string, unknown>, id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (typeof user !== "string") return user;
  if (!UUID.test(id)) return { ok: false, error: userError("MATCH_NOT_FOUND") };

  const supabase = await createClient();
  const { error } = await supabase.rpc(fn, args);
  if (error) return { ok: false, error: fromSupabaseError(error, fn) };
  refresh();
  return { ok: true, data: undefined };
}

function toSetJson(sets: SetInput[]) {
  return sets.map((s, i) => ({
    set_no: i + 1,
    games_a: s.a,
    games_b: s.b,
    tiebreak_a: s.tbA ?? null,
    tiebreak_b: s.tbB ?? null,
  }));
}

const isSetList = (sets: unknown): sets is SetInput[] =>
  Array.isArray(sets) &&
  sets.length <= 3 &&
  sets.every((s) => s && typeof s === "object" && Number.isInteger((s as SetInput).a) && Number.isInteger((s as SetInput).b));

/** Saves the score as it stands while the match is played. Not validated, not official. */
export async function saveMatchDraft(matchId: string, sets: SetInput[]): Promise<ActionResult> {
  const user = await requireUser();
  if (typeof user !== "string") return user;
  if (!UUID.test(matchId) || !isSetList(sets)) return { ok: false, error: userError("INVALID_SCORE") };

  const { error } = await createAdminClient().rpc("save_match_draft", {
    p_match_id: matchId,
    p_actor_id: user,
    p_sets: toSetJson(sets),
  });
  if (error) return { ok: false, error: fromSupabaseError(error, "saveMatchDraft") };
  refresh();
  return { ok: true, data: undefined };
}

/**
 * Validates the score against the match's format, then records it through the
 * service role (the RPC also re-checks that the caller organizes the mabar).
 */
export async function submitMatchResult(matchId: string, sets: SetInput[]): Promise<ScoreActionResult<{ status: ResultStatus }>> {
  const user = await requireUser();
  if (typeof user !== "string") return user;
  if (!UUID.test(matchId) || !isSetList(sets)) return { ok: false, error: userError("INVALID_SCORE"), scoreErrors: [] };

  const match = await getMatch(matchId);
  if (!match) return { ok: false, error: userError("MATCH_NOT_FOUND") };
  if (match.organizerId !== user) return { ok: false, error: userError("NOT_ORGANIZER") };

  const score = validateScore(match.scoringFormat, sets);
  if (!score.ok) return { ok: false, error: userError("INVALID_SCORE"), scoreErrors: score.errors };

  const { data, error } = await createAdminClient().rpc("submit_match_result", {
    p_match_id: matchId,
    p_actor_id: user,
    p_sets: score.sets.map((s) => ({
      set_no: s.setNo,
      games_a: s.gamesA,
      games_b: s.gamesB,
      tiebreak_a: s.tiebreakA,
      tiebreak_b: s.tiebreakB,
      is_match_tiebreak: s.isMatchTiebreak,
    })),
    p_winner: score.winner,
  });
  if (error) return { ok: false, error: fromSupabaseError(error, "submitMatchResult") };
  refresh();
  return { ok: true, data: { status: data as ResultStatus } };
}
