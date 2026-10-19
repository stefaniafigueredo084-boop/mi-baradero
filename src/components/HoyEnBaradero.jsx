import { Link } from 'react-router-dom'
import { Bus, ChevronRight, Trash2 } from 'lucide-react'
import { useHorariosCombi } from '../hooks/useHorariosCombi'
import { useCalendarioResiduos, useZonasResiduos } from '../hooks/useResiduos'
import { useZonaVecino } from '../hooks/useZonaVecino'
import { fraseZonaHoy } from '../utils/residuos'

const minutosDe = hhmm => {
  const [h, m] = String(hhmm || '').split(':').map(Number)
  return h * 60 + (m || 0)
}

// Próxima salida de la combi a partir de ahora; si ya no quedan hoy, la
// primera de mañana.
function proximaCombi(horarios, ahora = new Date()) {
  const ordenados = [...horarios].filter(h => h.salida).sort((a, b) => minutosDe(a.salida) - minutosDe(b.salida))
  const min = ahora.getHours() * 60 + ahora.getMinutes()
  const hoy = ordenados.find(h => minutosDe(h.salida) > min)
  if (hoy) return { horario: hoy, falta: minutosDe(hoy.salida) - min, manana: false }
  return ordenados[0] ? { horario: ordenados[0], manana: true } : null
}

const textoFalta = min => (min < 60 ? `en ${min} min` : `en ${Math.floor(min / 60)} h ${min % 60 ? `${min % 60} min` : ''}`.trim())

// "Hoy en Baradero": lo que un vecino quiere saber de un vistazo al abrir
// la app — cuándo sale la próxima combi y qué residuo se saca hoy.
export default function HoyEnBaradero() {
  const horarios = useHorariosCombi()
  const calendario = useCalendarioResiduos()
  const zonas = useZonasResiduos()
  const [nombreZona] = useZonaVecino()
  const tuZona = zonas.find(z => z.nombre === nombreZona) || null

  const combi = proximaCombi(horarios)
  const residuos = fraseZonaHoy(tuZona, calendario)

  return (
    <section aria-labelledby="hoy-titulo" className="pt-6">
      <h2 id="hoy-titulo" className="text-base sm:text-lg font-bold font-poppins text-tinta mb-2.5">Hoy en Baradero</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link to="/combi#horarios" className="card p-4 flex items-start gap-3 hover:border-primario transition-colors">
          <span className="w-11 h-11 rounded-xl bg-primario text-white flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-xs font-bold uppercase tracking-wide text-gray-500">Próxima combi</span>
            {combi ? (
              <>
                <span className="block font-bold font-poppins text-tinta text-lg leading-tight">
                  {combi.manana ? `Mañana ${combi.horario.salida}` : `${combi.horario.salida} hs`}
                  {!combi.manana && <span className="text-sm font-semibold text-primario-oscuro"> · {textoFalta(combi.falta)}</span>}
                </span>
                <span className="block text-sm text-gray-600">
                  {combi.horario.origen} → {combi.horario.destino}
                  {combi.manana && ' · hoy ya no quedan salidas'}
                </span>
              </>
            ) : (
              <span className="block text-sm text-gray-600">Todavía no hay horarios cargados.</span>
            )}
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 self-center" />
        </Link>

        <Link to="/residuos#tu-zona" className="card p-4 flex items-start gap-3 hover:border-primario transition-colors">
          <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${residuos.momento === 'ahora' ? 'bg-acento text-tinta' : 'bg-secundario text-tinta'}`}>
            <Trash2 className="w-5 h-5" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-xs font-bold uppercase tracking-wide text-gray-500">
              Residuos{tuZona ? ` · ${tuZona.nombre}` : ''}
            </span>
            <span className="block font-bold font-poppins text-tinta leading-tight">{residuos.titulo}</span>
            <span className="block text-sm text-gray-600">
              {tuZona ? residuos.detalle : 'Elegí tu zona para ver el horario del camión.'}
            </span>
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 self-center" />
        </Link>
      </div>
    </section>
  )
}
