-- ============================================================
-- MIGRACIÓN: Crear categoría "Sin categoría" para hábitos huérfanos
-- Ejecutar una sola vez en Supabase SQL Editor
-- ============================================================

-- 1. Crear una categoría "Sin categoría" para cada usuario que tenga
--    al menos un hábito con category_id = null
insert into public.categories (user_id, name, color, emoji)
select distinct h.user_id, 'Sin categoría', '#9a9691', '📁'
from public.habits h
where h.category_id is null
  and not exists (
    select 1 from public.categories c
    where c.user_id = h.user_id and c.name = 'Sin categoría'
  );

-- 2. Reasignar los hábitos huérfanos a esa categoría
update public.habits h
set category_id = c.id
from public.categories c
where h.category_id is null
  and c.user_id = h.user_id
  and c.name = 'Sin categoría';

-- Verifica el resultado:
-- select id, name, category_id from public.habits where category_id is null;
-- (debería devolver 0 filas)
