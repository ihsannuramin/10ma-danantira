import type {
  ASSESSMENT_EXPERIENCE,
  ASSESSMENT_MATCH_EXPERIENCE,
  ASSESSMENT_RALLY,
  TENNIS_LEVELS,
} from "./rating.constants";

export type TennisLevel = (typeof TENNIS_LEVELS)[number];

export type AssessmentAnswers = {
  experience: (typeof ASSESSMENT_EXPERIENCE)[number];
  rally: (typeof ASSESSMENT_RALLY)[number];
  matchExperience: (typeof ASSESSMENT_MATCH_EXPERIENCE)[number];
};

export type InitialRating = {
  rating: number;
  reliability: number;
  level: TennisLevel;
};
