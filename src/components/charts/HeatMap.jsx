import { eachDayOfInterval, format, getDay } from 'date-fns'
import { es } from 'date-fns/locale'

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
// Solo mostramos etiqueta en filas impares para no saturar
const VISIBLE_DAYS = [1, 3, 5] // Lun, Mié, Vie

export default function HeatMap({ data, color = '#2D6A4F' }) {
  if (!data || data.length === 0) return null

  // Build weeks
  const weeks = []
  let week = []
  data.forEach((entry, i) => {
    const dow = getDay(new Date(entry.date + 'T00:00:00'))
    if (i === 0) {
      for (let p = 0; p < dow; p++) week.push(null)
    }
    week.push(entry)
    if (week.length === 7) { weeks.push(week); week = [] }
  })
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  // Build month labels: find the first week where each month appears
  const monthLabels = [] // [{weekIndex, label}]
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    const firstDay = week.find(d => d !== null)
    if (!firstDay) return
    const month = new Date(firstDay.date + 'T00:00:00').getMonth()
    if (month !== lastMonth) {
      monthLabels.push({ weekIndex: wi, label: format(new Date(firstDay.date + 'T00:00:00'), 'MMM', { locale: es }) })
      lastMonth = month
    }
  })

  const CELL = 12
  const GAP = 3
  const STEP = CELL + GAP
  const DAY_COL_W = 24

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: `${DAY_COL_W + weeks.length * STEP}px` }}>

        {/* Month labels row */}
        <div className="flex mb-1" style={{ paddingLeft: DAY_COL_W }}>
          {weeks.map((_, wi) => {
            const label = monthLabels.find(m => m.weekIndex === wi)
            return (
              <div key={wi} style={{ width: STEP, flexShrink: 0 }}>
                {label && (
                  <span className="text-[10px] text-ink-muted capitalize">{label.label}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Grid: day labels + cells */}
        <div className="flex gap-[3px]">
          {/* Day labels column */}
          <div className="flex flex-col gap-[3px]" style={{ width: DAY_COL_W }}>
            {[0,1,2,3,4,5,6].map(di => (
              <div key={di} style={{ height: CELL }} className="flex items-center">
                {VISIBLE_DAYS.includes(di) && (
                  <span className="text-[10px] text-ink-muted leading-none">{DAY_LABELS[di]}</span>
                )}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  className="heatmap-cell"
                  style={{
                    backgroundColor: day
                      ? day.future ? 'transparent'
                        : day.done ? color : '#e4e2de'
                      : 'transparent',
                    opacity: day?.future ? 0 : day?.done ? 1 : day ? 0.5 : 0,
                  }}
                  title={day && !day.future ? `${day.date}: ${day.done ? '✅' : '❌'}` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
