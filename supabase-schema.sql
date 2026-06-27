-- ============================================================
-- HABIT TRACKER — Schema para Supabase
-- Corre esto en el SQL Editor de tu proyecto de Supabase
-- ============================================================

-- Habilitar RLS (Row Level Security) en todas las tablas
-- Las políticas aseguran que cada usuario solo vea sus propios datos

-- ── Categorías ──────────────────────────────────────────────
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#2D6A4F',
  emoji       text not null default '📁',
  created_at  timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Users manage own categories"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Hábitos ─────────────────────────────────────────────────
create table public.habits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  category_id   uuid references public.categories(id) on delete set null,
  name          text not null,
  emoji         text not null default '⚪',
  is_archived   boolean not null default false,
  order_index   integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "Users manage own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Registros diarios ───────────────────────────────────────
create table public.habit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  habit_id    uuid not null references public.habits(id) on delete cascade,
  date        date not null,
  completed   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique(user_id, habit_id, date)
);

alter table public.habit_logs enable row level security;

create policy "Users manage own logs"
  on public.habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Índices para rendimiento ─────────────────────────────────
create index on public.habits(user_id, is_archived);
create index on public.habit_logs(user_id, date);
create index on public.habit_logs(habit_id, date);
