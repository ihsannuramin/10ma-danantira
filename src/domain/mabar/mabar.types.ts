import type {
  DATE_FILTERS,
  JOIN_ERROR_CODES,
  MABAR_FORMATS,
  MABAR_STATUSES,
  MATCH_TYPES,
  STORED_MABAR_STATUSES,
  TIME_SLOTS,
} from "./mabar.constants";

export type MabarFormat = (typeof MABAR_FORMATS)[number];
export type MatchType = (typeof MATCH_TYPES)[number];
export type MabarStatus = (typeof MABAR_STATUSES)[number];
export type StoredMabarStatus = (typeof STORED_MABAR_STATUSES)[number];
export type TimeSlot = keyof typeof TIME_SLOTS;
export type DateFilter = keyof typeof DATE_FILTERS;
export type JoinErrorCode = (typeof JOIN_ERROR_CODES)[number];

export type MabarStatusInput = {
  status: StoredMabarStatus;
  startsAt: Date;
  participantCount: number;
  maxPlayers: number;
};

export type JoinCheckInput = {
  hasProfile: boolean;
  playerRating: number | null;
  mabar:
    | (MabarStatusInput & {
        levelMin: number;
        levelMax: number;
        isParticipant: boolean;
      })
    | null;
};

export type JoinCheckResult = { ok: true } | { ok: false; code: JoinErrorCode };
