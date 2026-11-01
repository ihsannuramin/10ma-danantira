import { randomUUID } from "node:crypto";
import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { ratingChange } from "../../src/domain/rating/rating.service";
import { as, createTestDb, errorCode } from "./harness";

let db: PGlite;
let areaId: string;
let venueId: string;

type Player = { id: string; rating: number; reliability: number };

async function createPlayer(rating = 3.0, reliability = 50): Promise<Player> {
  const id = randomUUID();
  await db.query(`insert into auth.users (id) values ($1)`, [id]);
  await as(db, "service_role", null, (tx) =>
    tx.query(
      `select public.complete_onboarding($1, 'Player', null, $2, null, null, 'ALL_COURT', 'FUN', 'BOTH', '{}', $3, $4::smallint, '{}'::jsonb)`,
      [id, areaId, rating, reliability],
    ),
  );
  return { id, rating, reliability };
}

/** A session that started 30 minutes ago with the given participants (organizer first). */
async function liveSession(
  players: Player[],
  opts: { format?: "SINGLES" | "DOUBLES"; type?: "CASUAL" | "COMPETITIVE"; max?: number; startsInMinutes?: number } = {},
): Promise<string> {
  const format = opts.format ?? "DOUBLES";
  const { rows } = await db.query<{ id: string }>(
    `insert into public.mabars (organizer_id, title, format, match_type, starts_at, ends_at, venue_id, level_min, level_max, max_players, scoring_format)
     values ($1, 'Test session', $2, $3, now() + make_interval(mins => $4), now() + interval '2 hours', $5, 1, 7, $6, 'ONE_SET')
     returning id`,
    [players[0]!.id, format, opts.type ?? "COMPETITIVE", opts.startsInMinutes ?? -30, venueId, opts.max ?? (format === "SINGLES" ? 2 : 4)],
  );
  for (const p of players) {
    await db.query(`insert into public.mabar_participants (mabar_id, user_id) values ($1, $2)`, [rows[0]!.id, p.id]);
  }
  return rows[0]!.id;
}

const startMatch = (uid: string, mabarId: string, a: Player[], b: Player[]) =>
  as(db, "authenticated", uid, (tx) =>
    tx.query<{ id: string }>(`select public.start_match($1, $2::uuid[], $3::uuid[]) as id`, [
      mabarId,
      a.map((p) => p.id),
      b.map((p) => p.id),
    ]),
  ).then((r) => r.rows[0]!.id);

const SETS_A_WINS = JSON.stringify([{ set_no: 1, games_a: 6, games_b: 4 }]);
const SETS_B_WINS = JSON.stringify([{ set_no: 1, games_a: 3, games_b: 6 }]);

const submit = (matchId: string, actor: string, sets = SETS_A_WINS, winner: "A" | "B" = "A") =>
  as(db, "service_role", null, (tx) =>
    tx.query<{ s: string }>(`select public.submit_match_result($1, $2, $3::jsonb, $4) as s`, [matchId, actor, sets, winner]),
  ).then((r) => r.rows[0]!.s);

const confirm = (uid: string, matchId: string) =>
  as(db, "authenticated", uid, (tx) => tx.query(`select public.confirm_match_result($1)`, [matchId]));
const reject = (uid: string, matchId: string, reason = "Skor salah") =>
  as(db, "authenticated", uid, (tx) => tx.query(`select public.reject_match_result($1, $2)`, [matchId, reason]));

async function overview(matchId: string) {
  const { rows } = await db.query<{ status: string; result_status: string | null; result_version: number | null; confirm_deadline: Date | null }>(
    `select status, result_status, result_version, confirm_deadline from public.match_overview where match_id = $1`,
    [matchId],
  );
  return rows[0]!;
}

async function ratingOf(id: string) {
  const { rows } = await db.query<{ rating: string; reliability: number; matches_counted: number }>(
    `select rating, reliability, matches_counted from public.player_ratings where user_id = $1`,
    [id],
  );
  return { rating: Number(rows[0]!.rating), reliability: rows[0]!.reliability, matches: rows[0]!.matches_counted };
}

beforeAll(async () => {
  db = await createTestDb();
  areaId = (await db.query<{ id: string }>(`select id from public.areas limit 1`)).rows[0]!.id;
  venueId = (await db.query<{ id: string }>(`select id from public.venues limit 1`)).rows[0]!.id;
}, 60_000);

describe("rotation sessions", () => {
  it("is LIVE once started with enough players for one match, even with free slots", async () => {
    const ps = await Promise.all([1, 2, 3, 4, 5].map(() => createPlayer()));
    const id = await liveSession(ps, { max: 8 });
    const { rows } = await db.query<{ effective_status: string }>(`select effective_status from public.mabar_listings where id = $1`, [id]);
    expect(rows[0]!.effective_status).toBe("LIVE");
  });

  it("allows 2–8 players for singles and 4–8 for doubles", async () => {
    const o = await createPlayer();
    const tooMany = await errorCode(() => liveSession([o], { max: 9 }));
    expect(tooMany).toMatch(/mabars_max_players/);
    const tooFewDoubles = await errorCode(() => liveSession([o], { max: 3 }));
    expect(tooFewDoubles).toMatch(/mabars_max_players/);
    await expect(liveSession([o], { format: "SINGLES", max: 3 })).resolves.toBeTruthy();
  });

  it("stores the organizer's scoring choice through create_mabar", async () => {
    const o = await createPlayer();
    const { rows } = await as(db, "authenticated", o.id, (tx) =>
      tx.query<{ id: string }>(
        `select public.create_mabar(null, 'DOUBLES', 'CASUAL', now() + interval '1 day', now() + interval '1 day 2 hours', $1, 2, 4, null, null, 6, 'FAST4', 'NO_AD') as id`,
        [venueId],
      ),
    );
    const m = await db.query<{ max_players: number; scoring_format: string; deuce_rule: string }>(
      `select max_players, scoring_format, deuce_rule from public.mabar_listings where id = $1`,
      [rows[0]!.id],
    );
    expect(m.rows[0]).toEqual({ max_players: 6, scoring_format: "FAST4", deuce_rule: "NO_AD" });
  });
});

describe("start_match", () => {
  it("validates organizer, session state, team sizes and membership", async () => {
    const [o, a, b, c, outsider] = await Promise.all([1, 2, 3, 4, 5].map(() => createPlayer()));
    const id = await liveSession([o!, a!, b!, c!]);

    expect(await errorCode(() => startMatch(a!.id, id, [o!, a!], [b!, c!]))).toBe("NOT_ORGANIZER");
    expect(await errorCode(() => startMatch(o!.id, id, [o!], [b!, c!]))).toBe("TEAM_SIZE_INVALID");
    expect(await errorCode(() => startMatch(o!.id, id, [o!, a!], [a!, c!]))).toBe("DUPLICATE_PLAYER");
    expect(await errorCode(() => startMatch(o!.id, id, [o!, a!], [b!, outsider!]))).toBe("PLAYER_NOT_IN_MABAR");

    const first = await startMatch(o!.id, id, [o!, a!], [b!, c!]);
    expect((await overview(first)).status).toBe("LIVE");
    expect(await errorCode(() => startMatch(o!.id, id, [o!, b!], [a!, c!]))).toBe("MATCH_IN_PROGRESS");
  });

  it("refuses a session that has not started yet", async () => {
    const ps = await Promise.all([1, 2, 3, 4].map(() => createPlayer()));
    const id = await liveSession(ps, { startsInMinutes: 60 });
    expect(await errorCode(() => startMatch(ps[0]!.id, id, [ps[0]!, ps[1]!], [ps[2]!, ps[3]!]))).toBe("MABAR_NOT_LIVE");
  });

  it("numbers matches within a session", async () => {
    const ps = await Promise.all([1, 2].map(() => createPlayer()));
    const id = await liveSession(ps, { format: "SINGLES", type: "CASUAL" });
    const m1 = await startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]);
    await submit(m1, ps[0]!.id);
    const m2 = await startMatch(ps[0]!.id, id, [ps[1]!], [ps[0]!]);
    const { rows } = await db.query<{ seq_no: number }>(`select seq_no from public.matches where id in ($1, $2) order by seq_no`, [m1, m2]);
    expect(rows.map((r) => r.seq_no)).toEqual([1, 2]);
  });
});

describe("submitting results", () => {
  it("is only possible through the service role", async () => {
    const ps = await Promise.all([1, 2].map(() => createPlayer()));
    const id = await liveSession(ps, { format: "SINGLES" });
    const m = await startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]);
    const code = await errorCode(() =>
      as(db, "authenticated", ps[0]!.id, (tx) =>
        tx.query(`select public.submit_match_result($1, $2, $3::jsonb, 'A')`, [m, ps[0]!.id, SETS_A_WINS]),
      ),
    );
    expect(code).toMatch(/permission denied/);
  });

  it("rejects a submit by someone who is not the organizer", async () => {
    const ps = await Promise.all([1, 2].map(() => createPlayer()));
    const id = await liveSession(ps, { format: "SINGLES" });
    const m = await startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]);
    expect(await errorCode(() => submit(m, ps[1]!.id))).toBe("NOT_ORGANIZER");
  });

  it("makes a casual result official at once without touching ratings", async () => {
    const ps = await Promise.all([1, 2].map(() => createPlayer(3.0, 40)));
    const id = await liveSession(ps, { format: "SINGLES", type: "CASUAL" });
    const m = await startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]);
    expect(await submit(m, ps[0]!.id)).toBe("CONFIRMED");
    expect((await overview(m)).status).toBe("COMPLETED");
    expect((await db.query(`select 1 from public.rating_changes where match_id = $1`, [m])).rows).toHaveLength(0);
    expect(await ratingOf(ps[0]!.id)).toEqual({ rating: 3, reliability: 40, matches: 0 });
    const history = await db.query<{ won: boolean }>(`select won from public.player_match_history where match_id = $1 and user_id = $2`, [m, ps[0]!.id]);
    expect(history.rows[0]!.won).toBe(true);
  });

  it("puts a competitive result in PENDING with a 24h deadline", async () => {
    const ps = await Promise.all([1, 2].map(() => createPlayer()));
    const id = await liveSession(ps, { format: "SINGLES" });
    const m = await startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]);
    expect(await submit(m, ps[0]!.id)).toBe("PENDING");
    const o = await overview(m);
    expect(o.status).toBe("PENDING_CONFIRMATION");
    const hours = (o.confirm_deadline!.getTime() - Date.now()) / 3_600_000;
    expect(hours).toBeGreaterThan(23.9);
    expect(hours).toBeLessThanOrEqual(24);
  });
});

describe("confirming competitive results", () => {
  it("applies ratings exactly as the TypeScript formula predicts (doubles)", async () => {
    const o = await createPlayer(3.4, 78);
    const a = await createPlayer(3.2, 40);
    const b = await createPlayer(3.9, 60);
    const c = await createPlayer(3.5, 20);
    const id = await liveSession([o, a, b, c]);
    const m = await startMatch(o.id, id, [o, a], [b, c]);
    await submit(m, o.id); // team A (o + a) wins

    expect(await errorCode(() => confirm(o.id, m))).toBe("CANNOT_CONFIRM_OWN");
    const outsider = await createPlayer();
    expect(await errorCode(() => confirm(outsider.id, m))).toBe("NOT_MATCH_PLAYER");

    await confirm(b.id, m);
    expect((await overview(m)).status).toBe("COMPLETED");

    const avgA = (o.rating + a.rating) / 2;
    const avgB = (b.rating + c.rating) / 2;
    for (const [p, team] of [[o, "A"], [a, "A"], [b, "B"], [c, "B"]] as const) {
      const expected = ratingChange(p, team === "A" ? avgA : avgB, team === "A" ? avgB : avgA, team === "A");
      expect(await ratingOf(p.id)).toEqual({ rating: expected.after, reliability: expected.reliabilityAfter, matches: 1 });
    }
    expect(await errorCode(() => confirm(b.id, m))).toBe("RESULT_NOT_PENDING");
  });

  it("lets any player in the match confirm when the organizer sat out, winners included", async () => {
    const ps = await Promise.all([1, 2, 3, 4, 5, 6].map(() => createPlayer()));
    const id = await liveSession(ps, { max: 6 });
    const m = await startMatch(ps[0]!.id, id, [ps[2]!, ps[3]!], [ps[4]!, ps[5]!]);
    await submit(m, ps[0]!.id);
    expect(await errorCode(() => confirm(ps[1]!.id, m))).toBe("NOT_MATCH_PLAYER");
    await confirm(ps[2]!.id, m); // on the winning team
    expect((await overview(m)).result_status).toBe("CONFIRMED");
  });

  it("supports reject → resubmit → confirm, and ratings only move on the official version", async () => {
    const ps = await Promise.all([1, 2].map(() => createPlayer(3.0, 50)));
    const id = await liveSession(ps, { format: "SINGLES" });
    const m = await startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]);
    await submit(m, ps[0]!.id, SETS_A_WINS, "A");
    await reject(ps[1]!.id, m);

    let o = await overview(m);
    expect([o.status, o.result_status]).toEqual(["PENDING_CONFIRMATION", "REJECTED"]);
    expect(await errorCode(() => confirm(ps[1]!.id, m))).toBe("RESULT_NOT_PENDING");
    expect((await ratingOf(ps[0]!.id)).matches).toBe(0);

    await submit(m, ps[0]!.id, SETS_B_WINS, "B");
    o = await overview(m);
    expect([o.result_status, o.result_version]).toEqual(["PENDING", 2]);

    await confirm(ps[1]!.id, m);
    expect((await ratingOf(ps[1]!.id)).rating).toBeGreaterThan(3);
    expect((await ratingOf(ps[0]!.id)).rating).toBeLessThan(3);
  });

  it("never applies a rating twice", async () => {
    const ps = await Promise.all([1, 2].map(() => createPlayer()));
    const id = await liveSession(ps, { format: "SINGLES" });
    const m = await startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]);
    await submit(m, ps[0]!.id);
    await confirm(ps[1]!.id, m);
    expect(await errorCode(() => db.query(`select public.apply_match_rating($1)`, [m]))).toBe("RATING_ALREADY_APPLIED");
  });
});

describe("finalize_due_results", () => {
  it("auto-confirms results past their deadline and applies ratings", async () => {
    const ps = await Promise.all([1, 2].map(() => createPlayer(3.0, 50)));
    const id = await liveSession(ps, { format: "SINGLES" });
    const m = await startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]);
    await submit(m, ps[0]!.id);
    await db.query(`update public.match_results set confirm_deadline = now() - interval '1 minute' where match_id = $1`, [m]);

    const { rows } = await db.query<{ n: number }>(`select public.finalize_due_results() as n`);
    expect(rows[0]!.n).toBeGreaterThanOrEqual(1);
    const o = await overview(m);
    expect([o.status, o.result_status]).toEqual(["COMPLETED", "AUTO_CONFIRMED"]);
    expect((await ratingOf(ps[0]!.id)).matches).toBe(1);
  });

  it("leaves results that are still within the window", async () => {
    const ps = await Promise.all([1, 2].map(() => createPlayer()));
    const id = await liveSession(ps, { format: "SINGLES" });
    const m = await startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]);
    await submit(m, ps[0]!.id);
    await db.query(`select public.finalize_due_results()`);
    expect((await overview(m)).result_status).toBe("PENDING");
  });

  it("is not callable by players", async () => {
    const p = await createPlayer();
    expect(await errorCode(() => as(db, "authenticated", p.id, (tx) => tx.query(`select public.finalize_due_results()`)))).toMatch(
      /permission denied/,
    );
  });
});

describe("cancel_match and end_mabar", () => {
  it("cancels an unofficial match and keeps it out of history", async () => {
    const ps = await Promise.all([1, 2].map(() => createPlayer()));
    const id = await liveSession(ps, { format: "SINGLES" });
    const m = await startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]);
    await submit(m, ps[0]!.id);
    await as(db, "authenticated", ps[0]!.id, (tx) => tx.query(`select public.cancel_match($1)`, [m]));
    expect((await overview(m)).status).toBe("CANCELLED");
    expect((await db.query(`select 1 from public.player_match_history where match_id = $1`, [m])).rows).toHaveLength(0);
  });

  it("ends a session only when no match is being played, then blocks new matches", async () => {
    const ps = await Promise.all([1, 2].map(() => createPlayer()));
    const id = await liveSession(ps, { format: "SINGLES", type: "CASUAL" });
    const m = await startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]);
    const end = () => as(db, "authenticated", ps[0]!.id, (tx) => tx.query(`select public.end_mabar($1)`, [id]));

    expect(await errorCode(end)).toBe("MATCH_IN_PROGRESS");
    await submit(m, ps[0]!.id);
    await end();
    const { rows } = await db.query<{ effective_status: string }>(`select effective_status from public.mabar_listings where id = $1`, [id]);
    expect(rows[0]!.effective_status).toBe("COMPLETED");
    expect(await errorCode(() => startMatch(ps[0]!.id, id, [ps[0]!], [ps[1]!]))).toBe("MABAR_NOT_LIVE");
  });
});
