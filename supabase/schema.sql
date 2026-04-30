create table if not exists public.game_sessions (
  id text primary key,
  code text not null unique,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.game_sessions enable row level security;

drop policy if exists "public read game sessions" on public.game_sessions;
create policy "public read game sessions"
on public.game_sessions
for select
to anon
using (true);

drop policy if exists "public insert game sessions" on public.game_sessions;
create policy "public insert game sessions"
on public.game_sessions
for insert
to anon
with check (true);

drop policy if exists "public update game sessions" on public.game_sessions;
create policy "public update game sessions"
on public.game_sessions
for update
to anon
using (true)
with check (true);

drop policy if exists "public delete game sessions" on public.game_sessions;
create policy "public delete game sessions"
on public.game_sessions
for delete
to anon
using (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'game_sessions'
  ) then
    alter publication supabase_realtime add table public.game_sessions;
  end if;
end $$;
