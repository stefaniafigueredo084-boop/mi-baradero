import { useState } from 'react'
import { Newspaper } from 'lucide-react'
import { useColeccion } from '../hooks/useColeccion'

const formatoFecha = marca => {
  const ms = marca?.toMillis?.()
  return ms ? new Date(ms).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) : ''
}

// Noticias que publica el sector Eventos desde el panel, la más nueva
// primero. "limite" para mostrar solo las últimas (en la portada). Si no
// hay ninguna, no muestra nada (no es un error que todavía no haya).
export default function Noticias({ limite, titulo = 'Noticias', className = '' }) {
  const { items, cargando } = useColeccion('noticias')
  const [abierta, setAbierta] = useState(null)
  const lista = limite ? items.slice(0, limite) : items
  if (cargando || lista.length === 0) return null

  return (
    <section aria-labelledby="noticias-titulo" className={className}>
      <h2 id="noticias-titulo" className="text-base sm:text-lg font-bold font-poppins text-tinta mb-2.5 flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-primario" /> {titulo}
      </h2>
      <div className="space-y-2.5">
        {lista.map(n => {
          const expandida = abierta === n.id
          return (
            <article key={n.id} className="card flex flex-col sm:flex-row">
              {n.imagenData && (
                <img src={n.imagenData} alt="" className="w-full sm:w-40 h-36 sm:h-auto object-cover shrink-0" />
              )}
              <div className="p-4 min-w-0">
                <p className="text-xs font-semibold text-gray-500">{formatoFecha(n.creadoEn)}</p>
                <h3 className="font-bold font-poppins text-tinta leading-snug">{n.titulo}</h3>
                <p className="text-sm text-gray-600 mt-1">{n.resumen}</p>
                {n.cuerpo && expandida && <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{n.cuerpo}</p>}
                {n.cuerpo && (
                  <button
                    onClick={() => setAbierta(expandida ? null : n.id)}
                    aria-expanded={expandida}
                    className="mt-1 text-sm font-semibold text-primario-oscuro hover:underline"
                  >
                    {expandida ? 'Ver menos' : 'Leer más'}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
