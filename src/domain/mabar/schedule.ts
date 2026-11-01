import { APP_TIME_ZONE, APP_UTC_OFFSET } from "./mabar.constants";
import type { DateFilter } from "./mabar.types";

/** "2025-11-08" + "07:00" in WIB → Date. */
export function toWibDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${APP_UTC_OFFSET}`);
}

/** Calendar date (YYYY-MM-DD) of `instant` as seen in WIB. */
export function wibDateString(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, for a YYYY-MM-DD calendar date. */
function weekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export type DateRange = { from: Date; to: Date };

/**
 * Half-open [from, to) window for a date filter, in WIB. Weekend means the
 * coming Saturday–Sunday, or the rest of it if today is already the weekend.
 */
export function dateFilterRange(filter: DateFilter | string, now: Date = new Date()): DateRange | null {
  const today = wibDateString(now);
  const day = (offset: number) => toWibDate(addDays(today, offset), "00:00");

  if (filter === "TODAY") return { from: day(0), to: day(1) };
  if (filter === "TOMORROW") return { from: day(1), to: day(2) };
  if (filter === "WEEKEND") {
    const dow = weekday(today);
    if (dow === 0) return { from: day(0), to: day(1) };
    const toSaturday = 6 - dow;
    return { from: day(toSaturday), to: day(toSaturday + 2) };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(filter)) {
    return { from: toWibDate(filter, "00:00"), to: toWibDate(addDays(filter, 1), "00:00") };
  }
  return null;
}
