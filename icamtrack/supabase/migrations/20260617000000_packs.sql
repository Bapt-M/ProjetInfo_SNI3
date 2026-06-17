-- Packs (bundles de catégories prédéfinis)
create table packs (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- Items d'un pack
create table pack_items (
  id          uuid primary key default uuid_generate_v4(),
  pack_id     uuid not null references packs(id) on delete cascade,
  category_id uuid not null references categories(id),
  quantity    int  not null default 1 check (quantity > 0)
);

-- RLS
alter table packs      enable row level security;
alter table pack_items enable row level security;

create policy "read_packs"         on packs      for select using (auth.uid() is not null);
create policy "admin_manage_packs" on packs      for all    using (is_admin());

create policy "read_pack_items"         on pack_items for select using (auth.uid() is not null);
create policy "admin_manage_pack_items" on pack_items for all    using (is_admin());
