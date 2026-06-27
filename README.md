# 🌱 Habit Tracker

Aplicación web para trackear hábitos diarios, con categorías, gráficas de progreso y rachas.

**Stack:** React + Vite · Tailwind CSS · Supabase · Vercel

---

## Configuración paso a paso

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase-schema.sql`
3. En **Project Settings → API** copia:
   - `Project URL`
   - `anon public` key

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 3. Instalar y correr localmente

```bash
npm install
npm run dev
```

### 4. Deploy en Vercel

1. Sube el proyecto a GitHub
2. Importa el repositorio en [vercel.com](https://vercel.com)
3. En **Settings → Environment Variables** añade las mismas variables del `.env`
4. Deploy ✅

---

## Estructura del proyecto

```
src/
├── components/
│   ├── auth/
│   ├── habits/        HabitRow
│   ├── charts/        HeatMap
│   └── layout/        Sidebar, AppLayout
├── pages/
│   ├── TodayPage      Vista diaria con checkboxes
│   ├── HistoryPage    Navegar días pasados
│   ├── StatsPage      Gráficas, rachas, mapa de calor
│   └── SettingsPage   CRUD de categorías y hábitos
├── hooks/
│   ├── useCategories
│   ├── useHabits
│   ├── useLogs
│   └── useStats
├── context/
│   └── AuthContext
└── lib/
    └── supabase.js
```

## Funcionalidades

- ✅ Autenticación con email + contraseña (Supabase Auth)
- ✅ Categorías con color y emoji personalizados (ilimitadas)
- ✅ Hábitos agrupados por categoría
- ✅ Check diario sí/no
- ✅ Editar días pasados (Historial)
- ✅ Racha actual y máxima por hábito 🔥
- ✅ Tasa de éxito anual por hábito y categoría
- ✅ Mapa de calor anual estilo GitHub
- ✅ Gráfica de barras de los últimos 30 días
- ✅ Archivar hábitos (sin perder historial)
- ✅ Responsive: funciona en móvil y desktop
