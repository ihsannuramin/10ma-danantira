// NTRP-like scale. Named levels are always derived from the numeric rating,
// never stored or accepted as free text.
export const RATING_MIN = 1.0;
export const RATING_MAX = 7.0;

// Reliability is a 0–100 confidence score. A fresh assessment is a guess.
export const INITIAL_RELIABILITY = 20;

// Assessment-only ratings are capped below Competitive; that level has to be
// earned through confirmed competitive results.
export const ASSESSMENT_RATING_MIN = 1.5;
export const ASSESSMENT_RATING_MAX = 4.0;

export const TENNIS_LEVELS = [
  "BEGINNER",
  "UPPER_BEGINNER",
  "INTERMEDIATE",
  "UPPER_INTERMEDIATE",
  "ADVANCED",
  "COMPETITIVE",
] as const;

// Lower bound (inclusive) of each level on the rating scale.
export const LEVEL_MIN_RATING = {
  BEGINNER: 1.0,
  UPPER_BEGINNER: 2.0,
  INTERMEDIATE: 2.5,
  UPPER_INTERMEDIATE: 3.0,
  ADVANCED: 3.5,
  COMPETITIVE: 4.5,
} as const;

export const LEVEL_LABEL = {
  BEGINNER: "Beginner",
  UPPER_BEGINNER: "Upper Beginner",
  INTERMEDIATE: "Intermediate",
  UPPER_INTERMEDIATE: "Upper Intermediate",
  ADVANCED: "Advanced",
  COMPETITIVE: "Competitive",
} as const;

export const ASSESSMENT_EXPERIENCE = ["NEVER", "LT_3_MONTHS", "M3_TO_12", "GT_1_YEAR"] as const;
export const ASSESSMENT_RALLY = ["CANNOT", "SOMETIMES", "FAIRLY_CONSISTENT", "VERY_CONSISTENT"] as const;
export const ASSESSMENT_MATCH_EXPERIENCE = ["NONE", "FRIENDLY", "COMPETITIVE", "TOURNAMENT"] as const;

export const ASSESSMENT_QUESTIONS = {
  experience: {
    question: "Sudah berapa lama bermain tenis?",
    options: {
      NEVER: "Belum pernah",
      LT_3_MONTHS: "< 3 bulan",
      M3_TO_12: "3–12 bulan",
      GT_1_YEAR: "> 1 tahun",
    },
  },
  rally: {
    question: "Seberapa konsisten melakukan rally?",
    options: {
      CANNOT: "Belum bisa",
      SOMETIMES: "Kadang",
      FAIRLY_CONSISTENT: "Cukup konsisten",
      VERY_CONSISTENT: "Sangat konsisten",
    },
  },
  matchExperience: {
    question: "Pernah bermain pertandingan?",
    options: {
      NONE: "Belum",
      FRIENDLY: "Friendly",
      COMPETITIVE: "Competitive",
      TOURNAMENT: "Tournament",
    },
  },
} as const;
