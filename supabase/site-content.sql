-- ============================================================
-- Contenu du site modifiable depuis l'admin (onglet « Contenu »)
-- À exécuter une fois dans Supabase > SQL Editor.
-- ============================================================

create table if not exists public.site_content (
  key         text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

-- Chaque enregistrement conserve la version précédente (restauration possible)
create table if not exists public.site_content_history (
  id        bigserial primary key,
  key       text not null,
  data      jsonb not null,
  saved_at  timestamptz not null default now(),
  saved_by  uuid
);
create index if not exists site_content_history_key_idx on public.site_content_history (key, saved_at desc);

alter table public.site_content         enable row level security;
alter table public.site_content_history enable row level security;

-- Tout le monde peut lire le contenu (c'est ce qu'affiche le site)
drop policy if exists "site_content_lecture" on public.site_content;
create policy "site_content_lecture" on public.site_content
  for select using (true);

-- Seuls les comptes admin peuvent le modifier
drop policy if exists "site_content_admin" on public.site_content;
create policy "site_content_admin" on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "site_content_history_admin" on public.site_content_history;
create policy "site_content_history_admin" on public.site_content_history
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.site_content_archive()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    insert into public.site_content_history (key, data, saved_at, saved_by)
    values (old.key, old.data, old.updated_at, old.updated_by);
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;

drop trigger if exists site_content_archive on public.site_content;
create trigger site_content_archive
  before insert or update on public.site_content
  for each row execute function public.site_content_archive();

grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
grant select on public.site_content_history to authenticated;
