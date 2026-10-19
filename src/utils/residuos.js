// Cálculos de "hoy" para la recolección de residuos, compartidos entre
// la portada (Hoy en Baradero) y la página de Residuos (Tu zona). Todo
// sale del calendario semanal y del horario de cada zona — no hay GPS
// en el camión, así que nunca se inventan minutos de llegada.

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const sinAcentos = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function nombreDiaHoy(ahora = new Date()) {
  return DIAS[ahora.getDay()]
}

// Entrada del calendario para un día ("Miércoles" o "Miercoles").
export function diaDelCalendario(calendario, nombreDia) {
  return calendario.find(d => sinAcentos(d.dia) === sinAcentos(nombreDia)) || null
}

export const hayRecoleccion = dia => !!dia && dia.color !== 'gris'

// Próximo día (desde mañana) que tiene recolección.
export function proximaRecoleccion(calendario, ahora = new Date()) {
  for (let i = 1; i <= 7; i++) {
    const nombre = DIAS[(ahora.getDay() + i) % 7]
    const dia = diaDelCalendario(calendario, nombre)
    if (hayRecoleccion(dia)) return { ...dia, cuando: i === 1 ? 'Mañana' : nombre }
  }
  return null
}

// "08:00 - 10:00" → { desde: 480, hasta: 600 } en minutos del día.
function rangoHorario(horario) {
  const m = String(horario || '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/)
  if (!m) return null
  return { desde: +m[1] * 60 + +m[2], hasta: +m[3] * 60 + +m[4] }
}

// Dónde está hoy la zona respecto de su horario: 'antes' | 'ahora' |
// 'paso' | null (si el horario no se puede leer).
export function momentoZona(zona, ahora = new Date()) {
  const r = rangoHorario(zona?.horario)
  if (!r) return null
  const min = ahora.getHours() * 60 + ahora.getMinutes()
  if (min < r.desde) return 'antes'
  if (min <= r.hasta) return 'ahora'
  return 'paso'
}

// Frase lista para mostrar sobre tu zona hoy.
export function fraseZonaHoy(zona, calendario, ahora = new Date()) {
  const hoy = diaDelCalendario(calendario, nombreDiaHoy(ahora))
  if (!hayRecoleccion(hoy)) {
    const proxima = proximaRecoleccion(calendario, ahora)
    return {
      titulo: 'Hoy no hay recolección',
      detalle: proxima ? `Próxima: ${proxima.cuando}, ${proxima.tipo.toLowerCase()}${zona ? ` (${zona.horario})` : ''}.` : '',
      momento: null,
    }
  }
  if (!zona) return { titulo: `Hoy: ${hoy.tipo.toLowerCase()}`, detalle: hoy.descripcion, momento: null }
  const momento = momentoZona(zona, ahora)
  const titulo = {
    antes: `Hoy pasa entre ${zona.horario.replace(/\s*-\s*/, ' y ')}`,
    ahora: 'Debería estar pasando por tu zona',
    paso: 'Hoy ya debería haber pasado',
  }[momento] || `Hoy pasa en el horario ${zona.horario}`
  return { titulo, detalle: `${hoy.tipo} · horario estimado ${zona.horario}`, momento }
}
