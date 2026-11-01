// Option lists from PRD §10. Keys match the Postgres enums.

export const GENDER_LABEL = { MALE: "Laki-laki", FEMALE: "Perempuan" } as const;
export const DOMINANT_HAND_LABEL = { RIGHT: "Kanan", LEFT: "Kiri" } as const;

export const PLAYING_STYLE_LABEL = {
  BASELINE: "Baseline",
  AGGRESSIVE_BASELINER: "Aggressive Baseliner",
  ALL_COURT: "All Court",
  SERVE_AND_VOLLEY: "Serve & Volley",
  COUNTER_PUNCHER: "Counter Puncher",
  STILL_LEARNING: "Still Learning",
} as const;

export const PLAYING_OBJECTIVE_LABEL = {
  FUN: "Fun",
  FITNESS: "Fitness",
  IMPROVE: "Improve",
  COMPETITIVE: "Competitive",
  TOURNAMENT: "Tournament",
} as const;

export const PREFERRED_FORMAT_LABEL = { SINGLES: "Singles", DOUBLES: "Doubles", BOTH: "Both" } as const;

export const AVAILABILITY_LABEL = {
  WEEKDAY_MORNING: "Weekday Pagi",
  WEEKDAY_AFTERNOON: "Weekday Siang",
  WEEKDAY_NIGHT: "Weekday Malam",
  WEEKEND_MORNING: "Weekend Pagi",
  WEEKEND_AFTERNOON: "Weekend Siang",
  WEEKEND_NIGHT: "Weekend Malam",
} as const;

export type Gender = keyof typeof GENDER_LABEL;
export type DominantHand = keyof typeof DOMINANT_HAND_LABEL;
export type PlayingStyle = keyof typeof PLAYING_STYLE_LABEL;
export type PlayingObjective = keyof typeof PLAYING_OBJECTIVE_LABEL;
export type PreferredFormat = keyof typeof PREFERRED_FORMAT_LABEL;
export type AvailabilitySlot = keyof typeof AVAILABILITY_LABEL;

export const keysOf = <T extends Record<string, unknown>>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];
