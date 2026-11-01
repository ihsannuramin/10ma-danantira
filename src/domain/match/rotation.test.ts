import { describe, expect, it } from "vitest";
import { suggestNextMatch } from "./rotation";

// Deterministic "random" so assertions are stable.
const seeded = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

describe("suggestNextMatch", () => {
  const players = ["p1", "p2", "p3", "p4", "p5", "p6"];

  it("picks the four players who have played least for doubles", () => {
    const counts = { p1: 2, p2: 2, p3: 0, p4: 1, p5: 0, p6: 1 };
    const s = suggestNextMatch(players, counts, "DOUBLES", seeded())!;
    expect([...s.teamA, ...s.teamB].sort()).toEqual(["p3", "p4", "p5", "p6"]);
    expect(s.teamA).toHaveLength(2);
    expect(s.teamB).toHaveLength(2);
  });

  it("picks two players for singles", () => {
    const s = suggestNextMatch(players, { p1: 0, p2: 0, p3: 3, p4: 3, p5: 3, p6: 3 }, "SINGLES", seeded())!;
    expect([...s.teamA, ...s.teamB].sort()).toEqual(["p1", "p2"]);
  });

  it("returns null when there are not enough players", () => {
    expect(suggestNextMatch(["p1", "p2", "p3"], {}, "DOUBLES")).toBeNull();
  });

  it("spreads play evenly over repeated suggestions", () => {
    const counts: Record<string, number> = {};
    const random = seeded(7);
    for (let i = 0; i < 6; i++) {
      const s = suggestNextMatch(players, counts, "DOUBLES", random)!;
      for (const id of [...s.teamA, ...s.teamB]) counts[id] = (counts[id] ?? 0) + 1;
    }
    expect(new Set(Object.values(counts))).toEqual(new Set([4])); // 6 matches × 4 / 6 players
  });
});
