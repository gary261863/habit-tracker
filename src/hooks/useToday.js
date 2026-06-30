import { useState, useEffect } from 'react'
import { format } from 'date-fns'

/**
 * Devuelve la fecha de hoy en formato 'yyyy-MM-dd' y se actualiza
 * automáticamente cuando cambia el día (a medianoche), sin necesidad
 * de recargar la página.
 */
export function useToday() {
  const [today, setToday] = useState(() => format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    // Revisa cada minuto si la fecha cambió
    const interval = setInterval(() => {
      const now = format(new Date(), 'yyyy-MM-dd')
      setToday(prev => (prev !== now ? now : prev))
    }, 60 * 1000) // cada 60 segundos

    // También revisa al volver a la pestaña (por si el dispositivo durmió)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const now = format(new Date(), 'yyyy-MM-dd')
        setToday(prev => (prev !== now ? now : prev))
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return today
}
