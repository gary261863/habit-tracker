-- ============================================================
-- HABIT TRACKER — Schema Admin (ejecutar después del schema base)
-- ============================================================

-- ── Perfiles de usuario ──────────────────────────────────────
create table public.user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  is_active     boolean not null default true,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz
);

alter table public.user_profiles enable row level security;

-- Cualquier usuario autenticado puede leer su propio perfil
create policy "Users read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

-- Solo admins pueden leer todos los perfiles
create policy "Admins read all profiles"
  on public.user_profiles for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Solo admins pueden actualizar perfiles
create policy "Admins update profiles"
  on public.user_profiles for update
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- El sistema puede insertar perfiles (via trigger)
create policy "System insert profiles"
  on public.user_profiles for insert
  with check (true);

-- ── Emails permitidos (lista blanca) ─────────────────────────
create table public.allowed_emails (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  added_by    uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

alter table public.allowed_emails enable row level security;

-- Cualquiera puede verificar si su email está permitido (necesario para el registro)
create policy "Anyone can check allowed emails"
  on public.allowed_emails for select
  using (true);

-- Solo admins pueden insertar/eliminar
create policy "Admins manage allowed emails"
  on public.allowed_emails for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- ── Trigger: crear perfil automáticamente al registrarse ─────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, created_at)
  values (new.id, new.email, now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Trigger: actualizar last_seen_at ─────────────────────────
create or replace function public.handle_user_login()
returns trigger as $$
begin
  update public.user_profiles
  set last_seen_at = now()
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- ── TU EMAIL COMO ADMIN ───────────────────────────────────────
-- Ejecuta esto DESPUÉS de registrarte en la app por primera vez:
-- Reemplaza 'tu@email.com' con tu email real

-- insert into public.allowed_emails (email) values ('tu@email.com');
-- update public.user_profiles set is_admin = true where email = 'tu@email.com';
