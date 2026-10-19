import { useMemo, useState } from 'react'
import { Calendar, MapPin, Clock, Filter, Star, Bell, BellOff, CheckCircle } from 'lucide-react'
import { eventos as eventosFijos, categorias as categoriasBase } from '../data/eventosData'
import { useColeccion } from '../hooks/useColeccion'
import { useAviso } from '../hooks/useAviso'
import { pedirPermisoNotificacion, mostrarNotificacion, saludar } from '../utils/notificaciones'
import EstadoVacio from '../components/EstadoVacio'
import Noticias from '../components/Noticias'

const categoriaBadgeColor = {
  'Festival': 'bg-primario/10 text-primario',
  'Cultura': 'bg-secundario/10 text-secundario',
  'Comercio': 'bg-acento/20 text-amber-900',
  'Deportes': 'bg-purple-100 text-purple-700',
  'Arte': 'bg-pink-100 text-pink-700',
  'Obras Públicas': 'bg-primario/10 text-primario',
  'Educación': 'bg-secundario/10 text-secundario',
  'Turismo': 'bg-teal-100 text-teal-700',
  'Salud': 'bg-red-100 text-red-700',
}

export default function Eventos() {
  const [catActiva, setCatActiva] = useState('Todos')
  const [notifActiva, setNotifActiva] = useState(false)

  // Eventos cargados desde el panel de trabajadores (Firestore), seguidos
  // de los eventos fijos del sitio como respaldo.
  const { items: eventosLive } = useColeccion('eventos')
  const eventos = useMemo(() => [
    ...eventosLive,
    // Si un trabajador ya importó este evento original al panel, no lo
    // mostramos dos veces — el importado (editable) reemplaza al fijo.
    ...eventosFijos.filter(e => !eventosLive.some(le => le.idOriginal === e.id)),
  ], [eventosLive])

  const categorias = useMemo(() => {
    const nuevas = [...new Set(eventos.map(e => e.categoria).filter(Boolean))].filter(c => !categoriasBase.includes(c))
    return [...categoriasBase, ...nuevas]
  }, [eventos])

  const avisoEventos = useAviso('avisoEventos', notifActiva, aviso => ({
    title: 'Mi Baradero — Eventos',
    body: saludar(aviso.mensaje),
  }), 'eventos')

  const activarNotif = async () => {
    if (notifActiva) {
      setNotifActiva(false)
      return
    }
    const permiso = await pedirPermisoNotificacion()
    if (permiso === 'granted') {
      setNotifActiva(true)
      mostrarNotificacion('Mi Baradero — Eventos', {
        body: saludar('Te avisaremos cuando haya un evento por comenzar o se agregue uno nuevo a la agenda.'),
        icon: '/logo-mibaradero.png',
      }, 'eventos')
    }
  }

  const eventosFiltrados = catActiva === 'Todos'
    ? eventos
    : eventos.filter(e => e.categoria === catActiva)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado */}
      <div className="bg-primario text-white py-5 sm:py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-secundario text-tinta flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-poppins">Eventos y Noticias</h1>
              <p className="text-white/80 text-sm sm:text-base">Toda la agenda y novedades de Baradero</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-6">

        {/* Noticias publicadas desde el panel (no aparece si no hay) */}
        <Noticias />

        {/* Evento destacado */}
        {eventos.filter(e => e.destacado).slice(0, 1).map(evento => (
          <div key={evento.id} className="relative overflow-hidden rounded bg-primario-oscuro text-white p-4 sm:p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-acento fill-acento" />
                <span className="text-white text-xs font-bold uppercase tracking-wide">Evento destacado</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-poppins mb-1">{evento.titulo}</h2>
              <p className="text-white/80 text-sm mb-3 max-w-xl">{evento.descripcion}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{evento.fechaDisplay}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{evento.hora} hs</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{evento.ubicacion}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Notificaciones de eventos */}
        <div className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold font-poppins flex items-center gap-2 mb-1">
                <Bell className="w-4 h-4 text-primario" />
                Eventos
              </h3>
              <p className="text-sm text-gray-500">Recibí un aviso cuando un evento esté por comenzar, o cuando se agregue uno nuevo a la agenda.</p>
            </div>
            <button
              onClick={activarNotif}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                notifActiva
                  ? 'bg-secundario/10 text-secundario border border-secundario/30'
                  : 'bg-primario text-white hover:bg-primario-oscuro shadow-sm'
              }`}
            >
              {notifActiva ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              {notifActiva ? 'Activado' : 'Activar'}
            </button>
          </div>
          {notifActiva && (
            <div className="mt-3 flex items-center gap-2 bg-secundario/5 border border-secundario/20 rounded p-3">
              <CheckCircle className="w-4 h-4 text-secundario shrink-0" />
              <p className="text-sm text-secundario-oscuro">Te avisaremos de eventos próximos y nuevos en la agenda de Baradero.</p>
            </div>
          )}
          {avisoEventos?.mensaje && (
            <div className="mt-3 flex items-center gap-2 bg-acento/10 border border-acento/30 rounded p-3">
              <Bell className="w-4 h-4 text-amber-900 shrink-0" />
              <p className="text-sm text-amber-900">{avisoEventos.mensaje}</p>
            </div>
          )}
        </div>

        {/* Próximos eventos */}
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-bold font-poppins flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-primario" /> Próximos Eventos
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatActiva(cat)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    catActiva === cat
                      ? 'bg-primario-oscuro text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primario hover:text-primario-oscuro'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {eventosFiltrados.map(evento => (
              <div key={evento.id} className="card overflow-hidden group">
                <div className="h-40 relative overflow-hidden">
                  {evento.imagenData || evento.imagen ? (
                    <img
                      src={evento.imagenData || evento.imagen}
                      alt={evento.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white"
                      style={{ background: `linear-gradient(135deg, ${evento.color}, ${evento.color}99)` }}
                    >
                      <Calendar className="w-16 h-16 opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white text-primario-oscuro text-xs font-bold font-poppins px-2 py-1 rounded-sm">
                    {evento.fechaDisplay}
                  </div>
                </div>
                <div className="px-3.5 py-3">
                  <span className={`badge text-xs mb-1.5 ${categoriaBadgeColor[evento.categoria] || 'bg-gray-100 text-gray-600'}`}>
                    {evento.categoria}
                  </span>
                  <h3 className="font-bold font-poppins text-gray-800 mb-1 group-hover:text-primario-oscuro transition-colors">
                    {evento.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{evento.descripcion}</p>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primario" />
                      {evento.hora} hs
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-secundario" />
                      {evento.ubicacion}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {eventosFiltrados.length === 0 && (
            <EstadoVacio texto="No hay eventos en esta categoría por ahora." />
          )}
        </div>


      </div>
    </div>
  )
}
