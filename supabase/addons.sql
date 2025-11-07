-- 1) OPTIONAL: add updated_at if you want the touch trigger (skip if you don't need it)
alter table public.profiles
  add column if not exists updated_at timestamptz;

-- 2) Touch trigger for updated_at (only if the column exists)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  if (new.* is distinct from old.*) then
    new.updated_at = now();
  end if;
  return new;
end$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='updated_at'
  ) then
    create trigger trg_profiles_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- 3) RLS policies (use user_id instead of id)
alter table public.profiles enable row level security;

drop policy if exists "select own profile" on public.profiles;
create policy "select own profile"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
on public.profiles for update
using (auth.uid() = user_id);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
on public.profiles for insert
with check (auth.uid() = user_id);

-- 4) New-user trigger (insert into profiles.user_id, not id)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name',
             split_part(new.email, '@', 1))
  )
  on conflict (user_id) do nothing;

  return new;
end
$$;

-- make sure any old trigger name is removed
drop trigger if exists on_auth_user_created on auth.users;

-- attach trigger to auth.users
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
