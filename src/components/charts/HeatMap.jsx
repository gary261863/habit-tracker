import { eachDayOfInterval, subYears, format, getDay, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function HeatMap({ data, color = '#2D6A4F' }) {
  if (!data || data.length === 0) return null

  // Build weeks
  const weeks = []
  let week = []
  data.forEach((entry, i) => {
    const dow = getDay(new Date(entry.date + 'T00:00:00'))
    if (i === 0) {
      // Pad the first week
      for (let p = 0; p < dow; p++) week.push(null)
    }
    week.push(entry)
    if (week.length === 7) { weeks.push(week); week = [] }
  })
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]" style={{ minWidth: `${weeks.length * 15}px` }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                className="heatmap-cell"
                style={{
                  backgroundColor: day
                    ? day.done
                      ? color
                      : '#e4e2de'
                    : 'transparent',
                  opacity: day?.done ? 1 : day ? 0.5 : 0,
                }}
                title={day ? `${day.date}: ${day.done ? '✅' : '❌'}` : ''}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
