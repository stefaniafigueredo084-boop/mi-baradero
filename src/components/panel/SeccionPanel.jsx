import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

// Versión sobria del acordeón, solo para el Panel de Trabajadores:
// una lista con líneas divisorias, ícono gris chico y sin colores ni
// animaciones (las páginas públicas siguen usando Acordeon.jsx).
export function ListaSecciones({ children }) {
  return (
    <div className="bg-white border border-gray-200 rounded divide-y divide-gray-200 mb-6">
      {children}
    </div>
  )
}

export default function SeccionPanel({ icono: Icono, titulo, descripcion, badge, abiertoPorDefecto = false, children }) {
  const [abierto, setAbierto] = useState(abiertoPorDefecto)

  return (
    <section>
      <button
        onClick={() => setAbierto(a => !a)}
        aria-expanded={abierto}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${abierto ? 'bg-gray-50' : ''}`}
      >
        {abierto
          ? <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />}
        {Icono && <Icono className="w-4 h-4 text-gray-500 shrink-0" />}
        <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-3">
          <p className="text-sm font-semibold text-gray-900">{titulo}</p>
          {descripcion && <p className="text-xs text-gray-500 truncate">{descripcion}</p>}
        </div>
        {!!badge && (
          <span className="shrink-0 bg-red-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-sm tabular-nums">
            {badge} pendiente{badge === 1 ? '' : 's'}
          </span>
        )}
      </button>
      {abierto && (
        <div className="px-4 py-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </section>
  )
}
