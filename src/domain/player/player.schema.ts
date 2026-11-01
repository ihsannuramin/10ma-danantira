import { z } from "zod";
import {
  ASSESSMENT_EXPERIENCE,
  ASSESSMENT_MATCH_EXPERIENCE,
  ASSESSMENT_RALLY,
} from "@/domain/rating/rating.constants";
import {
  AVAILABILITY_LABEL,
  DOMINANT_HAND_LABEL,
  GENDER_LABEL,
  PLAYING_OBJECTIVE_LABEL,
  PLAYING_STYLE_LABEL,
  PREFERRED_FORMAT_LABEL,
  keysOf,
} from "./player.constants";

const optionalEnum = <T extends [string, ...string[]]>(values: T) =>
  z
    .enum(values)
    .or(z.literal(""))
    .optional()
    .transform((v) => (v ? v : null));

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Nama minimal 2 karakter.").max(40, "Nama maksimal 40 karakter."),
  areaId: z.uuid({ message: "Pilih area kamu." }),
  gender: optionalEnum(keysOf(GENDER_LABEL)),
  dominantHand: optionalEnum(keysOf(DOMINANT_HAND_LABEL)),
  playingStyle: z.enum(keysOf(PLAYING_STYLE_LABEL), { message: "Pilih gaya main." }),
  playingObjective: z.enum(keysOf(PLAYING_OBJECTIVE_LABEL), { message: "Pilih tujuan main." }),
  preferredFormat: z.enum(keysOf(PREFERRED_FORMAT_LABEL), { message: "Pilih format favorit." }),
  availability: z.array(z.enum(keysOf(AVAILABILITY_LABEL))).max(6).default([]),
});

export const assessmentSchema = z.object({
  experience: z.enum(ASSESSMENT_EXPERIENCE, { message: "Pilih salah satu jawaban." }),
  rally: z.enum(ASSESSMENT_RALLY, { message: "Pilih salah satu jawaban." }),
  matchExperience: z.enum(ASSESSMENT_MATCH_EXPERIENCE, { message: "Pilih salah satu jawaban." }),
});

export const onboardingSchema = profileSchema.extend(assessmentSchema.shape);

export type ProfileInput = z.output<typeof profileSchema>;

/** FormData → plain object, collecting repeated keys (checkbox groups) into arrays. */
export function formDataToObject(formData: FormData, arrayKeys: string[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    out[key] = arrayKeys.includes(key) ? formData.getAll(key) : formData.get(key);
  }
  for (const key of arrayKeys) out[key] ??= [];
  return out;
}

/** First message per field, keyed by top-level path. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
