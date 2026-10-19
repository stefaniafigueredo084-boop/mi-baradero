// "Agregar a mi calendario" para un evento con fecha exacta (fechaISO =
// "2026-11-21", cargada desde el panel). Arma el link de Google Calendar
// y el archivo .ics (iPhone, Outlook y casi cualquier otra app).
// Baradero está en UTC-3 todo el año (Argentina no usa horario de verano).

const DURACION_HORAS = 2

// "20:00", "20 hs", "20.30" → [20, 0] / [20, 30]; null si no hay hora.
function leerHora(texto) {
  const m = String(texto || '').match(/(\d{1,2})(?:[:.](\d{2}))?/)
  if (!m) return null
  const h = +m[1], min = +(m[2] || 0)
  return h < 24 && min < 60 ? [h, min] : null
}

const dos = n => String(n).padStart(2, '0')
const fechaUTC = d => `${d.getUTCFullYear()}${dos(d.getUTCMonth() + 1)}${dos(d.getUTCDate())}T${dos(d.getUTCHours())}${dos(d.getUTCMinutes())}00Z`
const soloFecha = d => `${d.getUTCFullYear()}${dos(d.getUTCMonth() + 1)}${dos(d.getUTCDate())}`

export const tieneFechaExacta = evento => /^\d{4}-\d{2}-\d{2}$/.test(evento?.fechaISO || '')

// Inicio y fin del evento. Sin hora: evento de todo el día.
function rango(evento) {
  const [y, m, d] = evento.fechaISO.split('-').map(Number)
  const hora = leerHora(evento.hora)
  if (!hora) {
    const dia = new Date(Date.UTC(y, m - 1, d))
    const siguiente = new Date(Date.UTC(y, m - 1, d + 1))
    return { todoElDia: true, inicio: soloFecha(dia), fin: soloFecha(siguiente) }
  }
  const inicio = new Date(Date.UTC(y, m - 1, d, hora[0] + 3, hora[1])) // hora de Baradero → UTC
  const fin = new Date(inicio.getTime() + DURACION_HORAS * 3600_000)
  return { todoElDia: false, inicio: fechaUTC(inicio), fin: fechaUTC(fin) }
}

export function linkGoogleCalendar(evento) {
  const r = rango(evento)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: evento.titulo,
    dates: `${r.inicio}/${r.fin}`,
    details: evento.descripcion || '',
    location: `${evento.ubicacion || ''}, Baradero, Buenos Aires`,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

// Texto para .ics: escapa \ , ; y saltos de línea, como pide el formato.
const escapar = t => String(t || '').replace(/\\/g, '\\\\').replace(/[,;]/g, m => `\\${m}`).replace(/\r?\n/g, '\\n')

export function archivoIcs(evento) {
  const r = rango(evento)
  const valor = r.todoElDia ? ';VALUE=DATE:' : ':'
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mi Baradero//Eventos//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:evento-${evento.id}@mi-baradero.web.app`,
    `DTSTAMP:${fechaUTC(new Date())}`,
    `DTSTART${valor}${r.inicio}`,
    `DTEND${valor}${r.fin}`,
    `SUMMARY:${escapar(evento.titulo)}`,
    `DESCRIPTION:${escapar(evento.descripcion)}`,
    `LOCATION:${escapar(`${evento.ubicacion || ''}, Baradero, Buenos Aires`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lineas.join('\r\n')
}

export function descargarIcs(evento) {
  const blob = new Blob([archivoIcs(evento)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${evento.titulo.replace(/[^\w\sáéíóúñü-]/gi, '').trim() || 'evento'}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
