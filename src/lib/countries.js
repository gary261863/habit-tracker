// Países comunes con su zona horaria IANA principal
export const COUNTRIES = [
  { code: 'BO', name: 'Bolivia', timezone: 'America/La_Paz' },
  { code: 'AR', name: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
  { code: 'BR', name: 'Brasil', timezone: 'America/Sao_Paulo' },
  { code: 'CL', name: 'Chile', timezone: 'America/Santiago' },
  { code: 'CO', name: 'Colombia', timezone: 'America/Bogota' },
  { code: 'CR', name: 'Costa Rica', timezone: 'America/Costa_Rica' },
  { code: 'CU', name: 'Cuba', timezone: 'America/Havana' },
  { code: 'DO', name: 'República Dominicana', timezone: 'America/Santo_Domingo' },
  { code: 'EC', name: 'Ecuador', timezone: 'America/Guayaquil' },
  { code: 'SV', name: 'El Salvador', timezone: 'America/El_Salvador' },
  { code: 'ES', name: 'España', timezone: 'Europe/Madrid' },
  { code: 'US', name: 'Estados Unidos', timezone: 'America/New_York' },
  { code: 'GT', name: 'Guatemala', timezone: 'America/Guatemala' },
  { code: 'HN', name: 'Honduras', timezone: 'America/Tegucigalpa' },
  { code: 'MX', name: 'México', timezone: 'America/Mexico_City' },
  { code: 'NI', name: 'Nicaragua', timezone: 'America/Managua' },
  { code: 'PA', name: 'Panamá', timezone: 'America/Panama' },
  { code: 'PY', name: 'Paraguay', timezone: 'America/Asuncion' },
  { code: 'PE', name: 'Perú', timezone: 'America/Lima' },
  { code: 'PR', name: 'Puerto Rico', timezone: 'America/Puerto_Rico' },
  { code: 'UY', name: 'Uruguay', timezone: 'America/Montevideo' },
  { code: 'VE', name: 'Venezuela', timezone: 'America/Caracas' },
  { code: 'CA', name: 'Canadá', timezone: 'America/Toronto' },
  { code: 'OTHER', name: 'Otro país', timezone: 'UTC' },
]

export function getTimezoneForCountry(countryCode) {
  return COUNTRIES.find(c => c.code === countryCode)?.timezone || 'UTC'
}
