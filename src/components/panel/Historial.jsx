import { useMemo, useState } from 'react'
import { LogIn, LogOut, Plus, Pencil, Trash2, History } from 'lucide-react'
import { useColeccion } from '../../hooks/useColeccion'
import { labelSector } from '../../data/sectores'

const TIPOS = {
  login:  { label: 'Inició sesión', icon: LogIn,   color: 'text-verde bg-verde/10' },
  logout: { label: 'Cerró sesión',  icon: LogOut,  color: 'text-gray-500 bg-gray-100' },
  crear:  { label: 'Agregó',        icon: Plus,    color: 'text-verde bg-verde/10' },
  editar: { label: 'Editó',         icon: Pencil,  color: 'text-azul bg-azul/10' },
  eliminar: { label: 'Eliminó',     icon: Trash2,  color: 'text-red-500 bg-red-50' },
}

function formatearFecha(ts) {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function Historial() {
  const { items, cargando } = useColeccion('historial')
  const [filtroTrabajador, setFiltroTrabajador] = useState('')
  const [filtroSeccion, setFiltroSeccion] = useState('')

  const trabajadores = useMemo(() => [...new Set(items.map(i => i.email))].sort(), [items])
  const secciones = useMemo(() => [...new Set(items.map(i => i.seccion))].sort(), [items])

  const filtrados = items.filter(i =>
    (!filtroTrabajador || i.email === filtroTrabajador) &&
    (!filtroSeccion || i.seccion === filtroSeccion)
  )

  return (
    <div>
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-1">
        <History className="w-5 h-5 text-verde" /> Historial de actividad
      </h3>
      <p className="text-gray-500 text-sm mb-5">
        Entradas, salidas y cambios de contenido de cada trabajador, en todas las secciones del panel.
      </p>

      <div className="flex flex-wrap gap-3 mb-5">
        <select className="select-field !w-auto" value={filtroTrabajador} onChange={e => setFiltroTrabajador(e.target.value)}>
          <option value="">Todos los trabajadores</option>
          {trabajadores.map(email => <option key={email} value={email}>{email}</option>)}
        </select>
        <select className="select-field !w-auto" value={filtroSeccion} onChange={e => setFiltroSeccion(e.target.value)}>
          <option value="">Todas las secciones</option>
          {secciones.map(s => <option key={s} value={s}>{s === 'usuarios' ? 'Usuarios' : labelSector(s)}</option>)}
        </select>
      </div>

      {cargando ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-gray-400 text-sm">Todavía no hay actividad registrada.</p>
      ) : (
        <div className="space-y-2">
          {filtrados.map(item => {
            const tipo = TIPOS[item.tipo] || TIPOS.crear
            const Icon = tipo.icon
            return (
              <div key={item.id} className="card p-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tipo.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm truncate">{item.email}</span>
                    <span className="badge bg-gray-100 text-gray-600 text-xs">
                      {item.seccion === 'usuarios' ? 'Usuarios' : labelSector(item.seccion)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {tipo.label}{item.detalle ? `: ${item.detalle}` : ''}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{formatearFecha(item.creadoEn)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
