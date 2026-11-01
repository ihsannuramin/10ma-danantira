import { describe, expect, it } from "vitest";
import { ASSESSMENT_RATING_MAX, ASSESSMENT_RATING_MIN, INITIAL_RELIABILITY } from "./rating.constants";
import { initialRatingFromAssessment, isRatingInRange, levelFromRating } from "./rating.service";

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

describe("isRatingInRange", () => {
  it("includes both bounds", () => {
    expect(isRatingInRange(2.5, 2.5, 3.5)).toBe(true);
    expect(isRatingInRange(3.5, 2.5, 3.5)).toBe(true);
    expect(isRatingInRange(2.49, 2.5, 3.5)).toBe(false);
  });
});
