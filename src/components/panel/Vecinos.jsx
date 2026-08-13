import { useMemo } from 'react'
import { Bus, Trash2, Calendar, Recycle, Users } from 'lucide-react'
import { useColeccion } from '../../hooks/useColeccion'

const NOTIF_INFO = {
  basura: { label: 'Residuos', icon: Trash2, color: 'text-amarillo bg-amarillo/10' },
  eventos: { label: 'Eventos', icon: Calendar, color: 'text-verde bg-verde/10' },
  puntosVerdes: { label: 'Puntos Verdes', icon: Recycle, color: 'text-verde bg-verde/10' },
  combi: { label: 'Combi Municipal', icon: Bus, color: 'text-azul bg-azul/10' },
}

export default function Vecinos() {
  const { items, cargando } = useColeccion('vecinos')

  const conNotif = useMemo(() => items.filter(v => Object.values(v.notif || {}).some(Boolean)).length, [items])

  return (
    <div>
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-1">
        <Users className="w-5 h-5 text-verde" /> Vecinos registrados
      </h3>
      <p className="text-gray-500 text-sm mb-5">
        Vecinos que guardaron su perfil en la app. Solo se guarda nombre y preferencias de notificación —
        nunca teléfono, dirección, email ni zona.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-6 max-w-md">
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold font-poppins text-verde">{cargando ? '—' : items.length}</p>
          <p className="text-sm text-gray-500 mt-1">Vecinos registrados</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold font-poppins text-azul">{cargando ? '—' : conNotif}</p>
          <p className="text-sm text-gray-500 mt-1">Con notificaciones activas</p>
        </div>
      </div>

      {cargando ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-sm">Todavía no hay vecinos registrados.</p>
      ) : (
        <div className="space-y-2">
          {items.map(v => (
            <div key={v.id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-gray-800">{v.nombre} {v.apellido}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(NOTIF_INFO).map(([key, { label, icon: Icon, color }]) => v.notif?.[key] && (
                  <span key={key} className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
                    <Icon className="w-3 h-3" /> {label}
                  </span>
                ))}
                {!Object.values(v.notif || {}).some(Boolean) && (
                  <span className="text-xs text-gray-400">Sin notificaciones activas</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
