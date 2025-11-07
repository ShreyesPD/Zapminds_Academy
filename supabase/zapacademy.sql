-- enums
create type role as enum ('admin','student');
create type xp_source as enum ('module','course','daily','bonus','admin_adjustment');

-- profiles (1:1 with auth.users)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role role not null default 'student',
  display_name text,
  avatar_url text,
  xp_total int not null default 0,
  level int not null default 1,
  created_at timestamptz not null default now()
);

-- courses
create table public.courses (
  id bigserial primary key,
  title text not null,
  slug text generated always as (regexp_replace(lower(title), '\W+', '-', 'g')) stored,
  description text,
  is_published boolean not null default false,
  created_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index on public.courses(slug);

-- modules
create table public.modules (
  id bigserial primary key,
  course_id bigint not null references public.courses(id) on delete cascade,
  title text not null,
  order_index int not null,
  xp_value int not null check (xp_value >= 0),
  is_required boolean not null default true,
  content_url text,
  created_at timestamptz not null default now(),
  unique (course_id, order_index)
);
create index on public.modules(course_id);

-- enrollments
create table public.enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id bigint not null references public.courses(id) on delete cascade,
  status text not null default 'active',  -- simple; or make enum if you prefer
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- completions
create table public.module_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id bigint not null references public.modules(id) on delete cascade,
  completed_at timestamptz not null default now(),
  awarded_xp int not null default 0,
  primary key (user_id, module_id)
);
create index on public.module_completions(user_id, completed_at desc);

create table public.course_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id bigint not null references public.courses(id) on delete cascade,
  completed_at timestamptz not null default now(),
  awarded_xp int not null default 0,
  primary key (user_id, course_id)
);

-- daily challenges
create table public.daily_challenges (
  id bigserial primary key,
  challenge_date date not null unique,     -- one official challenge per day
  title text not null,
  description text,
  xp_value int not null check (xp_value >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_daily_challenge_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_challenge_id bigint not null references public.daily_challenges(id) on delete cascade,
  attempted_at timestamptz not null default now(),
  completed boolean not null default false,
  completed_at timestamptz,
  awarded_xp int not null default 0,
  primary key (user_id, daily_challenge_id)
);

-- streaks
create table public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_completed_date date
);

-- XP transaction ledger
create table public.xp_transactions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source xp_source not null,
  source_id bigint, -- nullable: e.g., admin_adjustment
  delta int not null,
  created_at timestamptz not null default now(),
  note text,
  check (delta <> 0)
);
create index on public.xp_transactions(user_id, created_at desc);


-- helper: increment xp & ledger
create or replace function public.award_xp(p_user uuid, p_delta int, p_source xp_source, p_source_id bigint, p_note text default null)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.xp_transactions(user_id, delta, source, source_id, note)
  values (p_user, p_delta, p_source, p_source_id, p_note);

  update public.profiles
  set xp_total = xp_total + p_delta
  where user_id = p_user;
end;
$$;

-- mark a module complete (idempotent: primary key prevents duplicates)
create or replace function public.complete_module(p_user uuid, p_module_id bigint)
returns void
language plpgsql
security definer
as $$
declare
  v_course_id bigint;
  v_xp int;
  v_needed int;
  v_done int;
  v_bonus int := 0; -- optional bonus on course completion
begin
  select course_id, xp_value into v_course_id, v_xp from public.modules where id = p_module_id;

  insert into public.module_completions(user_id, module_id, awarded_xp)
  values (p_user, p_module_id, v_xp)
  on conflict do nothing;

  -- only award XP if this was newly inserted
  if found then
    perform public.award_xp(p_user, v_xp, 'module', p_module_id, 'Module completion');

    -- check course completion: all required modules done?
    select count(*) filter (where is_required) into v_needed from public.modules where course_id = v_course_id;
    select count(*) into v_done
    from public.module_completions mc
    join public.modules m on m.id = mc.module_id
    where mc.user_id = p_user and m.course_id = v_course_id and m.is_required;

    if v_done = v_needed and v_needed > 0 then
      -- insert course completion if not exists
      insert into public.course_completions(user_id, course_id, awarded_xp)
      values (p_user, v_course_id, v_bonus)
      on conflict do nothing;

      if found and v_bonus <> 0 then
        perform public.award_xp(p_user, v_bonus, 'course', v_course_id, 'Course completion bonus');
      end if;
    end if;
  end if;
end;
$$;

-- complete daily challenge + update streaks
create or replace function public.complete_daily_challenge(p_user uuid, p_daily_id bigint)
returns void
language plpgsql
security definer
as $$
declare
  v_date date;
  v_xp int;
  v_prev date;
  v_curr int;
  v_long int;
begin
  select challenge_date, xp_value into v_date, v_xp
  from public.daily_challenges where id = p_daily_id and is_active;

  -- mark the record completed (idempotent)
  insert into public.user_daily_challenge_attempts(user_id, daily_challenge_id, completed, completed_at, awarded_xp)
  values (p_user, p_daily_id, true, now(), v_xp)
  on conflict (user_id, daily_challenge_id) do update
    set completed = true, completed_at = excluded.completed_at, awarded_xp = v_xp;

  -- award xp only the first time it's marked completed
  if (select count(*) from public.xp_transactions
      where user_id=p_user and source='daily' and source_id=p_daily_id) = 0 then
    perform public.award_xp(p_user, v_xp, 'daily', p_daily_id, 'Daily challenge');
  end if;

  -- streak maintenance
  insert into public.streaks(user_id, current_streak, longest_streak, last_completed_date)
  values (p_user, 1, 1, v_date)
  on conflict (user_id) do update
  set
    current_streak = case
      when public.streaks.last_completed_date = v_date then public.streaks.current_streak      -- same day: no change
      when public.streaks.last_completed_date = v_date - interval '1 day' then public.streaks.current_streak + 1
      else 1
    end,
    longest_streak = greatest(
      public.streaks.longest_streak,
      case
        when public.streaks.last_completed_date = v_date then public.streaks.current_streak
        when public.streaks.last_completed_date = v_date - interval '1 day' then public.streaks.current_streak + 1
        else 1
      end
    ),
    last_completed_date = greatest(public.streaks.last_completed_date, v_date);
end;
$$;


-- Overall leaderboard view
create or replace view public.leaderboard_overall as
select
  u.user_id,
  p.display_name,
  p.avatar_url,
  p.xp_total,
  rank() over (order by p.xp_total desc, u.user_id) as rank
from public.profiles p join public.profiles u on u.user_id = p.user_id;

-- Weekly leaderboard (rolling last 7 days, timezone-safe)
create or replace view public.leaderboard_weekly as
with tz as (
  select now() at time zone 'UTC' as now_utc
),
wins as (
  select
    xt.user_id,
    sum(xt.delta) as xp_weekly
  from public.xp_transactions xt, tz
  where xt.created_at >= (date_trunc('week', (tz.now_utc at time zone 'Asia/Kolkata')) at time zone 'Asia/Kolkata')
  group by xt.user_id
)
select
  w.user_id,
  p.display_name,
  p.avatar_url,
  w.xp_weekly,
  rank() over (order by w.xp_weekly desc, w.user_id) as rank
from wins w
join public.profiles p on p.user_id = w.user_id;
