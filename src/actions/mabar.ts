"use server";

import { refresh } from "next/cache";
import { getUserId } from "@/data/auth";
import { createMabarSchema, venueChoiceSchema } from "@/domain/mabar/mabar.schema";
import { fieldErrors } from "@/domain/player/player.schema";
import { fromSupabaseError, userError, type ActionResult } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;

export async function createMabar(_prev: unknown, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: userError("NOT_AUTHENTICATED") };

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const mabar = createMabarSchema().safeParse(raw);
  const venue = venueChoiceSchema.safeParse({
    mode: raw.venueMode,
    venueId: raw.venueId,
    venueName: raw.venueName,
    areaId: raw.venueAreaId,
  });
  if (!mabar.success || !venue.success) {
    const errors = {
      ...(mabar.success ? {} : fieldErrors(mabar.error)),
      ...(venue.success ? {} : fieldErrors(venue.error)),
    };
    // Venue errors arrive keyed by the schema field; point them at the form inputs.
    if (errors.areaId) errors.venueAreaId = errors.areaId;
    return { ok: false, error: userError("VALIDATION"), fieldErrors: errors };
  }

  const supabase = await createClient();

  let venueId: string;
  if (venue.data.mode === "existing") {
    venueId = venue.data.venueId;
  } else {
    const { data, error } = await supabase
      .from("venues")
      .insert({ name: venue.data.venueName, area_id: venue.data.areaId, created_by: userId })
      .select("id")
      .single();
    if (error?.code === "23505") {
      return { ok: false, error: userError("VENUE_EXISTS"), fieldErrors: { venueName: userError("VENUE_EXISTS").title } };
    }
    if (error) return { ok: false, error: fromSupabaseError(error, "createVenue") };
    venueId = data.id;
  }

  const input = mabar.data;
  const { data, error } = await supabase.rpc("create_mabar", {
    p_title: input.title,
    p_format: input.format,
    p_match_type: input.matchType,
    p_starts_at: input.startsAt.toISOString(),
    p_ends_at: input.endsAt.toISOString(),
    p_venue_id: venueId,
    p_level_min: input.levelMin,
    p_level_max: input.levelMax,
    p_cost_per_player: input.cost,
    p_description: input.description,
  });
  if (error) return { ok: false, error: fromSupabaseError(error, "createMabar") };

  return { ok: true, data: { id: data as string } };
}

async function runCommand(fn: "join_mabar" | "leave_mabar" | "cancel_mabar", mabarId: string): Promise<ActionResult> {
  if (!UUID.test(mabarId)) return { ok: false, error: userError("MABAR_NOT_FOUND") };
  if (!(await getUserId())) return { ok: false, error: userError("NOT_AUTHENTICATED") };

  const supabase = await createClient();
  const { error } = await supabase.rpc(fn, { p_mabar_id: mabarId });
  if (error) return { ok: false, error: fromSupabaseError(error, fn) };

  refresh();
  return { ok: true, data: undefined };
}

export async function joinMabar(mabarId: string) {
  return runCommand("join_mabar", mabarId);
}

export async function leaveMabar(mabarId: string) {
  return runCommand("leave_mabar", mabarId);
}

export async function cancelMabar(mabarId: string) {
  return runCommand("cancel_mabar", mabarId);
}
