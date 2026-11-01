import { describe, expect, it } from "vitest";
import { ASSESSMENT_RATING_MAX, ASSESSMENT_RATING_MIN, INITIAL_RELIABILITY } from "./rating.constants";
import { expectedScore, initialRatingFromAssessment, isRatingInRange, levelFromRating, ratingChange } from "./rating.service";

describe("levelFromRating", () => {
  it.each([
    [1.0, "BEGINNER"],
    [1.99, "BEGINNER"],
    [2.0, "UPPER_BEGINNER"],
    [2.49, "UPPER_BEGINNER"],
    [2.5, "INTERMEDIATE"],
    [3.0, "UPPER_INTERMEDIATE"],
    [3.42, "UPPER_INTERMEDIATE"],
    [3.5, "ADVANCED"],
    [4.49, "ADVANCED"],
    [4.5, "COMPETITIVE"],
    [7.0, "COMPETITIVE"],
  ])("maps %s to %s", (rating, level) => {
    expect(levelFromRating(rating)).toBe(level);
  });
});

describe("initialRatingFromAssessment", () => {
  it("gives the floor rating to a complete beginner", () => {
    const result = initialRatingFromAssessment({ experience: "NEVER", rally: "CANNOT", matchExperience: "NONE" });
    expect(result).toEqual({ rating: ASSESSMENT_RATING_MIN, reliability: INITIAL_RELIABILITY, level: "BEGINNER" });
  });

  it("caps an experienced tournament player below Competitive", () => {
    const result = initialRatingFromAssessment({
      experience: "GT_1_YEAR",
      rally: "VERY_CONSISTENT",
      matchExperience: "TOURNAMENT",
    });
    expect(result.rating).toBe(ASSESSMENT_RATING_MAX);
    expect(result.level).toBe("ADVANCED");
  });

  it("lands a regular friendly player around intermediate", () => {
    const result = initialRatingFromAssessment({
      experience: "GT_1_YEAR",
      rally: "FAIRLY_CONSISTENT",
      matchExperience: "FRIENDLY",
    });
    expect(result.rating).toBe(3.17);
    expect(result.level).toBe("UPPER_INTERMEDIATE");
  });

  it("always returns a rating rounded to two decimals", () => {
    const result = initialRatingFromAssessment({ experience: "LT_3_MONTHS", rally: "SOMETIMES", matchExperience: "NONE" });
    expect(Number.isInteger(result.rating * 100)).toBe(true);
  });
});

describe("ratingChange", () => {
  it("reproduces the PRD example: an underdog win at 78% reliability is about +0.09", () => {
    const change = ratingChange({ rating: 3.42, reliability: 78 }, 3.42, 3.9, true);
    expect(change.delta).toBe(0.09);
    expect(change.after).toBe(3.51);
    expect(change.reliabilityAfter).toBe(83);
  });

  it("moves a new player much more than a settled one", () => {
    const fresh = ratingChange({ rating: 3, reliability: 20 }, 3, 3, true);
    const settled = ratingChange({ rating: 3, reliability: 90 }, 3, 3, true);
    expect(fresh.delta).toBeGreaterThan(settled.delta * 3);
  });

  it("is symmetric for an even match", () => {
    const win = ratingChange({ rating: 3, reliability: 50 }, 3, 3, true);
    const loss = ratingChange({ rating: 3, reliability: 50 }, 3, 3, false);
    expect(win.delta).toBe(-loss.delta);
  });

  it("barely moves a heavy favourite who wins", () => {
    expect(ratingChange({ rating: 4.5, reliability: 50 }, 4.5, 2.5, true).delta).toBeLessThanOrEqual(0.01);
  });

  it("clamps to the rating scale and caps reliability", () => {
    expect(ratingChange({ rating: 6.99, reliability: 20 }, 6.99, 6.99, true).after).toBe(7);
    expect(ratingChange({ rating: 1.02, reliability: 20 }, 1.02, 1.02, false).after).toBe(1);
    expect(ratingChange({ rating: 3, reliability: 93 }, 3, 3, true).reliabilityAfter).toBe(95);
  });

  it("uses the team average for doubles", () => {
    // Weaker player paired with a strong partner gains less for a win.
    const carried = ratingChange({ rating: 2.5, reliability: 50 }, 3.5, 3.0, true);
    const alone = ratingChange({ rating: 2.5, reliability: 50 }, 2.5, 3.0, true);
    expect(carried.delta).toBeLessThan(alone.delta);
  });
});

describe("expectedScore", () => {
  it("is 50% for equal ratings and ~91% for a 1.0 gap", () => {
    expect(expectedScore(3, 3)).toBe(0.5);
    expect(expectedScore(4, 3)).toBeCloseTo(0.909, 3);
  });
});

describe("isRatingInRange", () => {
  it("includes both bounds", () => {
    expect(isRatingInRange(2.5, 2.5, 3.5)).toBe(true);
    expect(isRatingInRange(3.5, 2.5, 3.5)).toBe(true);
    expect(isRatingInRange(2.49, 2.5, 3.5)).toBe(false);
  });
});
