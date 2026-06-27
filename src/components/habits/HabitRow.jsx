export default function HabitRow({ habit, completed, onToggle }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer select-none
        ${completed ? 'bg-accent/5' : 'bg-white hover:bg-surface-50'}
        border ${completed ? 'border-accent/20' : 'border-surface-200'}`}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all
        ${completed ? 'bg-accent border-accent' : 'border-surface-300'}`}>
        {completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Emoji + name */}
      <span className="text-lg leading-none">{habit.emoji || '⚪'}</span>
      <span className={`text-sm font-medium flex-1 ${completed ? 'text-ink-muted line-through' : 'text-ink'}`}>
        {habit.name}
      </span>
    </div>
  )
}
