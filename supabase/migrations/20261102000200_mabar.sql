-- Mabar sessions and participants. All writes go through the security
-- definer functions below so business rules and race safety live in one place.

create type public.mabar_format as enum ('SINGLES', 'DOUBLES');
create type public.match_type as enum ('CASUAL', 'COMPETITIVE');
-- Full status vocabulary; only OPEN, CANCELLED and COMPLETED are stored.
create type public.mabar_status as enum ('OPEN', 'FULL', 'UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED');

create table public.mabars (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles (user_id),
  title text not null check (char_length(title) between 3 and 60),
  format public.mabar_format not null,
  match_type public.match_type not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  venue_id uuid not null references public.venues (id),
  level_min numeric(2, 1) not null,
  level_max numeric(2, 1) not null,
  max_players smallint not null,
  participant_count smallint not null default 0,
  cost_per_player integer check (cost_per_player between 0 and 10000000),
  description text check (char_length(description) <= 500),
  status public.mabar_status not null default 'OPEN',
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mabars_stored_status check (status in ('OPEN', 'CANCELLED', 'COMPLETED')),
  constraint mabars_time_order check (ends_at > starts_at and ends_at <= starts_at + interval '8 hours'),
  constraint mabars_level_range check (level_min >= 1.0 and level_min <= level_max and level_max <= 7.0),
  constraint mabars_max_players check (
    (format = 'SINGLES' and max_players = 2) or (format = 'DOUBLES' and max_players = 4)
  ),
  constraint mabars_headcount check (participant_count between 0 and max_players)
);

create index mabars_starts_at_idx on public.mabars (starts_at);
create index mabars_status_starts_at_idx on public.mabars (status, starts_at);
create index mabars_venue_id_idx on public.mabars (venue_id);
create index mabars_format_idx on public.mabars (format);
create index mabars_level_idx on public.mabars (level_min, level_max);
create index mabars_organizer_id_idx on public.mabars (organizer_id);

create table public.mabar_participants (
  mabar_id uuid not null references public.mabars (id) on delete cascade,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (mabar_id, user_id)
);
create index mabar_participants_user_id_idx on public.mabar_participants (user_id);

create trigger mabars_touch before update on public.mabars
  for each row execute function public.touch_updated_at();

-- Keeps mabars.participant_count in step with the participant rows.
create function public.sync_mabar_participant_count() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.mabars set participant_count = participant_count + 1 where id = new.mabar_id;
  elsif tg_op = 'DELETE' then
    update public.mabars set participant_count = participant_count - 1 where id = old.mabar_id;
  end if;
  return null;
end;
$$;

create trigger mabar_participants_count
  after insert or delete on public.mabar_participants
  for each row execute function public.sync_mabar_participant_count();

-- Mirrors getEffectiveStatus in src/domain/mabar/mabar.service.ts.
create function public.mabar_effective_status(
  p_status public.mabar_status,
  p_starts_at timestamptz,
  p_participant_count integer,
  p_max_players integer
) returns public.mabar_status
language sql stable set search_path = '' as $$
  select case
    when p_status in ('CANCELLED', 'COMPLETED') then p_status
    when now() >= p_starts_at then
      case when p_participant_count >= p_max_players
        then 'LIVE'::public.mabar_status
        else 'EXPIRED'::public.mabar_status
      end
    when p_participant_count >= p_max_players then 'FULL'::public.mabar_status
    else 'OPEN'::public.mabar_status
  end
$$;

-- RLS ---------------------------------------------------------------------

alter table public.mabars enable row level security;
alter table public.mabar_participants enable row level security;

create policy "mabars readable by players" on public.mabars
  for select to authenticated using (true);
create policy "participants readable by players" on public.mabar_participants
  for select to authenticated using (true);
-- No write policies: create/join/leave/cancel go through the functions below.

create view public.mabar_listings with (security_invoker = true) as
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
  public.mabar_effective_status(m.status, m.starts_at, m.participant_count, m.max_players) as effective_status,
  m.created_at
from public.mabars m
join public.venues v on v.id = m.venue_id
join public.areas a on a.id = v.area_id
join public.profiles p on p.user_id = m.organizer_id;

-- Commands ------------------------------------------------------------------
-- Each raises an exception whose message is a stable error code; the app maps
-- codes to Indonesian copy in src/lib/errors.ts.

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
  p_description text
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
    level_min, level_max, max_players, cost_per_player, description
  ) values (
    v_uid,
    coalesce(nullif(trim(p_title), ''), 'Tennis Mabar — ' || v_area_name),
    p_format, p_match_type, p_starts_at, p_ends_at, p_venue_id,
    p_level_min, p_level_max,
    case p_format when 'SINGLES' then 2 else 4 end,
    p_cost_per_player, nullif(trim(p_description), '')
  ) returning id into v_id;

  -- The organizer takes the first slot.
  insert into public.mabar_participants (mabar_id, user_id) values (v_id, v_uid);
  return v_id;
end;
$$;

-- Check order mirrors canJoin in src/domain/mabar/mabar.service.ts. The row
-- lock serialises concurrent joins so the last slot goes to exactly one player.
create function public.join_mabar(p_mabar_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_rating numeric;
  m public.mabars%rowtype;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;

  select rating into v_rating from public.player_ratings where user_id = v_uid;
  if v_rating is null then raise exception 'PROFILE_REQUIRED'; end if;

  select * into m from public.mabars where id = p_mabar_id for update;
  if not found then raise exception 'MABAR_NOT_FOUND'; end if;
  if m.status = 'CANCELLED' then raise exception 'MABAR_CANCELLED'; end if;
  if m.status = 'COMPLETED' or now() >= m.starts_at then raise exception 'MABAR_STARTED'; end if;
  if exists (select 1 from public.mabar_participants where mabar_id = m.id and user_id = v_uid) then
    raise exception 'ALREADY_JOINED';
  end if;
  if m.participant_count >= m.max_players then raise exception 'MABAR_FULL'; end if;
  if v_rating < m.level_min or v_rating > m.level_max then raise exception 'LEVEL_NOT_ELIGIBLE'; end if;

  insert into public.mabar_participants (mabar_id, user_id) values (m.id, v_uid);
end;
$$;

create function public.leave_mabar(p_mabar_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  m public.mabars%rowtype;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;

  select * into m from public.mabars where id = p_mabar_id for update;
  if not found then raise exception 'MABAR_NOT_FOUND'; end if;
  if not exists (select 1 from public.mabar_participants where mabar_id = m.id and user_id = v_uid) then
    raise exception 'NOT_PARTICIPANT';
  end if;
  if m.organizer_id = v_uid then raise exception 'ORGANIZER_CANNOT_LEAVE'; end if;
  if m.status = 'CANCELLED' then raise exception 'MABAR_CANCELLED'; end if;
  if m.status = 'COMPLETED' or now() >= m.starts_at then raise exception 'MABAR_STARTED'; end if;

  delete from public.mabar_participants where mabar_id = m.id and user_id = v_uid;
end;
$$;

create function public.cancel_mabar(p_mabar_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  m public.mabars%rowtype;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;

  select * into m from public.mabars where id = p_mabar_id for update;
  if not found then raise exception 'MABAR_NOT_FOUND'; end if;
  if m.organizer_id <> v_uid then raise exception 'NOT_ORGANIZER'; end if;
  if m.status = 'CANCELLED' then raise exception 'MABAR_CANCELLED'; end if;
  if m.status = 'COMPLETED' or now() >= m.starts_at then raise exception 'MABAR_STARTED'; end if;

  update public.mabars set status = 'CANCELLED', cancelled_at = now() where id = m.id;
end;
$$;

-- Queries -------------------------------------------------------------------

-- Find Mabar: joinable-or-full upcoming sessions, filtered server-side, keyset
-- paginated on (starts_at, id). Time-slot hours match TIME_SLOTS in
-- src/domain/mabar/mabar.constants.ts.
create function public.search_mabars(
  p_area_id uuid default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_time_slot text default null,
  p_level_min numeric default null,
  p_level_max numeric default null,
  p_format public.mabar_format default null,
  p_match_type public.match_type default null,
  p_query text default null,
  p_after_starts_at timestamptz default null,
  p_after_id uuid default null,
  p_limit integer default 10
) returns setof public.mabar_listings
language sql stable security invoker set search_path = '' as $$
  select l.*
  from public.mabar_listings l
  where l.effective_status in ('OPEN', 'FULL')
    and (p_area_id is null or l.area_id = p_area_id)
    and (p_from is null or l.starts_at >= p_from)
    and (p_to is null or l.starts_at < p_to)
    and (
      p_time_slot is null
      or (p_time_slot = 'MORNING' and extract(hour from l.starts_at at time zone 'Asia/Jakarta') < 12)
      or (p_time_slot = 'AFTERNOON' and extract(hour from l.starts_at at time zone 'Asia/Jakarta') between 12 and 16)
      or (p_time_slot = 'EVENING' and extract(hour from l.starts_at at time zone 'Asia/Jakarta') >= 17)
    )
    -- Level filter matches any session whose range overlaps the wanted band.
    and (p_level_min is null or l.level_max >= p_level_min)
    and (p_level_max is null or l.level_min < p_level_max)
    and (p_format is null or l.format = p_format)
    and (p_match_type is null or l.match_type = p_match_type)
    and (
      p_query is null
      or position(lower(p_query) in lower(l.title || ' ' || l.venue_name || ' ' || l.area_name)) > 0
    )
    and (p_after_starts_at is null or (l.starts_at, l.id) > (p_after_starts_at, p_after_id))
  order by l.starts_at, l.id
  limit least(greatest(coalesce(p_limit, 10), 1), 50)
$$;

-- The signed-in player's own sessions.
create function public.my_mabars(p_scope text default 'upcoming') returns setof public.mabar_listings
language sql stable security invoker set search_path = '' as $$
  select l.*
  from public.mabar_listings l
  where exists (
      select 1 from public.mabar_participants mp
      where mp.mabar_id = l.id and mp.user_id = (select auth.uid())
    )
    and (
      (p_scope = 'upcoming' and l.effective_status in ('OPEN', 'FULL', 'LIVE'))
      or (p_scope = 'past' and l.effective_status in ('COMPLETED', 'EXPIRED', 'CANCELLED'))
    )
  order by
    case when p_scope = 'upcoming' then l.starts_at end asc,
    case when p_scope = 'past' then l.starts_at end desc
  limit 50
$$;

revoke execute on function public.create_mabar, public.join_mabar, public.leave_mabar,
  public.cancel_mabar, public.search_mabars, public.my_mabars from public, anon;
grant execute on function public.create_mabar, public.join_mabar, public.leave_mabar,
  public.cancel_mabar, public.search_mabars, public.my_mabars to authenticated;
revoke execute on function public.sync_mabar_participant_count from public, anon, authenticated;
