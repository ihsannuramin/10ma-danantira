"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserId, requireUserId } from "@/data/auth";
import { fieldErrors, formDataToObject, onboardingSchema, profileSchema } from "@/domain/player/player.schema";
import { initialRatingFromAssessment } from "@/domain/rating/rating.service";
import type { TennisLevel } from "@/domain/rating/rating.types";
import { fromSupabaseError, userError, type ActionResult } from "@/lib/errors";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function completeOnboarding(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult<{ rating: number; level: TennisLevel }>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: userError("NOT_AUTHENTICATED") };

  const parsed = onboardingSchema.safeParse(formDataToObject(formData, ["availability"]));
  if (!parsed.success) {
    return { ok: false, error: userError("VALIDATION"), fieldErrors: fieldErrors(parsed.error) };
  }
  const input = parsed.data;
  // Rating is derived here from the answers, never taken from the client.
  const initial = initialRatingFromAssessment(input);

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const avatar = claims?.claims?.user_metadata?.avatar_url;

  const { error } = await createAdminClient().rpc("complete_onboarding", {
    p_user_id: userId,
    p_display_name: input.displayName,
    p_photo_url: typeof avatar === "string" ? avatar : null,
    p_area_id: input.areaId,
    p_gender: input.gender,
    p_dominant_hand: input.dominantHand,
    p_playing_style: input.playingStyle,
    p_playing_objective: input.playingObjective,
    p_preferred_format: input.preferredFormat,
    p_availability: input.availability,
    p_rating: initial.rating,
    p_reliability: initial.reliability,
    p_assessment: {
      experience: input.experience,
      rally: input.rally,
      matchExperience: input.matchExperience,
    },
  });
  if (error) return { ok: false, error: fromSupabaseError(error, "completeOnboarding") };

  return { ok: true, data: { rating: initial.rating, level: initial.level } };
}

export async function updateProfile(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = profileSchema.safeParse(formDataToObject(formData, ["availability"]));
  if (!parsed.success) {
    return { ok: false, error: userError("VALIDATION"), fieldErrors: fieldErrors(parsed.error) };
  }
  const input = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: input.displayName,
      area_id: input.areaId,
      gender: input.gender,
      dominant_hand: input.dominantHand,
      playing_style: input.playingStyle,
      playing_objective: input.playingObjective,
      preferred_format: input.preferredFormat,
      availability: input.availability,
    })
    .eq("user_id", userId);
  if (error) return { ok: false, error: fromSupabaseError(error, "updateProfile") };

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}
