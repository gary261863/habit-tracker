import { describe, test, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { buildHeatmapData, buildDateRange, useHeatmap } from './useHeatmap'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' }, profile: { timezone: 'America/La_Paz' } }),
}))
vi.mock('./useLogs', () => ({
  fetchLogsRange: vi.fn(),
}))
import { fetchLogsRange } from './useLogs'

// ── Tests de funciones puras ─────────────────────────────────

describe('buildHeatmapData', () => {
  test('siempre genera 365 días para un año pasado', () => {
    const data = buildHeatmapData(2025, [], '2026-07-01')
    expect(data).toHaveLength(365)
    expect(data[0].date).toBe('2025-01-01')
    expect(data[364].date).toBe('2025-12-31')
  })

  test('ningún día es futuro en un año pasado completo', () => {
    const data = buildHeatmapData(2025, [], '2026-07-01')
    expect(data.filter(d => d.future)).toHaveLength(0)
  })

  test('los días después de hoy se marcan como future:true', () => {
    const data = buildHeatmapData(2026, [], '2026-01-15')
    const futureDays = data.filter(d => d.future)
    const pastDays = data.filter(d => !d.future)
    expect(pastDays).toHaveLength(15)
    expect(futureDays[0].date).toBe('2026-01-16')
  })

  test('marca correctamente los días completados', () => {
    const logs = [{ date: '2025-03-10' }, { date: '2025-03-11' }]
    const data = buildHeatmapData(2025, logs, '2026-07-01')
    expect(data.find(d => d.date === '2025-03-10').done).toBe(true)
    expect(data.find(d => d.date === '2025-03-11').done).toBe(true)
    expect(data.find(d => d.date === '2025-03-12').done).toBe(false)
  })

  test('días futuros tienen done:false aunque existan logs', () => {
    const logs = [{ date: '2026-01-20' }]
    const data = buildHeatmapData(2026, logs, '2026-01-10')
    const jan20 = data.find(d => d.date === '2026-01-20')
    expect(jan20.future).toBe(true)
    expect(jan20.done).toBe(false)
  })
})

describe('buildDateRange', () => {
  test('año pasado: to = Dec 31 de ese año', () => {
    const { from, to } = buildDateRange(2025, '2026-07-01')
    expect(from).toBe('2025-01-01')
    expect(to).toBe('2025-12-31')
  })

  test('año actual: to = fecha de hoy', () => {
    const { from, to } = buildDateRange(2026, '2026-07-01')
    expect(from).toBe('2026-01-01')
    expect(to).toBe('2026-07-01')
  })
})

describe('useHeatmap hook', () => {
  afterEach(() => vi.clearAllMocks())

  test('no llama fetchLogsRange si no hay habitId', async () => {
    fetchLogsRange.mockResolvedValue([])
    renderHook(() => useHeatmap(null, 2025))
    await new Promise(r => setTimeout(r, 100))
    expect(fetchLogsRange).not.toHaveBeenCalled()
  })
})
