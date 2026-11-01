import { APP_TIME_ZONE } from "@/domain/mabar/mabar.constants";

const shortDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: APP_TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const longDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: APP_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const time = new Intl.DateTimeFormat("id-ID", {
  timeZone: APP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "Sab, 8 Nov" */
export function formatShortDate(d: Date): string {
  return shortDate.format(d).replace(/\./g, "");
}

/** "Sabtu, 8 November" */
export function formatLongDate(d: Date): string {
  return longDate.format(d);
}

/** "07:00" — id-ID uses a dot separator, normalised to a colon. */
export function formatTime(d: Date): string {
  return time.format(d).replace(".", ":");
}

/** "07:00–09:00" */
export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)}–${formatTime(end)}`;
}

/** "Rp75.000" */
export function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

/** "2.5 – 3.5" */
export function formatLevelRange(min: number, max: number): string {
  return `${min.toFixed(1)} – ${max.toFixed(1)}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
