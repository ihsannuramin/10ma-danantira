-- Iteration 2: rotation sessions, live matches, results, confirmation and ratings.
--
-- A mabar is now a session (2–8 players on one court) that holds any number of
-- matches. Score rules are validated in TypeScript (src/domain/match/scoring.ts)
-- before submit_match_result is called with the service role. Ratings are
-- computed here, atomically with confirmation (mirrored in
-- src/domain/rating/rating.service.ts, kept in step by a PGlite parity test).

create type public.scoring_format as enum ('FAST4', 'ONE_SET', 'PRO_SET', 'BEST_OF_3', 'BEST_OF_3_MTB');
create type public.deuce_rule as enum ('ADVANTAGE', 'NO_AD', 'ONE_DEUCE');
create type public.match_status as enum ('LIVE', 'PENDING_CONFIRMATION', 'COMPLETED', 'CANCELLED');
create type public.result_status as enum ('PENDING', 'REJECTED', 'CONFIRMED', 'AUTO_CONFIRMED');
create type public.match_team as enum ('A', 'B');

-- Sessions ----------------------------------------------------------------------

alter table public.mabars
  add column scoring_format public.scoring_format not null default 'ONE_SET',
  add column deuce_rule public.deuce_rule not null default 'ADVANTAGE',
  drop constraint mabars_max_players,
  add constraint mabars_max_players check (
    (format = 'SINGLES' and max_players between 2 and 8) or (format = 'DOUBLES' and max_players between 4 and 8)
  );

-- Players needed on court for one match.
create function public.mabar_min_players(p_format public.mabar_format) returns integer
language sql immutable set search_path = '' as $$
  select case p_format when 'SINGLES' then 2 else 4 end
$$;

-- Mirrors getEffectiveStatus in src/domain/mabar/mabar.service.ts. Once started,
-- a session with enough players for one match is LIVE until it is ended.
create function public.mabar_effective_status(
  p_status public.mabar_status,
  p_format public.mabar_format,
  p_starts_at timestamptz,
  p_participant_count integer,
  p_max_players integer
) returns public.mabar_status
language sql stable set search_path = '' as $$
  select case
    when p_status in ('CANCELLED', 'COMPLETED') then p_status
    when now() >= p_starts_at then
      case when p_participant_count >= public.mabar_min_players(p_format)
        then 'LIVE'::public.mabar_status
        else 'EXPIRED'::public.mabar_status
      end
    when p_participant_count >= p_max_players then 'FULL'::public.mabar_status
    else 'OPEN'::public.mabar_status
  end
$$;

create or replace view public.mabar_listings with (security_invoker = true) as
select
  m.id,
  m.organizer_id,
  p.display_name as organizer_name,
  m.title,
  m.format,
  m.match_type,
  m.starts_at,
  m.ends_at,
  m.venue_id,
  v.name as venue_name,
  v.area_id,
  a.name as area_name,
  m.level_min,
  m.level_max,
  m.max_players,
  m.participant_count,
  m.cost_per_player,
  m.description,
  m.status,
  public.mabar_effective_status(m.status, m.format, m.starts_at, m.participant_count, m.max_players) as effective_status,
  m.created_at,
  m.scoring_format,
  m.deuce_rule
from public.mabars m
join public.venues v on v.id = m.venue_id
join public.areas a on a.id = v.area_id
join public.profiles p on p.user_id = m.organizer_id;

drop function public.mabar_effective_status(public.mabar_status, timestamptz, integer, integer);

drop function public.create_mabar(text, public.mabar_format, public.match_type, timestamptz, timestamptz, uuid, numeric, numeric, integer, text);

create function public.create_mabar(
  p_title text,
  p_format public.mabar_format,
  p_match_type public.match_type,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_venue_id uuid,
  p_level_min numeric,
  p_level_max numeric,
  p_cost_per_player integer,
  p_description text,
  p_max_players integer,
  p_scoring_format public.scoring_format,
  p_deuce_rule public.deuce_rule
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_area_name text;
  v_id uuid;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if not exists (select 1 from public.profiles where user_id = v_uid) then
    raise exception 'PROFILE_REQUIRED';
  end if;
  if p_starts_at <= now() then raise exception 'START_IN_PAST'; end if;

  select a.name into v_area_name
  from public.venues v join public.areas a on a.id = v.area_id
  where v.id = p_venue_id;
  if v_area_name is null then raise exception 'VENUE_NOT_FOUND'; end if;

  insert into public.mabars (
    organizer_id, title, format, match_type, starts_at, ends_at, venue_id,
    level_min, level_max, max_players, cost_per_player, description, scoring_format, deuce_rule
  ) values (
    v_uid,
    coalesce(nullif(trim(p_title), ''), 'Tennis Mabar — ' || v_area_name),
    p_format, p_match_type, p_starts_at, p_ends_at, p_venue_id,
    p_level_min, p_level_max,
    coalesce(p_max_players, public.mabar_min_players(p_format)),
    p_cost_per_player, nullif(trim(p_description), ''),
    coalesce(p_scoring_format, 'ONE_SET'), coalesce(p_deuce_rule, 'ADVANTAGE')
  ) returning id into v_id;

  insert into public.mabar_participants (mabar_id, user_id) values (v_id, v_uid);
  return v_id;
end;
$$;

-- Matches -------------------------------------------------------------------------

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  mabar_id uuid not null references public.mabars (id) on delete cascade,
  seq_no smallint not null check (seq_no > 0),
  status public.match_status not null default 'LIVE',
  format public.mabar_format not null,
  match_type public.match_type not null,
  scoring_format public.scoring_format not null,
  created_by uuid not null references public.profiles (user_id),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mabar_id, seq_no)
);
-- One court: at most one match being played per session.
create unique index matches_one_live_per_mabar on public.matches (mabar_id) where status = 'LIVE';

create table public.match_players (
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  team public.match_team not null,
  primary key (match_id, user_id)
);
create index match_players_user_id_idx on public.match_players (user_id);

create table public.match_sets (
  match_id uuid not null references public.matches (id) on delete cascade,
  set_no smallint not null check (set_no between 1 and 3),
  games_a smallint not null check (games_a between 0 and 30),
  games_b smallint not null check (games_b between 0 and 30),
  tiebreak_a smallint check (tiebreak_a between 0 and 99),
  tiebreak_b smallint check (tiebreak_b between 0 and 99),
  is_match_tiebreak boolean not null default false,
  primary key (match_id, set_no)
);

create table public.match_results (
  match_id uuid primary key references public.matches (id) on delete cascade,
  winner_team public.match_team not null,
  status public.result_status not null,
  version integer not null default 1,
  submitted_by uuid not null references public.profiles (user_id),
  submitted_at timestamptz not null default now(),
  confirm_deadline timestamptz,
  confirmed_by uuid references public.profiles (user_id),
  confirmed_at timestamptz,
  rejected_by uuid references public.profiles (user_id),
  rejected_at timestamptz,
  rejection_reason text check (char_length(rejection_reason) <= 200)
);
create index match_results_pending_deadline_idx on public.match_results (confirm_deadline) where status = 'PENDING';

-- One row per player per official competitive match. The primary key makes
-- applying a rating twice impossible.
create table public.rating_changes (
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  rating_before numeric(3, 2) not null,
  rating_after numeric(3, 2) not null,
  delta numeric(4, 2) not null,
  reliability_before smallint not null,
  reliability_after smallint not null,
  created_at timestamptz not null default now(),
  primary key (match_id, user_id)
);
create index rating_changes_user_created_idx on public.rating_changes (user_id, created_at);

create trigger matches_touch before update on public.matches
  for each row execute function public.touch_updated_at();

alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.match_sets enable row level security;
alter table public.match_results enable row level security;
alter table public.rating_changes enable row level security;

create policy "matches readable by players" on public.matches for select to authenticated using (true);
create policy "match players readable by players" on public.match_players for select to authenticated using (true);
create policy "match sets readable by players" on public.match_sets for select to authenticated using (true);
create policy "match results readable by players" on public.match_results for select to authenticated using (true);
create policy "rating changes readable by players" on public.rating_changes for select to authenticated using (true);
-- No write policies: all writes go through the functions below.

-- Read models -----------------------------------------------------------------------

create view public.match_overview with (security_invoker = true) as
select
  mt.id as match_id,
  mt.mabar_id,
  mt.seq_no,
  mt.status,
  mt.format,
  mt.match_type,
  mt.scoring_format,
  mt.started_at,
  mt.completed_at,
  mb.organizer_id,
  mb.title as mabar_title,
  r.winner_team,
  r.status as result_status,
  r.version as result_version,
  r.submitted_by,
  r.submitted_at,
  r.confirm_deadline,
  r.confirmed_by,
  r.rejected_by,
  r.rejection_reason,
  array(select mp.user_id from public.match_players mp where mp.match_id = mt.id) as player_ids,
  coalesce((
    select jsonb_agg(jsonb_build_object('user_id', p.user_id, 'name', p.display_name, 'photo_url', p.photo_url) order by p.display_name)
    from public.match_players mp join public.profiles p on p.user_id = mp.user_id
    where mp.match_id = mt.id and mp.team = 'A'
  ), '[]'::jsonb) as team_a,
  coalesce((
    select jsonb_agg(jsonb_build_object('user_id', p.user_id, 'name', p.display_name, 'photo_url', p.photo_url) order by p.display_name)
    from public.match_players mp join public.profiles p on p.user_id = mp.user_id
    where mp.match_id = mt.id and mp.team = 'B'
  ), '[]'::jsonb) as team_b,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'set_no', s.set_no, 'games_a', s.games_a, 'games_b', s.games_b,
      'tiebreak_a', s.tiebreak_a, 'tiebreak_b', s.tiebreak_b, 'is_match_tiebreak', s.is_match_tiebreak
    ) order by s.set_no)
    from public.match_sets s where s.match_id = mt.id
  ), '[]'::jsonb) as sets
from public.matches mt
join public.mabars mb on mb.id = mt.mabar_id
left join public.match_results r on r.match_id = mt.id;

-- One row per player per completed match (BR-009: cancelled matches never appear).
create view public.player_match_history with (security_invoker = true) as
select
  mt.id as match_id,
  mt.mabar_id,
  mb.title as mabar_title,
  v.name as venue_name,
  mp.user_id,
  mp.team,
  (r.winner_team = mp.team) as won,
  mt.format,
  mt.match_type,
  mt.scoring_format,
  mt.completed_at,
  r.status as result_status,
  rc.rating_before,
  rc.rating_after,
  rc.delta as rating_delta,
  array(
    select p.display_name from public.match_players o join public.profiles p on p.user_id = o.user_id
    where o.match_id = mt.id and o.team = mp.team and o.user_id <> mp.user_id
  ) as partner_names,
  array(
    select p.display_name from public.match_players o join public.profiles p on p.user_id = o.user_id
    where o.match_id = mt.id and o.team <> mp.team order by p.display_name
  ) as opponent_names,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'set_no', s.set_no, 'games_a', s.games_a, 'games_b', s.games_b,
      'tiebreak_a', s.tiebreak_a, 'tiebreak_b', s.tiebreak_b, 'is_match_tiebreak', s.is_match_tiebreak
    ) order by s.set_no)
    from public.match_sets s where s.match_id = mt.id
  ), '[]'::jsonb) as sets
from public.matches mt
join public.mabars mb on mb.id = mt.mabar_id
join public.venues v on v.id = mb.venue_id
join public.match_players mp on mp.match_id = mt.id
join public.match_results r on r.match_id = mt.id
left join public.rating_changes rc on rc.match_id = mt.id and rc.user_id = mp.user_id
where mt.status = 'COMPLETED';

-- Rating -------------------------------------------------------------------------

-- Mirrors ratingChange in src/domain/rating/rating.service.ts.
create function public.rating_delta(
  p_reliability integer,
  p_team_rating numeric,
  p_opponent_rating numeric,
  p_won boolean
) returns numeric
language sql immutable set search_path = '' as $$
  select round((
    (0.05 + 0.30 * (1 - p_reliability / 100.0))
    * ((case when p_won then 1 else 0 end) - 1 / (1 + power(10::numeric, (p_opponent_rating - p_team_rating) / 1.0)))
  )::numeric, 2)
$$;

-- Applies an official competitive result to every player's rating, once.
create function public.apply_match_rating(p_match_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_match public.matches%rowtype;
  v_winner public.match_team;
  v_avg_a numeric;
  v_avg_b numeric;
  v_player record;
  v_delta numeric;
  v_after numeric;
begin
  select * into v_match from public.matches where id = p_match_id;
  if v_match.match_type <> 'COMPETITIVE' then return; end if;
  if exists (select 1 from public.rating_changes where match_id = p_match_id) then
    raise exception 'RATING_ALREADY_APPLIED';
  end if;

  select winner_team into v_winner from public.match_results where match_id = p_match_id;

  -- Lock the players' ratings and take both team averages before changing any.
  perform 1 from public.player_ratings pr
    join public.match_players mp on mp.user_id = pr.user_id
    where mp.match_id = p_match_id
    for update of pr;
  select avg(pr.rating) filter (where mp.team = 'A'), avg(pr.rating) filter (where mp.team = 'B')
    into v_avg_a, v_avg_b
    from public.match_players mp join public.player_ratings pr on pr.user_id = mp.user_id
    where mp.match_id = p_match_id;

  for v_player in
    select mp.user_id, mp.team, pr.rating, pr.reliability
    from public.match_players mp join public.player_ratings pr on pr.user_id = mp.user_id
    where mp.match_id = p_match_id
  loop
    v_delta := public.rating_delta(
      v_player.reliability,
      case when v_player.team = 'A' then v_avg_a else v_avg_b end,
      case when v_player.team = 'A' then v_avg_b else v_avg_a end,
      v_player.team = v_winner
    );
    v_after := least(7.00, greatest(1.00, v_player.rating + v_delta));

    insert into public.rating_changes (
      match_id, user_id, rating_before, rating_after, delta, reliability_before, reliability_after
    ) values (
      p_match_id, v_player.user_id, v_player.rating, v_after, v_after - v_player.rating,
      v_player.reliability, least(95, v_player.reliability + 5)
    );

    update public.player_ratings
      set rating = v_after,
          reliability = least(95, reliability + 5),
          matches_counted = matches_counted + 1
      where user_id = v_player.user_id;
  end loop;
end;
$$;

-- Commands -----------------------------------------------------------------------------
-- Each raises a stable error code; the app maps codes to copy in src/lib/errors.ts.

create function public.start_match(p_mabar_id uuid, p_team_a uuid[], p_team_b uuid[]) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  m public.mabars%rowtype;
  v_per_team integer;
  v_all uuid[];
  v_id uuid;
  v_seq smallint;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;

  select * into m from public.mabars where id = p_mabar_id for update;
  if not found then raise exception 'MABAR_NOT_FOUND'; end if;
  if m.organizer_id <> v_uid then raise exception 'NOT_ORGANIZER'; end if;
  if public.mabar_effective_status(m.status, m.format, m.starts_at, m.participant_count, m.max_players) <> 'LIVE' then
    raise exception 'MABAR_NOT_LIVE';
  end if;
  if exists (select 1 from public.matches where mabar_id = m.id and status = 'LIVE') then
    raise exception 'MATCH_IN_PROGRESS';
  end if;

  v_per_team := public.mabar_min_players(m.format) / 2;
  if coalesce(array_length(p_team_a, 1), 0) <> v_per_team or coalesce(array_length(p_team_b, 1), 0) <> v_per_team then
    raise exception 'TEAM_SIZE_INVALID';
  end if;
  v_all := p_team_a || p_team_b;
  if (select count(distinct x) from unnest(v_all) as x) <> array_length(v_all, 1) then
    raise exception 'DUPLICATE_PLAYER';
  end if;
  if (select count(*) from public.mabar_participants where mabar_id = m.id and user_id = any (v_all)) <> array_length(v_all, 1) then
    raise exception 'PLAYER_NOT_IN_MABAR';
  end if;

  select coalesce(max(seq_no), 0) + 1 into v_seq from public.matches where mabar_id = m.id;
  insert into public.matches (mabar_id, seq_no, format, match_type, scoring_format, created_by)
    values (m.id, v_seq, m.format, m.match_type, m.scoring_format, v_uid)
    returning id into v_id;
  insert into public.match_players (match_id, user_id, team)
    select v_id, x, 'A'::public.match_team from unnest(p_team_a) as x
    union all
    select v_id, x, 'B'::public.match_team from unnest(p_team_b) as x;
  return v_id;
end;
$$;

create function public.cancel_match(p_match_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_match public.matches%rowtype;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select * into v_match from public.matches where id = p_match_id for update;
  if not found then raise exception 'MATCH_NOT_FOUND'; end if;
  if not exists (select 1 from public.mabars where id = v_match.mabar_id and organizer_id = v_uid) then
    raise exception 'NOT_ORGANIZER';
  end if;
  if v_match.status in ('COMPLETED', 'CANCELLED') then raise exception 'MATCH_ALREADY_FINAL'; end if;

  delete from public.match_results where match_id = p_match_id;
  update public.matches set status = 'CANCELLED' where id = p_match_id;
end;
$$;

-- Writes the sets from a JSON array of {set_no, games_a, games_b, tiebreak_a, tiebreak_b, is_match_tiebreak}.
create function public.replace_match_sets(p_match_id uuid, p_sets jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.match_sets where match_id = p_match_id;
  insert into public.match_sets (match_id, set_no, games_a, games_b, tiebreak_a, tiebreak_b, is_match_tiebreak)
  select p_match_id,
         (s ->> 'set_no')::smallint,
         (s ->> 'games_a')::smallint,
         (s ->> 'games_b')::smallint,
         nullif(s ->> 'tiebreak_a', '')::smallint,
         nullif(s ->> 'tiebreak_b', '')::smallint,
         coalesce((s ->> 'is_match_tiebreak')::boolean, false)
  from jsonb_array_elements(coalesce(p_sets, '[]'::jsonb)) as s;
end;
$$;

-- Organizer check shared by the service-role score commands.
create function public.assert_match_organizer(p_match public.matches, p_actor_id uuid) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if p_match.id is null then raise exception 'MATCH_NOT_FOUND'; end if;
  if not exists (select 1 from public.mabars where id = p_match.mabar_id and organizer_id = p_actor_id) then
    raise exception 'NOT_ORGANIZER';
  end if;
end;
$$;

-- Draft score while the match is being played (not validated, not official).
create function public.save_match_draft(p_match_id uuid, p_actor_id uuid, p_sets jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_match public.matches%rowtype;
begin
  select * into v_match from public.matches where id = p_match_id for update;
  perform public.assert_match_organizer(v_match, p_actor_id);
  if v_match.status <> 'LIVE' then raise exception 'MATCH_ALREADY_FINAL'; end if;
  perform public.replace_match_sets(p_match_id, p_sets);
end;
$$;

-- Called by the server with the service role, after validateScore() passed and
-- the session was verified. Casual results are official at once; competitive
-- ones wait for a player's confirmation (or the 24h auto-confirm).
create function public.submit_match_result(
  p_match_id uuid,
  p_actor_id uuid,
  p_sets jsonb,
  p_winner public.match_team
) returns public.result_status
language plpgsql security definer set search_path = '' as $$
declare
  v_match public.matches%rowtype;
  v_status public.result_status;
begin
  select * into v_match from public.matches where id = p_match_id for update;
  perform public.assert_match_organizer(v_match, p_actor_id);
  if v_match.status not in ('LIVE', 'PENDING_CONFIRMATION') then raise exception 'MATCH_ALREADY_FINAL'; end if;

  perform public.replace_match_sets(p_match_id, p_sets);
  v_status := case when v_match.match_type = 'CASUAL' then 'CONFIRMED' else 'PENDING' end;

  insert into public.match_results as r (
    match_id, winner_team, status, version, submitted_by, submitted_at, confirm_deadline, confirmed_at
  ) values (
    p_match_id, p_winner, v_status, 1, p_actor_id, now(),
    case when v_status = 'PENDING' then now() + interval '24 hours' end,
    case when v_status = 'CONFIRMED' then now() end
  )
  on conflict (match_id) do update set
    winner_team = excluded.winner_team,
    status = excluded.status,
    version = r.version + 1,
    submitted_by = excluded.submitted_by,
    submitted_at = excluded.submitted_at,
    confirm_deadline = excluded.confirm_deadline,
    confirmed_by = null,
    confirmed_at = excluded.confirmed_at,
    rejected_by = null,
    rejected_at = null,
    rejection_reason = null;

  update public.matches
    set status = case when v_status = 'CONFIRMED' then 'COMPLETED'::public.match_status else 'PENDING_CONFIRMATION' end,
        completed_at = case when v_status = 'CONFIRMED' then now() end
    where id = p_match_id;
  return v_status;
end;
$$;

-- Checks shared by confirm and reject: a pending result, judged by a player in
-- the match who did not submit it.
create function public.lock_pending_result(p_match_id uuid, p_uid uuid) returns public.match_results
language plpgsql security definer set search_path = '' as $$
declare
  v_result public.match_results%rowtype;
begin
  if p_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  perform 1 from public.matches where id = p_match_id for update;
  if not found then raise exception 'MATCH_NOT_FOUND'; end if;
  select * into v_result from public.match_results where match_id = p_match_id for update;
  if not found or v_result.status <> 'PENDING' then raise exception 'RESULT_NOT_PENDING'; end if;
  if not exists (select 1 from public.match_players where match_id = p_match_id and user_id = p_uid) then
    raise exception 'NOT_MATCH_PLAYER';
  end if;
  if v_result.submitted_by = p_uid then raise exception 'CANNOT_CONFIRM_OWN'; end if;
  return v_result;
end;
$$;

create function public.confirm_match_result(p_match_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
begin
  perform public.lock_pending_result(p_match_id, v_uid);
  update public.match_results set status = 'CONFIRMED', confirmed_by = v_uid, confirmed_at = now()
    where match_id = p_match_id;
  perform public.apply_match_rating(p_match_id);
  update public.matches set status = 'COMPLETED', completed_at = now() where id = p_match_id;
end;
$$;

create function public.reject_match_result(p_match_id uuid, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
begin
  perform public.lock_pending_result(p_match_id, v_uid);
  -- The match stays PENDING_CONFIRMATION so the organizer can correct and resubmit.
  update public.match_results
    set status = 'REJECTED', rejected_by = v_uid, rejected_at = now(),
        rejection_reason = nullif(left(trim(p_reason), 200), ''), confirm_deadline = null
    where match_id = p_match_id;
end;
$$;

create function public.end_mabar(p_mabar_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  m public.mabars%rowtype;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select * into m from public.mabars where id = p_mabar_id for update;
  if not found then raise exception 'MABAR_NOT_FOUND'; end if;
  if m.organizer_id <> v_uid then raise exception 'NOT_ORGANIZER'; end if;
  if public.mabar_effective_status(m.status, m.format, m.starts_at, m.participant_count, m.max_players) <> 'LIVE' then
    raise exception 'MABAR_NOT_LIVE';
  end if;
  if exists (select 1 from public.matches where mabar_id = m.id and status = 'LIVE') then
    raise exception 'MATCH_IN_PROGRESS';
  end if;
  update public.mabars set status = 'COMPLETED' where id = m.id;
end;
$$;

-- Scheduled job: competitive results nobody confirmed within 24h become
-- official, and sessions left open a day past their end time are closed.
create function public.finalize_due_results() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_match_id uuid;
  v_count integer := 0;
begin
  for v_match_id in
    select match_id from public.match_results
    where status = 'PENDING' and confirm_deadline <= now()
    for update skip locked
  loop
    update public.match_results set status = 'AUTO_CONFIRMED', confirmed_at = now() where match_id = v_match_id;
    perform public.apply_match_rating(v_match_id);
    update public.matches set status = 'COMPLETED', completed_at = now() where id = v_match_id;
    v_count := v_count + 1;
  end loop;

  update public.matches set status = 'CANCELLED'
    where status = 'LIVE'
      and mabar_id in (select id from public.mabars where status = 'OPEN' and ends_at + interval '24 hours' < now());
  update public.mabars set status = 'COMPLETED'
    where status = 'OPEN'
      and ends_at + interval '24 hours' < now()
      and participant_count >= public.mabar_min_players(format);
  return v_count;
end;
$$;

-- Grants -----------------------------------------------------------------------------

revoke execute on function
  public.create_mabar, public.start_match, public.cancel_match, public.confirm_match_result,
  public.reject_match_result, public.end_mabar
  from public, anon;
grant execute on function
  public.create_mabar, public.start_match, public.cancel_match, public.confirm_match_result,
  public.reject_match_result, public.end_mabar
  to authenticated;

-- Score writes are only reachable through the server (service role) so the
-- TypeScript score validation cannot be skipped.
revoke execute on function
  public.submit_match_result, public.save_match_draft, public.finalize_due_results
  from public, anon, authenticated;
grant execute on function
  public.submit_match_result, public.save_match_draft, public.finalize_due_results
  to service_role;

revoke execute on function
  public.apply_match_rating, public.replace_match_sets, public.assert_match_organizer, public.lock_pending_result
  from public, anon, authenticated;

-- Schedule ------------------------------------------------------------------------------
-- pg_cron is available on Supabase; skipped where it isn't (e.g. PGlite tests).
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('tenma-finalize-results', '*/10 * * * *', 'select public.finalize_due_results()');
  end if;
end;
$$;
