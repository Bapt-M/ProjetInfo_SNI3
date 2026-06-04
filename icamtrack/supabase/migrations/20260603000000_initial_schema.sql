-- Extensions
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('student', 'admin');
create type equipment_status as enum ('available', 'borrowed', 'unavailable');
create type loan_status as enum ('pending', 'active', 'closed', 'rejected');

-- Profiles
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null default '',
  role user_role not null default 'student',
  email text not null default '',
  created_at timestamptz not null default now()
);

-- Categories
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text
);

-- Equipment
create table equipment (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category_id uuid not null references categories(id),
  serial_number text,
  status equipment_status not null default 'available',
  notes text,
  created_at timestamptz not null default now()
);

-- Loan requests
create table loan_requests (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id),
  status loan_status not null default 'pending',
  due_date date,
  admin_note text,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

-- Loan items (1 row = 1 physical item slot)
create table loan_items (
  id uuid primary key default uuid_generate_v4(),
  loan_id uuid not null references loan_requests(id) on delete cascade,
  category_id uuid not null references categories(id),
  equipment_id uuid references equipment(id),
  returned_at timestamptz
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper function to check admin role (avoids RLS recursion)
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Enable RLS
alter table profiles enable row level security;
alter table categories enable row level security;
alter table equipment enable row level security;
alter table loan_requests enable row level security;
alter table loan_items enable row level security;

-- Profiles policies
create policy "read_own_profile" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "admin_update_profiles" on profiles
  for update using (is_admin());

-- Categories (read for all authenticated, write for admin)
create policy "read_categories" on categories
  for select using (auth.uid() is not null);
create policy "admin_manage_categories" on categories
  for all using (is_admin());

-- Equipment (read for all authenticated, write for admin)
create policy "read_equipment" on equipment
  for select using (auth.uid() is not null);
create policy "admin_manage_equipment" on equipment
  for all using (is_admin());

-- Loan requests
create policy "read_own_requests" on loan_requests
  for select using (student_id = auth.uid() or is_admin());
create policy "student_insert_requests" on loan_requests
  for insert with check (student_id = auth.uid());
create policy "admin_manage_requests" on loan_requests
  for all using (is_admin());

-- Loan items
create policy "read_own_loan_items" on loan_items
  for select using (
    exists (
      select 1 from loan_requests
      where id = loan_id and (student_id = auth.uid() or is_admin())
    )
  );
create policy "student_insert_loan_items" on loan_items
  for insert with check (
    exists (
      select 1 from loan_requests
      where id = loan_id and student_id = auth.uid()
    )
  );
