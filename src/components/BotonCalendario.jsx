import { CalendarPlus } from 'lucide-react'
import { descargarIcs, linkGoogleCalendar, tieneFechaExacta } from '../utils/calendario'

// "Agregar a mi calendario": solo para eventos con fecha exacta cargada
// desde el panel. Google Calendar abre en una pestaña nueva; el archivo
// .ics lo abre el calendario del iPhone, Outlook y casi cualquier otro.
export default function BotonCalendario({ evento }) {
  if (!tieneFechaExacta(evento)) return null
  return (
    <details className="mt-3 group/cal">
      <summary className="list-none inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg border-2 border-primario/30 text-sm font-semibold text-primario-oscuro cursor-pointer hover:border-primario [&::-webkit-details-marker]:hidden">
        <CalendarPlus className="w-4 h-4" /> Agregar a mi calendario
      </summary>
      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={linkGoogleCalendar(evento)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center min-h-[44px] px-3 rounded-lg bg-primario-suave text-sm font-semibold text-primario-oscuro hover:underline"
        >
          Google Calendar
        </a>
        <button
          type="button"
          onClick={() => descargarIcs(evento)}
          className="inline-flex items-center min-h-[44px] px-3 rounded-lg bg-primario-suave text-sm font-semibold text-primario-oscuro hover:underline"
        >
          iPhone / Outlook / otro (.ics)
        </button>
      </div>
    </details>
  )
}
