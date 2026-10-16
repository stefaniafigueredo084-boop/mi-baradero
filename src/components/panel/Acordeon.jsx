import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const COLOR_ICONO = {
  azul: 'bg-primario/15 text-primario',
  verde: 'bg-secundario/15 text-secundario',
  amarillo: 'bg-acento/25 text-amber-900',
}

// Agrupa varios AcordeonItem con separación consistente.
export function Acordeon({ children }) {
  return <div className="space-y-2 mb-6">{children}</div>
}

// Una sección colapsable del panel: ícono + título + descripción corta
// + badge opcional (ej: "3" pendientes) + contenido que se muestra solo
// al abrirla. Reemplaza la pila plana de secciones separadas por líneas
// — así el empleado ve de un vistazo qué tiene pendiente (badge) sin
// tener que scrollear formularios que no va a tocar ahora.
export default function AcordeonItem({ icono: Icono, color = 'verde', titulo, descripcion, badge, abiertoPorDefecto = false, children }) {
  const [abierto, setAbierto] = useState(abiertoPorDefecto)

  return (
    <div className="card overflow-hidden !p-0">
      <button
        onClick={() => setAbierto(a => !a)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primario/5 transition-colors"
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${COLOR_ICONO[color] || COLOR_ICONO.verde}`}>
          <Icono className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold font-poppins text-base sm:text-lg text-gray-800">{titulo}</p>
          {descripcion && <p className="text-sm text-gray-500 truncate">{descripcion}</p>}
        </div>
        {!!badge && (
          <span className="shrink-0 bg-red-50 text-red-500 text-sm font-bold px-3 py-1.5 rounded-full">{badge}</span>
        )}
        {abierto ? <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />}
      </button>
      {abierto && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}
