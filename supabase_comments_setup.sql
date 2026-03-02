create table if not exists public.comments (
  id bigint generated always as identity primary key,
  story_slug text not null,
  nickname text not null default '익명',
  body text not null check (char_length(body) between 1 and 500),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists comments_story_slug_created_at_idx
on public.comments (story_slug, created_at desc);

alter table public.comments enable row level security;

drop policy if exists comments_read_all on public.comments;
drop policy if exists comments_insert_own on public.comments;

create policy comments_read_all
on public.comments
for select
to anon, authenticated
using (true);

create policy comments_insert_own
on public.comments
for insert
to authenticated
with check ((select auth.uid()) = user_id);
