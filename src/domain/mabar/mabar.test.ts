import { describe, expect, it } from "vitest";
import { createMabarSchema } from "./mabar.schema";
import { canJoin, getEffectiveStatus } from "./mabar.service";
import type { JoinCheckInput } from "./mabar.types";
import { dateFilterRange, toWibDate } from "./schedule";

const NOW = new Date("2025-11-05T03:00:00Z"); // Wed 5 Nov 2025, 10:00 WIB
const LATER = new Date("2025-11-08T00:00:00Z"); // Sat 07:00 WIB

describe("getEffectiveStatus", () => {
  const base = { status: "OPEN" as const, startsAt: LATER, participantCount: 3, maxPlayers: 4 };

  it("is OPEN before start with free slots", () => {
    expect(getEffectiveStatus(base, NOW)).toBe("OPEN");
  });
  it("is FULL before start with every slot taken", () => {
    expect(getEffectiveStatus({ ...base, participantCount: 4 }, NOW)).toBe("FULL");
  });
  it("is LIVE once a full mabar starts", () => {
    expect(getEffectiveStatus({ ...base, participantCount: 4 }, LATER)).toBe("LIVE");
  });
  it("is EXPIRED once a mabar starts short of players", () => {
    expect(getEffectiveStatus(base, LATER)).toBe("EXPIRED");
  });
  it("keeps stored terminal states regardless of time", () => {
    expect(getEffectiveStatus({ ...base, status: "CANCELLED" }, LATER)).toBe("CANCELLED");
    expect(getEffectiveStatus({ ...base, status: "COMPLETED" }, NOW)).toBe("COMPLETED");
  });
});

describe("canJoin", () => {
  const ok: JoinCheckInput = {
    hasProfile: true,
    playerRating: 3.0,
    mabar: {
      status: "OPEN",
      startsAt: LATER,
      participantCount: 3,
      maxPlayers: 4,
      levelMin: 2.5,
      levelMax: 3.5,
      isParticipant: false,
    },
  };
  const withMabar = (patch: Partial<NonNullable<JoinCheckInput["mabar"]>>): JoinCheckInput => ({
    ...ok,
    mabar: { ...ok.mabar!, ...patch },
  });

  it("allows an eligible player into an open mabar", () => {
    expect(canJoin(ok, NOW)).toEqual({ ok: true });
  });

  it.each<[string, JoinCheckInput, string]>([
    ["no profile", { ...ok, hasProfile: false }, "PROFILE_REQUIRED"],
    ["no rating", { ...ok, playerRating: null }, "PROFILE_REQUIRED"],
    ["missing mabar", { ...ok, mabar: null }, "MABAR_NOT_FOUND"],
    ["cancelled", withMabar({ status: "CANCELLED" }), "MABAR_CANCELLED"],
    ["completed", withMabar({ status: "COMPLETED" }), "MABAR_STARTED"],
    ["already started", withMabar({ startsAt: NOW }), "MABAR_STARTED"],
    ["already joined", withMabar({ isParticipant: true }), "ALREADY_JOINED"],
    ["full", withMabar({ participantCount: 4 }), "MABAR_FULL"],
    ["rating too low", { ...ok, playerRating: 2.4 }, "LEVEL_NOT_ELIGIBLE"],
    ["rating too high", { ...ok, playerRating: 3.6 }, "LEVEL_NOT_ELIGIBLE"],
  ])("rejects when %s", (_, input, code) => {
    expect(canJoin(input, NOW)).toEqual({ ok: false, code });
  });

  it("reports ALREADY_JOINED before FULL for a participant of a full mabar", () => {
    expect(canJoin(withMabar({ isParticipant: true, participantCount: 4 }), NOW)).toEqual({
      ok: false,
      code: "ALREADY_JOINED",
    });
  });
});

describe("dateFilterRange", () => {
  it("covers today in WIB", () => {
    expect(dateFilterRange("TODAY", NOW)).toEqual({
      from: toWibDate("2025-11-05", "00:00"),
      to: toWibDate("2025-11-06", "00:00"),
    });
  });
  it("uses the WIB date even when UTC is still yesterday", () => {
    const earlyWib = new Date("2025-11-04T18:30:00Z"); // 01:30 WIB on 5 Nov
    expect(dateFilterRange("TODAY", earlyWib)?.from).toEqual(toWibDate("2025-11-05", "00:00"));
  });
  it("finds the coming weekend from a weekday", () => {
    expect(dateFilterRange("WEEKEND", NOW)).toEqual({
      from: toWibDate("2025-11-08", "00:00"),
      to: toWibDate("2025-11-10", "00:00"),
    });
  });
  it("covers only Sunday when it is already Sunday", () => {
    const sunday = new Date("2025-11-09T02:00:00Z");
    expect(dateFilterRange("WEEKEND", sunday)).toEqual({
      from: toWibDate("2025-11-09", "00:00"),
      to: toWibDate("2025-11-10", "00:00"),
    });
  });
  it("accepts an explicit date and rejects garbage", () => {
    expect(dateFilterRange("2025-12-01", NOW)?.from).toEqual(toWibDate("2025-12-01", "00:00"));
    expect(dateFilterRange("someday", NOW)).toBeNull();
  });
});

describe("createMabarSchema", () => {
  const valid = {
    title: "",
    format: "DOUBLES",
    matchType: "CASUAL",
    date: "2025-11-08",
    startTime: "07:00",
    endTime: "09:00",
    levelMin: "2.5",
    levelMax: "3.5",
    cost: "75.000",
    description: "",
  };
  const parse = (patch: Record<string, string>) => createMabarSchema(NOW).safeParse({ ...valid, ...patch });
  const errorPaths = (patch: Record<string, string>) => {
    const result = parse(patch);
    return result.success ? [] : result.error.issues.map((i) => i.path.join("."));
  };

  it("parses a valid form into WIB timestamps and numbers", () => {
    const result = parse({});
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.startsAt).toEqual(new Date("2025-11-08T00:00:00Z"));
    expect(result.data.endsAt).toEqual(new Date("2025-11-08T02:00:00Z"));
    expect(result.data.cost).toBe(75000);
    expect(result.data.title).toBeNull();
    expect(result.data.description).toBeNull();
  });

  it("treats an empty cost as not set", () => {
    const result = parse({ cost: "" });
    expect(result.success && result.data.cost).toBeNull();
  });

  it("rejects an end time before the start time", () => {
    expect(errorPaths({ endTime: "06:00" })).toContain("endTime");
  });
  it("rejects a start in the past", () => {
    expect(errorPaths({ date: "2025-11-01" })).toContain("startTime");
  });
  it("rejects sessions longer than the maximum duration", () => {
    expect(errorPaths({ startTime: "06:00", endTime: "15:00" })).toContain("endTime");
  });
  it("rejects an inverted level range", () => {
    expect(errorPaths({ levelMin: "4.0", levelMax: "3.0" })).toContain("levelMax");
  });
  it("rejects levels off the 0.5 grid", () => {
    expect(errorPaths({ levelMin: "2.7" })).toContain("levelMin");
  });
  it("rejects unknown enum values", () => {
    expect(errorPaths({ format: "TRIPLES" })).toContain("format");
  });
});
