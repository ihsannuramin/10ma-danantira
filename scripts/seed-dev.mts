/**
 * Dev seed: 10 players, upcoming mabar, live rotation sessions, pending and
 * rejected results, and a few weeks of match history for manual testing.
 *
 *   npm run db:seed                          # wipe previous seed data, then seed
 *   npm run db:seed -- --join you@email.com  # also involve that existing player (organizer of one
 *                                            # live session, pending confirmations, rating history)
 *   npm run db:seed -- --reset               # only wipe seed data (and undo the joiner's seed ratings)
 *
 * Seed accounts use the @seed.tenma.test domain and share SEED_PASSWORD
 * (default below). Matches go through the same RPCs as the app (start_match,
 * submit_match_result, confirm/reject), so ratings come from the real formula.
 * Only point this at a development project.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const SEED_DOMAIN = "seed.tenma.test";
const PASSWORD = process.env.SEED_PASSWORD ?? "Tenma-Seed-2026!";
// Marks sessions the joiner organizes, so a reset can find them.
const SEED_MARK = "Mabar latihan dari seed data.";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !secret || !publishable) throw new Error("Set the Supabase keys in .env.local");

const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

const args = process.argv.slice(2);
const resetOnly = args.includes("--reset");
const joinEmail = args.includes("--join") ? args[args.indexOf("--join") + 1] : undefined;

/** Throws on error. Data is only null for writes without .select(), whose result we ignore. */
function must<T>(result: { data: T; error: { message: string } | null }, what: string): NonNullable<T> {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
  return result.data as NonNullable<T>;
}

async function allUsers() {
  const users = [];
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 200) return users;
  }
}

// --- Wipe ---------------------------------------------------------------------------

async function wipe() {
  const seedIds = (await allUsers()).filter((u) => u.email?.endsWith(`@${SEED_DOMAIN}`)).map((u) => u.id);
  const owned = seedIds.length ? must(await db.from("mabars").select("id").in("organizer_id", seedIds), "list seed mabar") : [];
  const marked = must(await db.from("mabars").select("id").eq("description", SEED_MARK), "list marked mabar");
  const mabarIds = [...new Set([...owned, ...marked].map((m) => m.id))];

  if (mabarIds.length) {
    // Undo rating changes real players picked up from seed matches.
    const matchIds = must(await db.from("matches").select("id").in("mabar_id", mabarIds), "list seed matches").map((m) => m.id);
    if (matchIds.length) {
      const changes = must(
        await db
          .from("rating_changes")
          .select("user_id, rating_before, reliability_before, created_at")
          .in("match_id", matchIds)
          .order("created_at", { ascending: true }),
        "list seed rating changes",
      ).filter((c) => !seedIds.includes(c.user_id));
      const byUser = new Map<string, { rating: number; reliability: number; count: number }>();
      for (const c of changes) {
        const entry = byUser.get(c.user_id);
        if (entry) entry.count++;
        else byUser.set(c.user_id, { rating: Number(c.rating_before), reliability: c.reliability_before, count: 1 });
      }
      for (const [userId, before] of byUser) {
        const current = must(await db.from("player_ratings").select("matches_counted").eq("user_id", userId).single(), "load rating");
        must(
          await db
            .from("player_ratings")
            .update({ rating: before.rating, reliability: before.reliability, matches_counted: Math.max(0, current.matches_counted - before.count) })
            .eq("user_id", userId),
          "restore rating",
        );
      }
      if (byUser.size) console.log(`Restored seed rating changes for ${byUser.size} real player(s).`);
    }
    must(await db.from("mabars").delete().in("id", mabarIds), "delete seed mabar");
  }
  for (const id of seedIds) {
    const { error } = await db.auth.admin.deleteUser(id);
    if (error) throw new Error(`delete user ${id}: ${error.message}`);
  }
  console.log(`Wiped ${seedIds.length} seed players and ${mabarIds.length} mabar.`);
}

// --- Time helpers (WIB) ------------------------------------------------------------

const WIB = "+07:00";
const todayWib = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const at = (date: string, time: string) => new Date(`${date}T${time}:00${WIB}`).toISOString();
const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000).toISOString();
const plusMinutes = (iso: string, m: number) => new Date(new Date(iso).getTime() + m * 60_000).toISOString();

function nextSaturday(from: string) {
  const dow = new Date(`${from}T00:00:00Z`).getUTCDay();
  return addDays(from, ((6 - dow + 7) % 7) || 7);
}

// --- Players -----------------------------------------------------------------------

type Seed = {
  key: string;
  name: string;
  area: string;
  rating: number;
  reliability: number;
  gender: "MALE" | "FEMALE";
  hand: "RIGHT" | "LEFT";
  style: string;
  objective: string;
  format: "SINGLES" | "DOUBLES" | "BOTH";
  availability: string[];
};

const PLAYERS: Seed[] = [
  { key: "andi", name: "Andi Pratama", area: "Jakarta Selatan", rating: 3.5, reliability: 72, gender: "MALE", hand: "RIGHT", style: "ALL_COURT", objective: "COMPETITIVE", format: "DOUBLES", availability: ["WEEKEND_MORNING", "WEEKDAY_NIGHT"] },
  { key: "budi", name: "Budi Santoso", area: "Jakarta Selatan", rating: 3.4, reliability: 65, gender: "MALE", hand: "RIGHT", style: "BASELINE", objective: "IMPROVE", format: "BOTH", availability: ["WEEKDAY_NIGHT"] },
  { key: "sarah", name: "Sarah Wijaya", area: "Jakarta Selatan", rating: 3.2, reliability: 58, gender: "FEMALE", hand: "RIGHT", style: "COUNTER_PUNCHER", objective: "FUN", format: "DOUBLES", availability: ["WEEKEND_MORNING"] },
  { key: "dika", name: "Dika Ramadhan", area: "Jakarta Pusat", rating: 3.3, reliability: 61, gender: "MALE", hand: "LEFT", style: "AGGRESSIVE_BASELINER", objective: "COMPETITIVE", format: "SINGLES", availability: ["WEEKDAY_NIGHT", "WEEKEND_AFTERNOON"] },
  { key: "rina", name: "Rina Kusuma", area: "Tangerang Selatan", rating: 2.2, reliability: 30, gender: "FEMALE", hand: "RIGHT", style: "STILL_LEARNING", objective: "FUN", format: "DOUBLES", availability: ["WEEKEND_MORNING", "WEEKEND_AFTERNOON"] },
  { key: "fajar", name: "Fajar Nugroho", area: "Tangerang Selatan", rating: 2.8, reliability: 44, gender: "MALE", hand: "RIGHT", style: "BASELINE", objective: "FITNESS", format: "BOTH", availability: ["WEEKDAY_MORNING", "WEEKEND_MORNING"] },
  { key: "maya", name: "Maya Putri", area: "Jakarta Utara", rating: 1.8, reliability: 20, gender: "FEMALE", hand: "RIGHT", style: "STILL_LEARNING", objective: "FUN", format: "BOTH", availability: ["WEEKEND_MORNING"] },
  { key: "reza", name: "Reza Mahendra", area: "Jakarta Pusat", rating: 4.0, reliability: 80, gender: "MALE", hand: "RIGHT", style: "SERVE_AND_VOLLEY", objective: "TOURNAMENT", format: "SINGLES", availability: ["WEEKDAY_MORNING", "WEEKEND_MORNING"] },
  { key: "tiara", name: "Tiara Anggraini", area: "Jakarta Selatan", rating: 2.6, reliability: 38, gender: "FEMALE", hand: "LEFT", style: "ALL_COURT", objective: "IMPROVE", format: "DOUBLES", availability: ["WEEKDAY_NIGHT", "WEEKEND_MORNING"] },
  { key: "kevin", name: "Kevin Halim", area: "Jakarta Utara", rating: 3.8, reliability: 76, gender: "MALE", hand: "RIGHT", style: "AGGRESSIVE_BASELINER", objective: "COMPETITIVE", format: "BOTH", availability: ["WEEKEND_AFTERNOON", "WEEKDAY_NIGHT"] },
];

const ids: Record<string, string> = {};
const sessions = new Map<string, SupabaseClient>();

/** A client signed in as a seed player, for RPCs that act as auth.uid(). */
async function as(key: string): Promise<SupabaseClient> {
  const cached = sessions.get(key);
  if (cached) return cached;
  const client = createClient(url!, publishable!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email: `${key}@${SEED_DOMAIN}`, password: PASSWORD });
  if (error) throw new Error(`sign in ${key}: ${error.message}`);
  sessions.set(key, client);
  return client;
}

// --- Sessions & matches ------------------------------------------------------------------

type SessionSeed = {
  title: string;
  venue: string;
  format: "SINGLES" | "DOUBLES";
  type: "CASUAL" | "COMPETITIVE";
  scoring: "FAST4" | "ONE_SET" | "PRO_SET" | "BEST_OF_3" | "BEST_OF_3_MTB";
  deuce?: "ADVANTAGE" | "NO_AD" | "ONE_DEUCE";
  startsAt: string;
  endsAt: string;
  level: [number, number];
  maxPlayers: number;
  cost: number | null;
  description?: string;
  organizer: string;
  /** Participants besides the organizer, by key; "joiner" is the --join player. */
  players: string[];
};

let venues: { id: string; name: string }[] = [];
let joinerId: string | undefined;
const idOf = (key: string) => (key === "joiner" ? joinerId! : ids[key]!);

async function createSession(s: SessionSeed): Promise<string | null> {
  if (s.organizer === "joiner" && !joinerId) return null;
  const venueId = venues.find((v) => v.name === s.venue)?.id;
  if (!venueId) throw new Error(`Missing venue ${s.venue}. Run npm run db:push first.`);
  // Inserted directly so sessions can start in the past.
  const mabar = must(
    await db
      .from("mabars")
      .insert({
        organizer_id: idOf(s.organizer),
        title: s.title,
        format: s.format,
        match_type: s.type,
        scoring_format: s.scoring,
        deuce_rule: s.deuce ?? "ADVANTAGE",
        starts_at: s.startsAt,
        ends_at: s.endsAt,
        venue_id: venueId,
        level_min: s.level[0],
        level_max: s.level[1],
        max_players: s.maxPlayers,
        cost_per_player: s.cost,
        description: s.description ?? null,
      })
      .select("id")
      .single(),
    `insert ${s.title}`,
  );
  const members = [s.organizer, ...s.players].filter((k) => k !== "joiner" || joinerId).map(idOf);
  must(await db.from("mabar_participants").insert(members.map((user_id) => ({ mabar_id: mabar.id, user_id }))), `participants ${s.title}`);
  return mabar.id;
}

type Sets = [number, number, number?, number?][];
const setJson = (sets: Sets) =>
  sets.map(([a, b, tbA, tbB], i) => ({ set_no: i + 1, games_a: a, games_b: b, tiebreak_a: tbA ?? null, tiebreak_b: tbB ?? null }));

async function startMatch(organizer: string, mabarId: string, teamA: string[], teamB: string[]): Promise<string> {
  const client = await as(organizer);
  const { data, error } = await client.rpc("start_match", { p_mabar_id: mabarId, p_team_a: teamA.map(idOf), p_team_b: teamB.map(idOf) });
  if (error) throw new Error(`start_match: ${error.message}`);
  return data as string;
}

async function submit(matchId: string, organizer: string, sets: Sets, winner: "A" | "B") {
  must(
    await db.rpc("submit_match_result", { p_match_id: matchId, p_actor_id: ids[organizer], p_sets: setJson(sets), p_winner: winner }),
    "submit_match_result",
  );
}

async function confirm(matchId: string, player: string) {
  const { error } = await (await as(player)).rpc("confirm_match_result", { p_match_id: matchId });
  if (error) throw new Error(`confirm: ${error.message}`);
}

/** Moves a finished match's timestamps to when it was "played", for realistic history and charts. */
async function backdate(matchId: string, playedAt: string) {
  must(await db.from("matches").update({ started_at: playedAt, completed_at: plusMinutes(playedAt, 40) }).eq("id", matchId), "backdate match");
  must(
    await db.from("match_results").update({ submitted_at: plusMinutes(playedAt, 40), confirmed_at: plusMinutes(playedAt, 60) }).eq("match_id", matchId),
    "backdate result",
  );
  must(await db.from("rating_changes").update({ created_at: plusMinutes(playedAt, 60) }).eq("match_id", matchId), "backdate rating");
}

async function endSession(organizer: string, mabarId: string) {
  const { error } = await (await as(organizer)).rpc("end_mabar", { p_mabar_id: mabarId });
  if (error) throw new Error(`end_mabar: ${error.message}`);
}

// --- Run -------------------------------------------------------------------------------

async function seed() {
  const areas = must(await db.from("areas").select("id, name"), "load areas");
  venues = must(await db.from("venues").select("id, name"), "load venues");
  const areaId = (name: string) => areas.find((a) => a.name === name)?.id ?? fail(`area ${name}`);

  if (joinEmail) {
    const user = (await allUsers()).find((u) => u.email === joinEmail);
    if (!user) throw new Error(`--join: no user with email ${joinEmail}`);
    const profile = must(await db.from("profiles").select("user_id").eq("user_id", user.id).maybeSingle(), "load joiner");
    if (!profile) throw new Error(`--join: ${joinEmail} has not finished onboarding yet`);
    joinerId = user.id;
  }
  const J = joinerId ? "joiner" : "kevin"; // stand-in when no joiner is given

  for (const p of PLAYERS) {
    const { data, error } = await db.auth.admin.createUser({
      email: `${p.key}@${SEED_DOMAIN}`,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: p.name },
    });
    if (error) throw new Error(`create ${p.key}: ${error.message}`);
    ids[p.key] = data.user.id;
    must(
      await db.rpc("complete_onboarding", {
        p_user_id: data.user.id,
        p_display_name: p.name,
        p_photo_url: null,
        p_area_id: areaId(p.area),
        p_gender: p.gender,
        p_dominant_hand: p.hand,
        p_playing_style: p.style,
        p_playing_objective: p.objective,
        p_preferred_format: p.format,
        p_availability: p.availability,
        p_rating: p.rating,
        p_reliability: p.reliability,
        p_assessment: { source: "seed" },
      }),
      `onboard ${p.key}`,
    );
  }
  console.log(`Created ${PLAYERS.length} players.`);

  const today = todayWib();
  const tomorrow = addDays(today, 1);
  const saturday = nextSaturday(today);
  const hourWib = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
  const tonight = hourWib < 18 ? today : tomorrow;

  // 1. History: past sessions, oldest first so ratings evolve in order.
  const history: { daysAgo: number; title: string; type: "CASUAL" | "COMPETITIVE"; organizer: string; players: string[]; a: string[]; b: string[]; sets: Sets; winner: "A" | "B"; confirmer: string }[] = [
    { daysAgo: 24, title: "Rabu Malam — Senayan", type: "COMPETITIVE", organizer: "andi", players: ["budi", "sarah", J], a: ["andi", J], b: ["budi", "sarah"], sets: [[6, 4]], winner: "A", confirmer: "budi" },
    { daysAgo: 19, title: "Weekend Rally — BSD", type: "CASUAL", organizer: "fajar", players: ["tiara", "rina", J], a: ["fajar", "rina"], b: [J, "tiara"], sets: [[4, 6]], winner: "B", confirmer: "tiara" },
    { daysAgo: 15, title: "Doubles Kompetitif — Kemang", type: "COMPETITIVE", organizer: "kevin", players: ["dika", "andi", J], a: ["kevin", "dika"], b: ["andi", J], sets: [[6, 3]], winner: "A", confirmer: "andi" },
    { daysAgo: 10, title: "After Office — Kemang", type: "COMPETITIVE", organizer: "budi", players: ["sarah", "tiara", J], a: [J, "tiara"], b: ["budi", "sarah"], sets: [[7, 6, 7, 5]], winner: "A", confirmer: "sarah" },
    { daysAgo: 6, title: "Pagi Seru — Kelapa Gading", type: "COMPETITIVE", organizer: "dika", players: ["sarah", "fajar", J], a: ["dika", "fajar"], b: [J, "sarah"], sets: [[6, 2]], winner: "A", confirmer: "sarah" },
    { daysAgo: 3, title: "Malam Rotasi — Senayan", type: "COMPETITIVE", organizer: "sarah", players: ["tiara", "budi", J], a: [J, "budi"], b: ["sarah", "tiara"], sets: [[6, 4]], winner: "A", confirmer: "tiara" },
  ];
  for (const h of history) {
    const day = addDays(today, -h.daysAgo);
    const startsAt = at(day, "19:00");
    const id = (await createSession({
      title: h.title, venue: "Senayan Tennis Club", format: "DOUBLES", type: h.type, scoring: "ONE_SET",
      startsAt, endsAt: at(day, "21:00"), level: [2.5, 4.0], maxPlayers: 4, cost: 80000, organizer: h.organizer, players: h.players,
    }))!;
    const m = await startMatch(h.organizer, id, h.a, h.b);
    await submit(m, h.organizer, h.sets, h.winner);
    if (h.type === "COMPETITIVE") await confirm(m, h.confirmer);
    await backdate(m, plusMinutes(startsAt, 5));
    await endSession(h.organizer, id);
  }
  console.log(`Created ${history.length} past sessions with history.`);

  // 2. Yesterday's session: one result waiting on the joiner, one rejected.
  const y = addDays(today, -1);
  const pendingSession = (await createSession({
    title: "Kemarin Sore — Kemang", venue: "Kemang Tennis Club", format: "DOUBLES", type: "COMPETITIVE", scoring: "ONE_SET",
    startsAt: at(y, "16:00"), endsAt: at(y, "18:00"), level: [2.5, 3.5], maxPlayers: 6, cost: 75000, organizer: "sarah",
    players: ["tiara", "budi", "andi", J],
  }))!;
  const pendingMatch = await startMatch("sarah", pendingSession, [J, "sarah"], ["budi", "tiara"]);
  await submit(pendingMatch, "sarah", [[6, 4]], "A");
  const rejectedMatch = await startMatch("sarah", pendingSession, ["sarah", "andi"], ["tiara", J]);
  await submit(rejectedMatch, "sarah", [[7, 5]], "A");
  const { error: rejectError } = await (await as("tiara")).rpc("reject_match_result", {
    p_match_id: rejectedMatch,
    p_reason: "Set 1 harusnya 5-7 untuk tim kami.",
  });
  if (rejectError) throw new Error(`reject: ${rejectError.message}`);
  await endSession("sarah", pendingSession);

  // 3. Live rotation now: 6 players, Fast4, match 1 done, match 2 being played.
  const liveRotation = (await createSession({
    title: "Rotasi Malam — Kemang", venue: "Kemang Tennis Club", format: "DOUBLES", type: "COMPETITIVE", scoring: "FAST4", deuce: "NO_AD",
    startsAt: minutesFromNow(-60), endsAt: minutesFromNow(60), level: [2.5, 3.5], maxPlayers: 8, cost: 75000, organizer: "andi",
    players: ["budi", "sarah", "tiara", "dika", J], description: "Format 4 games, sudden deuce. Rotasi tiap match.",
  }))!;
  const m1 = await startMatch("andi", liveRotation, ["andi", "budi"], ["sarah", J]);
  await submit(m1, "andi", [[4, 2]], "A");
  await confirm(m1, "sarah");
  const m2 = await startMatch("andi", liveRotation, ["dika", "tiara"], ["budi", J]);
  must(await db.rpc("save_match_draft", { p_match_id: m2, p_actor_id: ids.andi, p_sets: setJson([[2, 1]]) }), "draft");

  // 4. Live sessions with no match yet, to try the organizer flow.
  await createSession({
    title: "Singles Showdown", venue: "Senayan Tennis Club", format: "SINGLES", type: "COMPETITIVE", scoring: "BEST_OF_3_MTB",
    startsAt: minutesFromNow(-20), endsAt: minutesFromNow(100), level: [3.5, 4.5], maxPlayers: 2, cost: 100000, organizer: "reza", players: ["kevin"],
  });
  if (joinerId) {
    await createSession({
      title: "Rotasi Kamu — Kemang", venue: "Kemang Tennis Club", format: "DOUBLES", type: "COMPETITIVE", scoring: "FAST4", deuce: "NO_AD",
      startsAt: minutesFromNow(-15), endsAt: minutesFromNow(105), level: [2.5, 4.0], maxPlayers: 8, cost: 70000, organizer: "joiner",
      players: ["andi", "budi", "sarah", "tiara", "fajar"], description: SEED_MARK,
    });
  }

  // 5. Upcoming sessions with a spread of formats.
  const upcoming: SessionSeed[] = [
    { title: "Tennis Mabar — Kemang", venue: "Kemang Tennis Club", format: "DOUBLES", type: "CASUAL", scoring: "ONE_SET", startsAt: at(tomorrow, "07:00"), endsAt: at(tomorrow, "09:00"), level: [2.5, 3.5], maxPlayers: 4, cost: 75000, organizer: "andi", players: ["budi", "sarah"], description: "Bola disediakan. Parkir di basement." },
    { title: "Fun Tennis — BSD", venue: "BSD Tennis Club", format: "DOUBLES", type: "CASUAL", scoring: "FAST4", deuce: "ONE_DEUCE", startsAt: at(tonight, "19:00"), endsAt: at(tonight, "21:00"), level: [2.0, 3.0], maxPlayers: 6, cost: 80000, organizer: "fajar", players: ["rina", "tiara"], description: "Rotasi 6 orang, 4 games per match." },
    { title: "Beginner Friendly — BSD", venue: "BSD Tennis Club", format: "DOUBLES", type: "CASUAL", scoring: "FAST4", deuce: "NO_AD", startsAt: at(tomorrow, "16:00"), endsAt: at(tomorrow, "18:00"), level: [1.0, 2.5], maxPlayers: 8, cost: 50000, organizer: "rina", players: ["maya"], description: "Santai, cocok buat yang baru mulai." },
    { title: "Doubles Seru — Senayan", venue: "Senayan Tennis Club", format: "DOUBLES", type: "COMPETITIVE", scoring: "BEST_OF_3_MTB", startsAt: at(addDays(today, 2), "19:00"), endsAt: at(addDays(today, 2), "21:00"), level: [3.0, 4.0], maxPlayers: 4, cost: 90000, organizer: "dika", players: ["kevin", "andi", "budi"] },
    { title: "Competitive Match", venue: "Senayan Tennis Club", format: "SINGLES", type: "COMPETITIVE", scoring: "BEST_OF_3", startsAt: at(saturday, "07:00"), endsAt: at(saturday, "09:00"), level: [3.5, 4.5], maxPlayers: 2, cost: 100000, organizer: "reza", players: [] },
    { title: "Pro Set Sabtu — Kelapa Gading", venue: "Kelapa Gading Club", format: "SINGLES", type: "COMPETITIVE", scoring: "PRO_SET", startsAt: at(saturday, "16:00"), endsAt: at(saturday, "18:00"), level: [3.0, 4.0], maxPlayers: 4, cost: null, organizer: "kevin", players: [], description: "Singles rotasi 4 orang, pro set 8 games." },
  ];
  for (const s of upcoming) await createSession(s);

  console.log(`Created live sessions (rotation with match in progress${joinerId ? ", one organized by you" : ""}), a pending and a rejected result, and ${upcoming.length} upcoming mabar.`);
}

function fail(what: string): never {
  throw new Error(`Missing reference data: ${what}. Run npm run db:push first.`);
}

await wipe();
if (!resetOnly) {
  await seed();
  console.log(`\nLog in as any seed player, e.g. andi@${SEED_DOMAIN} / ${PASSWORD}`);
}
