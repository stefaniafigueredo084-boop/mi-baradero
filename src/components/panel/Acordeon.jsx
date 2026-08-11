import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const COLOR_ICONO = {
  azul: 'bg-azul/15 text-azul',
  verde: 'bg-verde/15 text-verde',
  amarillo: 'bg-amarillo/25 text-yellow-700',
}

// Agrupa varios AcordeonItem con separación consistente.
export function Acordeon({ children }) {
  return <div className="space-y-3 mb-10">{children}</div>
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
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${COLOR_ICONO[color] || COLOR_ICONO.verde}`}>
          <Icono className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold font-poppins text-base sm:text-lg text-gray-800">{titulo}</p>
          {descripcion && <p className="text-sm text-gray-400 truncate">{descripcion}</p>}
        </div>
        {!!badge && (
          <span className="shrink-0 bg-red-50 text-red-500 text-sm font-bold px-3 py-1.5 rounded-full">{badge}</span>
        )}
        {abierto ? <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />}
      </button>
      {abierto && (
        <div className="px-5 pb-6 pt-3 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}
