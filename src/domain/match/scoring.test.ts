import { describe, expect, it } from "vitest";
import type { ScoringFormat } from "./match.constants";
import { formatScoreLine, setNeedsTiebreak, validateScore, type SetInput } from "./scoring";

const s = (a: number, b: number, tbA?: number, tbB?: number): SetInput => ({ a, b, tbA, tbB });
const ok = (format: ScoringFormat, sets: SetInput[]) => validateScore(format, sets);
const winnerOf = (format: ScoringFormat, sets: SetInput[]) => {
  const r = ok(format, sets);
  return r.ok ? r.winner : null;
};
const errorSets = (format: ScoringFormat, sets: SetInput[]) => {
  const r = ok(format, sets);
  return r.ok ? [] : r.errors.map((e) => e.set);
};

describe("validateScore — ONE_SET", () => {
  it.each([
    [6, 0],
    [6, 4],
    [7, 5],
    [3, 6],
  ])("accepts %s-%s", (a, b) => {
    expect(ok("ONE_SET", [s(a, b)]).ok).toBe(true);
  });

  it.each([
    [6, 5],
    [7, 3],
    [5, 3],
    [8, 6],
    [6, 6],
  ])("rejects %s-%s", (a, b) => {
    expect(errorSets("ONE_SET", [s(a, b)])).toEqual([1]);
  });

  it("requires tie-break points at 7-6 and checks them", () => {
    expect(ok("ONE_SET", [s(7, 6)]).ok).toBe(false);
    expect(winnerOf("ONE_SET", [s(7, 6, 7, 4)])).toBe("A");
    expect(winnerOf("ONE_SET", [s(6, 7, 9, 11)])).toBe("B");
    expect(ok("ONE_SET", [s(7, 6, 7, 6)]).ok).toBe(false); // margin 1
    expect(ok("ONE_SET", [s(7, 6, 10, 6)]).ok).toBe(false); // past 7 must be exactly 2 ahead
    expect(ok("ONE_SET", [s(7, 6, 4, 7)]).ok).toBe(false); // tie-break winner ≠ set winner
  });

  it("allows only one set", () => {
    expect(ok("ONE_SET", [s(6, 4), s(6, 4)]).ok).toBe(false);
  });
});

describe("validateScore — FAST4", () => {
  it("accepts first-to-4 scores and 4-3 with a tie-break", () => {
    expect(winnerOf("FAST4", [s(4, 2)])).toBe("A");
    expect(winnerOf("FAST4", [s(3, 4, 5, 7)])).toBe("B");
  });
  it("rejects scores beyond 4 and 4-3 without tie-break", () => {
    expect(ok("FAST4", [s(5, 3)]).ok).toBe(false);
    expect(ok("FAST4", [s(4, 3)]).ok).toBe(false);
    expect(ok("FAST4", [s(4, 4)]).ok).toBe(false);
  });
});

describe("validateScore — PRO_SET", () => {
  it("accepts 8-6, 9-7 and 9-8 with tie-break", () => {
    expect(ok("PRO_SET", [s(8, 6)]).ok).toBe(true);
    expect(ok("PRO_SET", [s(9, 7)]).ok).toBe(true);
    expect(ok("PRO_SET", [s(9, 8, 7, 5)]).ok).toBe(true);
  });
  it("rejects 8-7 and 6-4", () => {
    expect(ok("PRO_SET", [s(8, 7)]).ok).toBe(false);
    expect(ok("PRO_SET", [s(6, 4)]).ok).toBe(false);
  });
});

describe("validateScore — BEST_OF_3", () => {
  it("finishes in two or three sets", () => {
    expect(winnerOf("BEST_OF_3", [s(6, 4), s(6, 3)])).toBe("A");
    expect(winnerOf("BEST_OF_3", [s(6, 4), s(3, 6), s(5, 7)])).toBe("B");
  });
  it("needs a winner", () => {
    const r = ok("BEST_OF_3", [s(6, 4), s(3, 6)]);
    expect(r.ok).toBe(false);
    expect(r.ok ? null : r.errors[0]!.set).toBeNull();
  });
  it("rejects a set played after the match is decided", () => {
    expect(errorSets("BEST_OF_3", [s(6, 4), s(6, 4), s(6, 4)])).toEqual([3]);
  });
  it("treats the third set as a normal set, not a match tie-break", () => {
    expect(ok("BEST_OF_3", [s(6, 4), s(3, 6), s(10, 7)]).ok).toBe(false);
  });
});

describe("validateScore — BEST_OF_3_MTB", () => {
  it("decides 1-1 with a 10-point match tie-break", () => {
    const r = ok("BEST_OF_3_MTB", [s(6, 4), s(4, 6), s(10, 7)]);
    expect(r.ok && r.winner).toBe("A");
    expect(r.ok && r.sets[2]!.isMatchTiebreak).toBe(true);
    expect(winnerOf("BEST_OF_3_MTB", [s(6, 4), s(4, 6), s(10, 12)])).toBe("B");
  });
  it.each([
    [10, 9],
    [9, 7],
    [13, 10],
  ])("rejects match tie-break %s-%s", (a, b) => {
    expect(errorSets("BEST_OF_3_MTB", [s(6, 4), s(4, 6), s(a, b)])).toEqual([3]);
  });
});

describe("validateScore — input sanity", () => {
  it("rejects empty, negative and fractional scores", () => {
    expect(ok("ONE_SET", []).ok).toBe(false);
    expect(ok("ONE_SET", [s(-6, 4)]).ok).toBe(false);
    expect(ok("ONE_SET", [s(6.5, 4)]).ok).toBe(false);
  });
});

describe("setNeedsTiebreak", () => {
  it("flags only the tie-break scores of each format", () => {
    expect(setNeedsTiebreak("ONE_SET", 7, 6)).toBe(true);
    expect(setNeedsTiebreak("ONE_SET", 6, 4)).toBe(false);
    expect(setNeedsTiebreak("FAST4", 3, 4)).toBe(true);
    expect(setNeedsTiebreak("PRO_SET", 9, 8)).toBe(true);
  });
});

describe("formatScoreLine", () => {
  it("shows tie-break loser points and flips for team B", () => {
    const sets = [
      { gamesA: 7, gamesB: 6, tiebreakA: 7, tiebreakB: 4 },
      { gamesA: 4, gamesB: 6, tiebreakA: null, tiebreakB: null },
    ];
    expect(formatScoreLine(sets)).toBe("7-6(4) 4-6");
    expect(formatScoreLine(sets, "B")).toBe("6-7(4) 6-4");
  });
});
