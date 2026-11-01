import { randomUUID } from "node:crypto";
import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, errorCode } from "./harness";

let db: PGlite;
let areaId: string;
let venueId: string;

const HOUR = 3_600_000;
const inHours = (h: number) => new Date(Date.now() + h * HOUR).toISOString();

async function createPlayer(rating: number, name = "Player"): Promise<string> {
  const id = randomUUID();
  await db.query(`insert into auth.users (id, email) values ($1, $2)`, [id, `${id}@test.local`]);
  await as(db, "service_role", null, (tx) =>
    tx.query(
      `select public.complete_onboarding($1, $2, null, $3, null, null, 'ALL_COURT', 'FUN', 'BOTH', '{}', $4, 20::smallint, '{}'::jsonb)`,
      [id, name, areaId, rating],
    ),
  );
  return id;
}

async function createMabar(
  organizerId: string,
  opts: { format?: "SINGLES" | "DOUBLES"; levelMin?: number; levelMax?: number; startsInHours?: number; title?: string | null } = {},
): Promise<string> {
  const startsIn = opts.startsInHours ?? 24;
  const { rows } = await as(db, "authenticated", organizerId, (tx) =>
    tx.query<{ id: string }>(
      `select public.create_mabar($1, $2, 'CASUAL', $3, $4, $5, $6, $7, 75000, null, null, null, null) as id`,
      [
        opts.title ?? null,
        opts.format ?? "DOUBLES",
        inHours(startsIn),
        inHours(startsIn + 2),
        venueId,
        opts.levelMin ?? 2.5,
        opts.levelMax ?? 3.5,
      ],
    ),
  );
  return rows[0]!.id;
}

const join = (userId: string, mabarId: string) =>
  as(db, "authenticated", userId, (tx) => tx.query(`select public.join_mabar($1)`, [mabarId]));
const leave = (userId: string, mabarId: string) =>
  as(db, "authenticated", userId, (tx) => tx.query(`select public.leave_mabar($1)`, [mabarId]));
const cancel = (userId: string, mabarId: string) =>
  as(db, "authenticated", userId, (tx) => tx.query(`select public.cancel_mabar($1)`, [mabarId]));

async function listing(mabarId: string) {
  const { rows } = await db.query<{ participant_count: number; effective_status: string; title: string }>(
    `select participant_count, effective_status, title from public.mabar_listings where id = $1`,
    [mabarId],
  );
  return rows[0]!;
}

beforeAll(async () => {
  db = await createTestDb();
  const area = await db.query<{ id: string }>(`select id from public.areas where name = 'Jakarta Selatan'`);
  areaId = area.rows[0]!.id;
  const venue = await db.query<{ id: string }>(`select id from public.venues where name = 'Kemang Tennis Club'`);
  venueId = venue.rows[0]!.id;
}, 60_000);

describe("onboarding and ratings", () => {
  it("creates profile and rating together through the service role", async () => {
    const id = await createPlayer(3.17, "Ihsan");
    const { rows } = await db.query<{ rating: string; reliability: number }>(
      `select rating, reliability from public.player_ratings where user_id = $1`,
      [id],
    );
    expect(rows[0]).toEqual({ rating: "3.17", reliability: 20 });
  });

  it("refuses to onboard the same player twice", async () => {
    const id = await createPlayer(3.0);
    const code = await errorCode(() =>
      as(db, "service_role", null, (tx) =>
        tx.query(
          `select public.complete_onboarding($1, 'Again', null, $2, null, null, 'ALL_COURT', 'FUN', 'BOTH', '{}', 4.0, 20::smallint, '{}'::jsonb)`,
          [id, areaId],
        ),
      ),
    );
    expect(code).toBe("ALREADY_ONBOARDED");
  });

  it("does not let a player call onboarding directly", async () => {
    const id = randomUUID();
    await db.query(`insert into auth.users (id) values ($1)`, [id]);
    const code = await errorCode(() =>
      as(db, "authenticated", id, (tx) =>
        tx.query(
          `select public.complete_onboarding($1, 'Hacker', null, $2, null, null, 'ALL_COURT', 'FUN', 'BOTH', '{}', 7.0, 100::smallint, '{}'::jsonb)`,
          [id, areaId],
        ),
      ),
    );
    expect(code).toMatch(/permission denied/);
  });

  it("does not let a player change their own rating", async () => {
    const id = await createPlayer(2.0);
    const { affectedRows } = await as(db, "authenticated", id, (tx) =>
      tx.query(`update public.player_ratings set rating = 7.0 where user_id = $1`, [id]),
    );
    expect(affectedRows).toBe(0);
    const { rows } = await db.query<{ rating: string }>(`select rating from public.player_ratings where user_id = $1`, [id]);
    expect(rows[0]!.rating).toBe("2.00");
  });

  it("lets a player edit their own profile but not someone else's", async () => {
    const me = await createPlayer(3.0, "Me");
    const other = await createPlayer(3.0, "Other");
    await as(db, "authenticated", me, (tx) => tx.query(`update public.profiles set display_name = 'Me Too' where user_id = $1`, [me]));
    const { affectedRows } = await as(db, "authenticated", me, (tx) =>
      tx.query(`update public.profiles set display_name = 'Pwned' where user_id = $1`, [other]),
    );
    expect(affectedRows).toBe(0);
  });
});

describe("create_mabar", () => {
  it("makes the organizer the first participant and defaults the title from the area", async () => {
    const organizer = await createPlayer(3.0);
    const id = await createMabar(organizer);
    expect(await listing(id)).toEqual({
      participant_count: 1,
      effective_status: "OPEN",
      title: "Tennis Mabar — Jakarta Selatan",
    });
  });

  it("requires a profile (BR-001)", async () => {
    const id = randomUUID();
    await db.query(`insert into auth.users (id) values ($1)`, [id]);
    expect(await errorCode(() => createMabar(id))).toBe("PROFILE_REQUIRED");
  });

  it("rejects a start time in the past", async () => {
    const organizer = await createPlayer(3.0);
    expect(await errorCode(() => createMabar(organizer, { startsInHours: -1 }))).toBe("START_IN_PAST");
  });

  it("rejects an inverted level range via constraint", async () => {
    const organizer = await createPlayer(3.0);
    expect(await errorCode(() => createMabar(organizer, { levelMin: 4, levelMax: 3 }))).toMatch(/mabars_level_range/);
  });

  it("blocks direct inserts that bypass the function", async () => {
    const organizer = await createPlayer(3.0);
    const code = await errorCode(() =>
      as(db, "authenticated", organizer, (tx) =>
        tx.query(
          `insert into public.mabars (organizer_id, title, format, match_type, starts_at, ends_at, venue_id, level_min, level_max, max_players)
           values ($1, 'Sneaky', 'SINGLES', 'CASUAL', $2, $3, $4, 1, 7, 2)`,
          [organizer, inHours(5), inHours(6), venueId],
        ),
      ),
    );
    expect(code).toMatch(/row-level security/);
  });
});

describe("join_mabar", () => {
  it("adds an eligible player and counts them", async () => {
    const organizer = await createPlayer(3.0);
    const player = await createPlayer(3.2);
    const id = await createMabar(organizer);
    await join(player, id);
    expect((await listing(id)).participant_count).toBe(2);
  });

  it("rejects a second join by the same player (BR-003)", async () => {
    const organizer = await createPlayer(3.0);
    const player = await createPlayer(3.2);
    const id = await createMabar(organizer);
    await join(player, id);
    expect(await errorCode(() => join(player, id))).toBe("ALREADY_JOINED");
  });

  it("rejects a full mabar and reports it as FULL (BR-002)", async () => {
    const organizer = await createPlayer(3.0);
    const id = await createMabar(organizer, { format: "SINGLES" });
    await join(await createPlayer(3.0), id);
    expect((await listing(id)).effective_status).toBe("FULL");
    expect(await errorCode(async () => join(await createPlayer(3.0), id))).toBe("MABAR_FULL");
  });

  it("rejects players outside the level range", async () => {
    const organizer = await createPlayer(3.0);
    const id = await createMabar(organizer, { levelMin: 3.5, levelMax: 4.5 });
    expect(await errorCode(async () => join(await createPlayer(3.42), id))).toBe("LEVEL_NOT_ELIGIBLE");
  });

  it("rejects a mabar that has already started (BR-004) and reports EXPIRED", async () => {
    const organizer = await createPlayer(3.0);
    const id = await createMabar(organizer);
    await db.query(`update public.mabars set starts_at = now() - interval '1 minute', ends_at = now() + interval '1 hour' where id = $1`, [id]);
    expect((await listing(id)).effective_status).toBe("EXPIRED");
    expect(await errorCode(async () => join(await createPlayer(3.0), id))).toBe("MABAR_STARTED");
  });

  it("rejects players without a profile and unknown mabars", async () => {
    const organizer = await createPlayer(3.0);
    const id = await createMabar(organizer);
    const noProfile = randomUUID();
    await db.query(`insert into auth.users (id) values ($1)`, [noProfile]);
    expect(await errorCode(() => join(noProfile, id))).toBe("PROFILE_REQUIRED");
    expect(await errorCode(async () => join(await createPlayer(3.0), randomUUID()))).toBe("MABAR_NOT_FOUND");
  });

  it("blocks direct participant inserts", async () => {
    const organizer = await createPlayer(3.0);
    const player = await createPlayer(3.0);
    const id = await createMabar(organizer);
    const code = await errorCode(() =>
      as(db, "authenticated", player, (tx) =>
        tx.query(`insert into public.mabar_participants (mabar_id, user_id) values ($1, $2)`, [id, player]),
      ),
    );
    expect(code).toMatch(/row-level security/);
  });
});

describe("leave_mabar and cancel_mabar", () => {
  it("lets a participant leave and frees the slot", async () => {
    const organizer = await createPlayer(3.0);
    const player = await createPlayer(3.0);
    const id = await createMabar(organizer);
    await join(player, id);
    await leave(player, id);
    expect((await listing(id)).participant_count).toBe(1);
    expect(await errorCode(() => leave(player, id))).toBe("NOT_PARTICIPANT");
  });

  it("does not let the organizer leave their own mabar", async () => {
    const organizer = await createPlayer(3.0);
    const id = await createMabar(organizer);
    expect(await errorCode(() => leave(organizer, id))).toBe("ORGANIZER_CANNOT_LEAVE");
  });

  it("only lets the organizer cancel, then blocks joins (BR-009 status)", async () => {
    const organizer = await createPlayer(3.0);
    const player = await createPlayer(3.0);
    const id = await createMabar(organizer);
    expect(await errorCode(() => cancel(player, id))).toBe("NOT_ORGANIZER");
    await cancel(organizer, id);
    expect((await listing(id)).effective_status).toBe("CANCELLED");
    expect(await errorCode(() => join(player, id))).toBe("MABAR_CANCELLED");
    expect(await errorCode(() => cancel(organizer, id))).toBe("MABAR_CANCELLED");
  });
});

describe("search_mabars and my_mabars", () => {
  it("filters by format, level overlap, query and paginates by keyset", async () => {
    const organizer = await createPlayer(3.0);
    const searcher = await createPlayer(3.0);
    const tag = `Tag${Date.now()}`;
    const a = await createMabar(organizer, { title: `${tag} A`, startsInHours: 30 });
    const b = await createMabar(organizer, { title: `${tag} B`, startsInHours: 31, format: "SINGLES" });
    const c = await createMabar(organizer, { title: `${tag} C`, startsInHours: 32, levelMin: 4.5, levelMax: 5.5 });

    const search = (args: string, params: unknown[]) =>
      as(db, "authenticated", searcher, (tx) =>
        tx.query<{ id: string; starts_at: Date }>(`select id, starts_at from public.search_mabars(${args})`, params),
      );

    const all = await search(`p_query => $1`, [tag.toLowerCase()]);
    expect(all.rows.map((r) => r.id)).toEqual([a, b, c]);

    const doubles = await search(`p_query => $1, p_format => 'DOUBLES'`, [tag]);
    expect(doubles.rows.map((r) => r.id)).toEqual([a, c]);

    const intermediate = await search(`p_query => $1, p_level_min => 2.5, p_level_max => 3.0`, [tag]);
    expect(intermediate.rows.map((r) => r.id)).toEqual([a, b]);

    const page1 = await search(`p_query => $1, p_limit => 2`, [tag]);
    const last = page1.rows.at(-1)!;
    const page2 = await search(`p_query => $1, p_after_starts_at => $2, p_after_id => $3, p_limit => 2`, [
      tag,
      last.starts_at,
      last.id,
    ]);
    expect(page2.rows.map((r) => r.id)).toEqual([c]);
  });

  it("hides cancelled sessions from search but keeps them in the organizer's past list", async () => {
    const organizer = await createPlayer(3.0);
    const tag = `Gone${Date.now()}`;
    const id = await createMabar(organizer, { title: tag });
    await cancel(organizer, id);
    const found = await as(db, "authenticated", organizer, (tx) =>
      tx.query(`select id from public.search_mabars(p_query => $1)`, [tag]),
    );
    expect(found.rows).toHaveLength(0);

    const past = await as(db, "authenticated", organizer, (tx) =>
      tx.query<{ id: string }>(`select id from public.my_mabars('past')`),
    );
    expect(past.rows.map((r) => r.id)).toContain(id);
  });

  it("lists only the player's own upcoming sessions", async () => {
    const organizer = await createPlayer(3.0);
    const player = await createPlayer(3.0);
    const mine = await createMabar(organizer);
    const notMine = await createMabar(organizer);
    await join(player, mine);
    const upcoming = await as(db, "authenticated", player, (tx) =>
      tx.query<{ id: string }>(`select id from public.my_mabars('upcoming')`),
    );
    const ids = upcoming.rows.map((r) => r.id);
    expect(ids).toContain(mine);
    expect(ids).not.toContain(notMine);
  });

  it("is not callable anonymously", async () => {
    const code = await errorCode(() => as(db, "anon", null, (tx) => tx.query(`select * from public.search_mabars()`)));
    expect(code).toMatch(/permission denied/);
  });
});
