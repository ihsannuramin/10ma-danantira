import { z } from "zod";
import {
  COST_MAX,
  DESCRIPTION_MAX,
  LEVEL_RANGE_MAX,
  LEVEL_RANGE_MIN,
  LEVEL_STEP,
  MABAR_FORMATS,
  MATCH_TYPES,
  MAX_DURATION_HOURS,
  TITLE_MAX,
} from "./mabar.constants";
import { toWibDate } from "./schedule";

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const level = z.coerce
  .number({ message: "Pilih level." })
  .min(LEVEL_RANGE_MIN)
  .max(LEVEL_RANGE_MAX)
  .refine((v) => Number.isInteger(v / LEVEL_STEP), "Level harus kelipatan 0.5.");

export const venueChoiceSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("existing"), venueId: z.uuid({ message: "Pilih lokasi." }) }),
  z.object({
    mode: z.literal("new"),
    venueName: z.string().trim().min(3, "Nama venue minimal 3 karakter.").max(80, "Nama venue terlalu panjang."),
    areaId: z.uuid({ message: "Pilih area venue." }),
  }),
]);

export function createMabarSchema(now: Date = new Date()) {
  return z
    .object({
      title: optionalText(TITLE_MAX, `Nama mabar maksimal ${TITLE_MAX} karakter.`),
      format: z.enum(MABAR_FORMATS, { message: "Pilih format." }),
      matchType: z.enum(MATCH_TYPES, { message: "Pilih tipe match." }),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal."),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, "Pilih jam mulai."),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, "Pilih jam selesai."),
      levelMin: level,
      levelMax: level,
      cost: z
        .string()
        .trim()
        .transform((v) => v.replace(/\D/g, ""))
        .transform((v) => (v === "" ? null : Number(v)))
        .pipe(z.number().int().min(0).max(COST_MAX, "Biaya terlalu besar.").nullable()),
      description: optionalText(DESCRIPTION_MAX, `Deskripsi maksimal ${DESCRIPTION_MAX} karakter.`),
    })
    .superRefine((v, ctx) => {
      if (v.levelMin > v.levelMax) {
        ctx.addIssue({ code: "custom", path: ["levelMax"], message: "Level maksimal harus ≥ level minimal." });
      }
      const startsAt = toWibDate(v.date, v.startTime);
      const endsAt = toWibDate(v.date, v.endTime);
      if (Number.isNaN(startsAt.getTime())) return;
      if (startsAt <= now) {
        ctx.addIssue({ code: "custom", path: ["startTime"], message: "Waktu mulai harus di masa depan." });
      }
      if (endsAt <= startsAt) {
        ctx.addIssue({ code: "custom", path: ["endTime"], message: "Jam selesai harus setelah jam mulai." });
      } else if (endsAt.getTime() - startsAt.getTime() > MAX_DURATION_HOURS * 3_600_000) {
        ctx.addIssue({ code: "custom", path: ["endTime"], message: `Durasi maksimal ${MAX_DURATION_HOURS} jam.` });
      }
    })
    .transform((v) => ({
      title: v.title,
      format: v.format,
      matchType: v.matchType,
      startsAt: toWibDate(v.date, v.startTime),
      endsAt: toWibDate(v.date, v.endTime),
      levelMin: v.levelMin,
      levelMax: v.levelMax,
      cost: v.cost,
      description: v.description,
    }));
}

export type CreateMabarInput = z.output<ReturnType<typeof createMabarSchema>>;
