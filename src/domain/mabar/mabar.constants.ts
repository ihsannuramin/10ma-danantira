export const MABAR_FORMATS = ["SINGLES", "DOUBLES"] as const;
export const MATCH_TYPES = ["CASUAL", "COMPETITIVE"] as const;

// Single status vocabulary for the whole app. Only OPEN, CANCELLED and
// COMPLETED are ever stored; the rest are derived from time and headcount
// (see getEffectiveStatus and the SQL mabar_effective_status function).
// UPCOMING belongs to the match lifecycle introduced with live scoring.
export const MABAR_STATUSES = ["OPEN", "FULL", "UPCOMING", "LIVE", "COMPLETED", "CANCELLED", "EXPIRED"] as const;
export const STORED_MABAR_STATUSES = ["OPEN", "CANCELLED", "COMPLETED"] as const;

export const MAX_PLAYERS = { SINGLES: 2, DOUBLES: 4 } as const;

export const FORMAT_LABEL = { SINGLES: "Singles", DOUBLES: "Doubles" } as const;
export const MATCH_TYPE_LABEL = { CASUAL: "Casual", COMPETITIVE: "Competitive" } as const;

export const LEVEL_STEP = 0.5;
export const LEVEL_RANGE_MIN = 1.0;
export const LEVEL_RANGE_MAX = 7.0;
export const DEFAULT_LEVEL_RANGE = { min: 2.5, max: 3.5 } as const;

export const MAX_DURATION_HOURS = 8;
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 500;
export const COST_MAX = 10_000_000;

export const APP_TIME_ZONE = "Asia/Jakarta";
export const APP_UTC_OFFSET = "+07:00";

// Start-hour windows in WIB, [from, to).
export const TIME_SLOTS = {
  MORNING: { label: "Pagi", from: 0, to: 12 },
  AFTERNOON: { label: "Siang", from: 12, to: 17 },
  EVENING: { label: "Malam", from: 17, to: 24 },
} as const;

export const DATE_FILTERS = {
  TODAY: "Hari ini",
  TOMORROW: "Besok",
  WEEKEND: "Weekend ini",
} as const;

export const JOIN_ERROR_CODES = [
  "PROFILE_REQUIRED",
  "MABAR_NOT_FOUND",
  "MABAR_CANCELLED",
  "MABAR_STARTED",
  "ALREADY_JOINED",
  "MABAR_FULL",
  "LEVEL_NOT_ELIGIBLE",
] as const;

export const SEARCH_PAGE_SIZE = 10;
