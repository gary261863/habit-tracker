import { describe, test, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToday } from './useToday'

describe('useToday', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('devuelve la fecha actual al montar', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-29T15:00:00'))

    const { result } = renderHook(() => useToday())
    expect(result.current).toBe('2026-06-29')
  })

  test('detecta el cambio de día después de cruzar medianoche', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-29T23:59:30'))

    const { result } = renderHook(() => useToday())
    expect(result.current).toBe('2026-06-29')

    // Avanza el reloj del sistema y dispara el intervalo de 60s
    act(() => {
      vi.setSystemTime(new Date('2026-06-30T00:01:00'))
      vi.advanceTimersByTime(60_000)
    })

    expect(result.current).toBe('2026-06-30')
  })

  test('no cambia si sigue siendo el mismo día', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-29T10:00:00'))

    const { result } = renderHook(() => useToday())
    expect(result.current).toBe('2026-06-29')

    act(() => {
      vi.setSystemTime(new Date('2026-06-29T10:05:00'))
      vi.advanceTimersByTime(60_000)
    })

    expect(result.current).toBe('2026-06-29')
  })
})
