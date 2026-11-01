import {
  ASSESSMENT_EXPERIENCE,
  ASSESSMENT_MATCH_EXPERIENCE,
  ASSESSMENT_RALLY,
  ASSESSMENT_RATING_MAX,
  ASSESSMENT_RATING_MIN,
  INITIAL_RELIABILITY,
  LEVEL_LABEL,
  LEVEL_MIN_RATING,
  RATING_MAX,
  RATING_MIN,
  TENNIS_LEVELS,
} from "./rating.constants";
import type { AssessmentAnswers, InitialRating, TennisLevel } from "./rating.types";

export function roundRating(value: number): number {
  return Math.round(value * 100) / 100;
}

export function clampRating(value: number): number {
  return Math.min(RATING_MAX, Math.max(RATING_MIN, value));
}

export function levelFromRating(rating: number): TennisLevel {
  // Walk from the top so the first threshold we clear is the answer.
  for (let i = TENNIS_LEVELS.length - 1; i >= 0; i--) {
    const level = TENNIS_LEVELS[i];
    if (rating >= LEVEL_MIN_RATING[level]) return level;
  }
  return "BEGINNER";
}

export function levelLabel(level: TennisLevel): string {
  return LEVEL_LABEL[level];
}

/**
 * Each answer scores 0–3 by its position in the option list; the 0–9 total is
 * spread linearly over the assessment range.
 */
export function initialRatingFromAssessment(answers: AssessmentAnswers): InitialRating {
  const score =
    ASSESSMENT_EXPERIENCE.indexOf(answers.experience) +
    ASSESSMENT_RALLY.indexOf(answers.rally) +
    ASSESSMENT_MATCH_EXPERIENCE.indexOf(answers.matchExperience);
  const maxScore =
    ASSESSMENT_EXPERIENCE.length - 1 + (ASSESSMENT_RALLY.length - 1) + (ASSESSMENT_MATCH_EXPERIENCE.length - 1);

  const span = ASSESSMENT_RATING_MAX - ASSESSMENT_RATING_MIN;
  const rating = roundRating(ASSESSMENT_RATING_MIN + (score / maxScore) * span);

  return { rating, reliability: INITIAL_RELIABILITY, level: levelFromRating(rating) };
}

export function formatRating(rating: number): string {
  return rating.toFixed(2);
}

export function isRatingInRange(rating: number, min: number, max: number): boolean {
  return rating >= min && rating <= max;
}
