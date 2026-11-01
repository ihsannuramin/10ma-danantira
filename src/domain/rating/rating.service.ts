import {
  ASSESSMENT_EXPERIENCE,
  ASSESSMENT_MATCH_EXPERIENCE,
  ASSESSMENT_RALLY,
  ASSESSMENT_RATING_MAX,
  ASSESSMENT_RATING_MIN,
  INITIAL_RELIABILITY,
  K_MIN,
  K_RANGE,
  LEVEL_LABEL,
  LEVEL_MIN_RATING,
  RATING_EXPECTATION_SCALE,
  RATING_MAX,
  RATING_MIN,
  RELIABILITY_MAX,
  RELIABILITY_STEP,
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

// --- Match rating update ------------------------------------------------------
// Mirrors public.rating_delta / public.apply_match_rating in SQL, which is
// authoritative (it runs atomically with result confirmation and from the
// auto-confirm job). A PGlite parity test keeps the two in step.

/** Symmetric 2-decimal rounding, matching Postgres round(numeric, 2). */
function round2(value: number): number {
  return (Math.sign(value) * Math.round(Math.abs(value) * 100)) / 100;
}

/** Win probability for a side rated `own` against `opponent`; a 1.0 gap ≈ 91%. */
export function expectedScore(own: number, opponent: number): number {
  return 1 / (1 + 10 ** ((opponent - own) / RATING_EXPECTATION_SCALE));
}

/** How far one result can move a rating: new players move fast, settled ones slowly. */
export function kFactor(reliability: number): number {
  return K_MIN + K_RANGE * (1 - reliability / 100);
}

export type RatingChange = { before: number; after: number; delta: number; reliabilityAfter: number };

/**
 * Change for one player after an official competitive result. Team ratings
 * (doubles) are the average of the two players.
 */
export function ratingChange(
  player: { rating: number; reliability: number },
  teamRating: number,
  opponentRating: number,
  won: boolean,
): RatingChange {
  const delta = round2(kFactor(player.reliability) * ((won ? 1 : 0) - expectedScore(teamRating, opponentRating)));
  const after = clampRating(round2(player.rating + delta));
  return {
    before: player.rating,
    after,
    delta: round2(after - player.rating),
    reliabilityAfter: Math.min(RELIABILITY_MAX, player.reliability + RELIABILITY_STEP),
  };
}

export function formatRating(rating: number): string {
  return rating.toFixed(2);
}

export function isRatingInRange(rating: number, min: number, max: number): boolean {
  return rating >= min && rating <= max;
}
