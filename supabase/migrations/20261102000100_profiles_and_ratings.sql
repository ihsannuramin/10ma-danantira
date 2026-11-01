-- Player identity: areas/venues (shared reference data), profiles, ratings.
-- Ratings are written only by the server (service role); clients can read them.

create type public.gender as enum ('MALE', 'FEMALE');
create type public.dominant_hand as enum ('RIGHT', 'LEFT');
create type public.playing_style as enum (
  'BASELINE', 'AGGRESSIVE_BASELINER', 'ALL_COURT', 'SERVE_AND_VOLLEY', 'COUNTER_PUNCHER', 'STILL_LEARNING'
);
create type public.playing_objective as enum ('FUN', 'FITNESS', 'IMPROVE', 'COMPETITIVE', 'TOURNAMENT');
create type public.preferred_format as enum ('SINGLES', 'DOUBLES', 'BOTH');
create type public.availability_slot as enum (
  'WEEKDAY_MORNING', 'WEEKDAY_AFTERNOON', 'WEEKDAY_NIGHT',
  'WEEKEND_MORNING', 'WEEKEND_AFTERNOON', 'WEEKEND_NIGHT'
);

create table public.areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  city text not null,
  sort_order smallint not null default 0
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 80),
  area_id uuid not null references public.areas (id),
  address text,
  -- Coordinates are optional until distance-based matchmaking lands.
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (area_id, name)
);
create index venues_area_id_idx on public.venues (area_id);

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  photo_url text,
  area_id uuid not null references public.areas (id),
  gender public.gender,
  dominant_hand public.dominant_hand,
  playing_style public.playing_style not null default 'STILL_LEARNING',
  playing_objective public.playing_objective not null default 'FUN',
  preferred_format public.preferred_format not null default 'BOTH',
  availability public.availability_slot[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.player_ratings (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  rating numeric(3, 2) not null check (rating between 1.00 and 7.00),
  reliability smallint not null check (reliability between 0 and 100),
  matches_counted integer not null default 0 check (matches_counted >= 0),
  assessment jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger player_ratings_touch before update on public.player_ratings
  for each row execute function public.touch_updated_at();

-- RLS ---------------------------------------------------------------------

alter table public.areas enable row level security;
alter table public.venues enable row level security;
alter table public.profiles enable row level security;
alter table public.player_ratings enable row level security;

create policy "areas readable by players" on public.areas
  for select to authenticated using (true);

create policy "venues readable by players" on public.venues
  for select to authenticated using (true);
create policy "players add venues as themselves" on public.venues
  for insert to authenticated with check (created_by = (select auth.uid()));

create policy "profiles readable by players" on public.profiles
  for select to authenticated using (true);
create policy "players update own profile" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "ratings readable by players" on public.player_ratings
  for select to authenticated using (true);
-- No insert/update/delete policies: ratings change only through the server.

-- Onboarding --------------------------------------------------------------

-- Creates the profile and the assessment-based rating in one transaction.
-- Called by the server with the service role after it has verified the
-- session and computed the rating (src/domain/rating/rating.service.ts).
create function public.complete_onboarding(
  p_user_id uuid,
  p_display_name text,
  p_photo_url text,
  p_area_id uuid,
  p_gender public.gender,
  p_dominant_hand public.dominant_hand,
  p_playing_style public.playing_style,
  p_playing_objective public.playing_objective,
  p_preferred_format public.preferred_format,
  p_availability public.availability_slot[],
  p_rating numeric,
  p_reliability smallint,
  p_assessment jsonb
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.profiles where user_id = p_user_id) then
    raise exception 'ALREADY_ONBOARDED';
  end if;

  insert into public.profiles (
    user_id, display_name, photo_url, area_id, gender, dominant_hand,
    playing_style, playing_objective, preferred_format, availability
  ) values (
    p_user_id, p_display_name, p_photo_url, p_area_id, p_gender, p_dominant_hand,
    p_playing_style, p_playing_objective, p_preferred_format, coalesce(p_availability, '{}')
  );

  insert into public.player_ratings (user_id, rating, reliability, assessment)
  values (p_user_id, p_rating, p_reliability, p_assessment);
end;
$$;

revoke execute on function public.complete_onboarding from public, anon, authenticated;
grant execute on function public.complete_onboarding to service_role;
