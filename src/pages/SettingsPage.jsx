import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useHabits } from '../hooks/useHabits'
import { Plus, Pencil, Trash2, X, Check, Archive } from 'lucide-react'

const PALETTE = [
  '#2D6A4F','#52B788','#1B4332','#40916C',
  '#2563EB','#7C3AED','#DB2777','#DC2626',
  '#D97706','#059669','#0891B2','#4B5563',
]

const EMOJIS = ['💼','🏃','💪','❤️','📚','💰','🧘','🌱','🎯','✍️','🍎','🧠','💻','🎵','🌍']

// ── Category Form ──────────────────────────────────────────────
function CategoryForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [color, setColor] = useState(initial?.color || PALETTE[0])
  const [emoji, setEmoji] = useState(initial?.emoji || '📁')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave({ name: name.trim(), color, emoji })
    setSaving(false)
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex gap-2">
        {/* Emoji picker (simple) */}
        <div className="relative group">
          <button className="w-10 h-10 text-xl rounded border border-surface-200 flex items-center justify-center hover:bg-surface-100">
            {emoji}
          </button>
          <div className="absolute top-full left-0 mt-1 bg-white border border-surface-200 rounded-lg p-2 shadow-lg z-10 hidden group-focus-within:grid grid-cols-5 gap-1 w-40">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} className="text-lg p-1 hover:bg-surface-100 rounded">{e}</button>
            ))}
          </div>
        </div>
        <input
          className="input flex-1"
          placeholder="Nombre de la categoría"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          autoFocus
        />
      </div>
      {/* Color */}
      <div>
        <label className="label">Color</label>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full border-2 transition-all"
              style={{ backgroundColor: c, borderColor: color === c ? '#000' : 'transparent' }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={save} disabled={saving || !name.trim()} className="btn-primary">
          <Check size={14} /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onCancel} className="btn-ghost">
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Habit Form ─────────────────────────────────────────────────
function HabitForm({ categories, initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [emoji, setEmoji] = useState(initial?.emoji || '⚪')
  const [categoryId, setCategoryId] = useState(initial?.category_id || categories[0]?.id || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave({ name: name.trim(), emoji, category_id: categoryId || null })
    setSaving(false)
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex gap-2">
        <div className="relative group">
          <button className="w-10 h-10 text-xl rounded border border-surface-200 flex items-center justify-center hover:bg-surface-100">
            {emoji}
          </button>
          <div className="absolute top-full left-0 mt-1 bg-white border border-surface-200 rounded-lg p-2 shadow-lg z-10 hidden group-focus-within:grid grid-cols-5 gap-1 w-40">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} className="text-lg p-1 hover:bg-surface-100 rounded">{e}</button>
            ))}
          </div>
        </div>
        <input
          className="input flex-1"
          placeholder="Nombre del hábito"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          autoFocus
        />
      </div>
      <div>
        <label className="label">Categoría</label>
        <select
          className="input"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
        >
          <option value="">Sin categoría</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={save} disabled={saving || !name.trim()} className="btn-primary">
          <Check size={14} /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onCancel} className="btn-ghost">
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Main Settings Page ─────────────────────────────────────────
export default function SettingsPage() {
  const { categories, create: createCat, update: updateCat, remove: removeCat } = useCategories()
  const { habits, create: createHabit, update: updateHabit, archive: archiveHabit, remove: removeHabit } = useHabits()

  const [catForm, setCatForm] = useState(null) // null | 'new' | {id,...}
  const [habitForm, setHabitForm] = useState(null)
  const [confirm, setConfirm] = useState(null) // {type, id, label}

  const handleCreateCat = async (fields) => {
    await createCat(fields)
    setCatForm(null)
  }
  const handleUpdateCat = async (id, fields) => {
    await updateCat(id, fields)
    setCatForm(null)
  }
  const handleCreateHabit = async (fields) => {
    await createHabit(fields)
    setHabitForm(null)
  }
  const handleUpdateHabit = async (id, fields) => {
    await updateHabit(id, fields)
    setHabitForm(null)
  }
  const handleConfirm = async () => {
    if (!confirm) return
    if (confirm.type === 'cat') await removeCat(confirm.id)
    if (confirm.type === 'habit') await removeHabit(confirm.id)
    if (confirm.type === 'archive') await archiveHabit(confirm.id)
    setConfirm(null)
  }

  const grouped = habits.reduce((acc, h) => {
    const key = h.category_id || 'none'
    if (!acc[key]) acc[key] = []
    acc[key].push(h)
    return acc
  }, {})

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold text-ink">Ajustes</h1>

      {/* ── Categories ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wider">Categorías</h2>
          <button onClick={() => setCatForm('new')} className="btn-ghost text-accent hover:bg-accent/10">
            <Plus size={15} /> Nueva
          </button>
        </div>

        {catForm === 'new' && (
          <div className="mb-3">
            <CategoryForm onSave={handleCreateCat} onCancel={() => setCatForm(null)} />
          </div>
        )}

        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id}>
              {catForm?.id === cat.id ? (
                <CategoryForm
                  initial={cat}
                  onSave={(f) => handleUpdateCat(cat.id, f)}
                  onCancel={() => setCatForm(null)}
                />
              ) : (
                <div className="card px-4 py-3 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-sm font-medium text-ink flex-1">{cat.name}</span>
                  <button onClick={() => setCatForm(cat)} className="btn-ghost px-2 py-1 text-ink-muted">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setConfirm({ type: 'cat', id: cat.id, label: cat.name })} className="btn-ghost px-2 py-1 text-danger">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-ink-muted text-center py-4">Aún no hay categorías. ¡Crea la primera!</p>
          )}
        </div>
      </section>

      {/* ── Habits ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wider">Hábitos</h2>
          <button
            onClick={() => setHabitForm('new')}
            className="btn-ghost text-accent hover:bg-accent/10"
            disabled={categories.length === 0}
            title={categories.length === 0 ? 'Crea una categoría primero' : ''}
          >
            <Plus size={15} /> Nuevo
          </button>
        </div>

        {categories.length === 0 && (
          <p className="text-sm text-ink-muted mb-3">Crea al menos una categoría para añadir hábitos.</p>
        )}

        {habitForm === 'new' && (
          <div className="mb-3">
            <HabitForm categories={categories} onSave={handleCreateHabit} onCancel={() => setHabitForm(null)} />
          </div>
        )}

        <div className="space-y-6">
          {categories.map(cat => {
            const catHabits = grouped[cat.id] || []
            if (catHabits.length === 0) return null
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">{cat.emoji} {cat.name}</span>
                </div>
                <div className="space-y-2">
                  {catHabits.map(habit => (
                    <div key={habit.id}>
                      {habitForm?.id === habit.id ? (
                        <HabitForm
                          categories={categories}
                          initial={habit}
                          onSave={(f) => handleUpdateHabit(habit.id, f)}
                          onCancel={() => setHabitForm(null)}
                        />
                      ) : (
                        <div className="card px-4 py-3 flex items-center gap-3">
                          <span className="text-base">{habit.emoji || '⚪'}</span>
                          <span className="text-sm font-medium text-ink flex-1">{habit.name}</span>
                          <button onClick={() => setHabitForm(habit)} className="btn-ghost px-2 py-1 text-ink-muted">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setConfirm({ type: 'archive', id: habit.id, label: habit.name })} className="btn-ghost px-2 py-1 text-ink-muted" title="Archivar">
                            <Archive size={13} />
                          </button>
                          <button onClick={() => setConfirm({ type: 'habit', id: habit.id, label: habit.name })} className="btn-ghost px-2 py-1 text-danger">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {habits.length === 0 && categories.length > 0 && (
            <p className="text-sm text-ink-muted text-center py-4">Aún no hay hábitos. ¡Crea el primero!</p>
          )}
        </div>
      </section>

      {/* ── Confirm dialog ── */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-semibold text-ink mb-2">
              {confirm.type === 'archive' ? 'Archivar hábito' : 'Eliminar permanentemente'}
            </h3>
            <p className="text-sm text-ink-soft mb-4">
              {confirm.type === 'archive'
                ? `¿Archivar "${confirm.label}"? Dejará de aparecer en la lista diaria pero conservarás el historial.`
                : `¿Eliminar "${confirm.label}"? Esta acción no se puede deshacer.`}
            </p>
            <div className="flex gap-2">
              <button onClick={handleConfirm} className="btn-danger">
                {confirm.type === 'archive' ? 'Archivar' : 'Eliminar'}
              </button>
              <button onClick={() => setConfirm(null)} className="btn-ghost">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
