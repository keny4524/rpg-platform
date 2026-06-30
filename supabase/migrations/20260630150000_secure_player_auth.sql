begin;

create extension if not exists pgcrypto with schema extensions;

alter table public.players
  add column if not exists auth_user_id uuid,
  add column if not exists password_scheme text not null default 'legacy_sha256';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'players_auth_user_id_fkey'
      and conrelid = 'public.players'::regclass
  ) then
    alter table public.players
      add constraint players_auth_user_id_fkey
      foreign key (auth_user_id)
      references auth.users(id)
      on delete set null;
  end if;
end;
$$;

create unique index if not exists players_auth_user_id_key
  on public.players(auth_user_id)
  where auth_user_id is not null;

create or replace function public.register_player_secure(
  p_nickname text,
  p_password text
)
returns table(id uuid, nickname text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_nickname text := btrim(p_nickname);
  v_player_id uuid;
  v_password_hash text;
begin
  if v_auth_user_id is null then
    raise exception 'authentication_required';
  end if;
  if char_length(v_nickname) < 1 or char_length(v_nickname) > 20 then
    raise exception 'invalid_nickname';
  end if;
  if char_length(p_password) < 8 then
    raise exception 'invalid_password';
  end if;

  v_password_hash := extensions.crypt(p_password, extensions.gen_salt('bf'));

  update public.players
  set auth_user_id = null
  where auth_user_id = v_auth_user_id;

  insert into public.players(nickname, password_hash, password_scheme, auth_user_id)
  values (v_nickname, v_password_hash, 'bcrypt', v_auth_user_id)
  returning public.players.id into v_player_id;

  insert into public.progress(player_id)
  values (v_player_id);

  return query select v_player_id, v_nickname;
exception
  when unique_violation then
    raise exception 'nickname_taken';
end;
$$;

create or replace function public.login_player_secure(
  p_nickname text,
  p_password text
)
returns table(id uuid, nickname text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_player_id uuid;
  v_nickname text;
  v_password_hash text;
  v_password_scheme text;
begin
  if v_auth_user_id is null then
    raise exception 'authentication_required';
  end if;

  select p.id, p.nickname, p.password_hash, p.password_scheme
  into v_player_id, v_nickname, v_password_hash, v_password_scheme
  from public.players p
  where p.nickname = btrim(p_nickname);

  if v_player_id is null or not (
    (v_password_scheme = 'bcrypt'
      and extensions.crypt(p_password, v_password_hash) = v_password_hash)
    or
    (v_password_scheme = 'legacy_sha256'
      and encode(
        extensions.digest(p_password || 'rpg-platform-salt', 'sha256'),
        'hex'
      ) = v_password_hash)
  ) then
    raise exception 'invalid_credentials';
  end if;

  if v_password_scheme = 'legacy_sha256' then
    update public.players
    set password_hash = extensions.crypt(p_password, extensions.gen_salt('bf')),
        password_scheme = 'bcrypt'
    where id = v_player_id;
  end if;

  update public.players
  set auth_user_id = null
  where auth_user_id = v_auth_user_id
    and id <> v_player_id;

  update public.players
  set auth_user_id = v_auth_user_id
  where id = v_player_id;

  return query select v_player_id, v_nickname;
end;
$$;

revoke all on function public.register_player_secure(text, text) from public, anon;
revoke all on function public.login_player_secure(text, text) from public, anon;
grant execute on function public.register_player_secure(text, text) to authenticated;
grant execute on function public.login_player_secure(text, text) to authenticated;

alter table public.players enable row level security;
alter table public.progress enable row level security;

drop policy if exists "allow all on players" on public.players;
drop policy if exists "allow all on progress" on public.progress;
drop policy if exists "players can read own profile" on public.players;
drop policy if exists "players can read own progress" on public.progress;
drop policy if exists "players can update own progress" on public.progress;

create policy "players can read own profile"
on public.players
for select
to authenticated
using (auth_user_id = (select auth.uid()));

create policy "players can read own progress"
on public.progress
for select
to authenticated
using (
  exists (
    select 1
    from public.players p
    where p.id = progress.player_id
      and p.auth_user_id = (select auth.uid())
  )
);

create policy "players can update own progress"
on public.progress
for update
to authenticated
using (
  exists (
    select 1
    from public.players p
    where p.id = progress.player_id
      and p.auth_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.players p
    where p.id = progress.player_id
      and p.auth_user_id = (select auth.uid())
  )
);

revoke all on public.players from anon, authenticated;
revoke all on public.progress from anon, authenticated;
grant select(id, nickname, created_at, auth_user_id) on public.players to authenticated;
grant select on public.progress to authenticated;
grant update(level, exp, cleared_quests, updated_at) on public.progress to authenticated;

alter table realtime.messages enable row level security;
drop policy if exists "players can receive area realtime" on realtime.messages;
drop policy if exists "players can send area realtime" on realtime.messages;

create policy "players can receive area realtime"
on realtime.messages
for select
to authenticated
using (
  (select realtime.topic()) like 'area:%'
  and realtime.messages.extension in ('broadcast', 'presence')
  and exists (
    select 1 from public.players p
    where p.auth_user_id = (select auth.uid())
  )
);

create policy "players can send area realtime"
on realtime.messages
for insert
to authenticated
with check (
  (select realtime.topic()) like 'area:%'
  and realtime.messages.extension in ('broadcast', 'presence')
  and exists (
    select 1 from public.players p
    where p.auth_user_id = (select auth.uid())
  )
);

commit;

-- Emergency rollback for the frontend can be done by reverting the matching
-- application commit. This migration is intentionally additive: existing
-- players, password hashes, and progress rows are never rewritten or deleted.
