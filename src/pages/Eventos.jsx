import { useMemo, useState } from 'react'
import { Calendar, MapPin, Clock, Filter, Star, Bell, BellOff, CheckCircle, Plus } from 'lucide-react'
import { eventos as eventosFijos, categorias as categoriasBase } from '../data/eventosData'
import { useColeccion } from '../hooks/useColeccion'
import { useAviso } from '../hooks/useAviso'
import { pedirPermisoNotificacion, mostrarNotificacion } from '../utils/notificaciones'

const categoriaBadgeColor = {
  'Festival': 'bg-verde/10 text-verde',
  'Cultura': 'bg-azul/10 text-azul',
  'Comercio': 'bg-amarillo/20 text-yellow-700',
  'Deportes': 'bg-purple-100 text-purple-700',
  'Arte': 'bg-pink-100 text-pink-700',
  'Obras Públicas': 'bg-verde/10 text-verde',
  'Educación': 'bg-azul/10 text-azul',
  'Turismo': 'bg-teal-100 text-teal-700',
  'Salud': 'bg-red-100 text-red-700',
}

export default function Eventos() {
  const [catActiva, setCatActiva] = useState('Todos')
  const [notifActiva, setNotifActiva] = useState(false)
  const [notifNuevos, setNotifNuevos] = useState(false)

  // Eventos cargados desde el panel de trabajadores (Firestore), seguidos
  // de los eventos fijos del sitio como respaldo.
  const { items: eventosLive } = useColeccion('eventos')
  const eventos = useMemo(() => [...eventosLive, ...eventosFijos], [eventosLive])

  const categorias = useMemo(() => {
    const nuevas = [...new Set(eventos.map(e => e.categoria).filter(Boolean))].filter(c => !categoriasBase.includes(c))
    return [...categoriasBase, ...nuevas]
  }, [eventos])

  const avisoEventos = useAviso('avisoEventos', notifActiva, aviso => ({
    title: '🎉 Mi Baradero — Eventos',
    body: aviso.mensaje,
  }))
  const avisoNuevosEventos = useAviso('avisoEventos', notifNuevos, () => ({
    title: '📅 Mi Baradero — Nuevos eventos',
    body: 'Se agregó un nuevo evento a la agenda.',
  }))

  const activarNotif = async () => {
    if (notifActiva) {
      setNotifActiva(false)
      return
    }
    const permiso = await pedirPermisoNotificacion()
    if (permiso === 'granted') {
      setNotifActiva(true)
      mostrarNotificacion('🎉 Mi Baradero — Eventos', {
        body: 'Te avisaremos cuando se acerque un evento en Baradero.',
        icon: '/logo-mibaradero.png',
      })
    }
  }

  const activarNotifNuevos = async () => {
    if (notifNuevos) {
      setNotifNuevos(false)
      return
    }
    const permiso = await pedirPermisoNotificacion()
    if (permiso === 'granted') {
      setNotifNuevos(true)
      mostrarNotificacion('📅 Mi Baradero — Nuevos eventos', {
        body: 'Te avisaremos cuando se agregue un nuevo evento a la agenda.',
        icon: '/logo-mibaradero.png',
      })
    }
  }

  const eventosFiltrados = catActiva === 'Todos'
    ? eventos
    : eventos.filter(e => e.categoria === catActiva)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero verde oscuro con logo */}
      <div className="bg-gradient-to-br from-verde-oscuro to-[#064020] text-white py-10 sm:py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Calendar className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-poppins">Eventos y Noticias</h1>
              <p className="text-green-200 text-sm sm:text-base">Toda la agenda y novedades de Baradero</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mt-6">
            {[
              { label: 'Eventos este mes', value: String(eventos.length) },
              { label: 'Categorías', value: String(categorias.length - 1) },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold font-poppins text-amarillo">{s.value}</p>
                <p className="text-xs text-green-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* Evento destacado */}
        {eventos.filter(e => e.destacado).slice(0, 1).map(evento => (
          <div key={evento.id} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-verde to-verde-oscuro text-white p-8 shadow-xl">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-amarillo fill-amarillo" />
                <span className="badge bg-amarillo/20 text-amarillo text-sm">Evento Destacado</span>
              </div>
              <h2 className="text-3xl font-bold font-poppins mb-2">{evento.titulo}</h2>
              <p className="text-white/80 mb-4 max-w-xl">{evento.descripcion}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{evento.fechaDisplay}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{evento.hora} hs</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{evento.ubicacion}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Notificaciones de eventos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold font-poppins flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4 text-verde" />
                  Eventos próximos
                </h3>
                <p className="text-sm text-gray-500">Recibí una notificación cuando un evento esté por comenzar.</p>
              </div>
              <button
                onClick={activarNotif}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  notifActiva
                    ? 'bg-verde/10 text-verde border border-verde/30'
                    : 'bg-verde text-white hover:bg-verde-oscuro shadow-sm'
                }`}
              >
                {notifActiva ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                {notifActiva ? 'Activado' : 'Activar'}
              </button>
            </div>
            {notifActiva && (
              <div className="mt-3 flex items-center gap-2 bg-verde/5 border border-verde/20 rounded-xl p-3">
                <CheckCircle className="w-4 h-4 text-verde shrink-0" />
                <p className="text-xs text-verde-oscuro">Te avisaremos antes de cada evento de Baradero.</p>
              </div>
            )}
            {avisoEventos?.mensaje && (
              <div className="mt-3 flex items-center gap-2 bg-amarillo/10 border border-amarillo/30 rounded-xl p-3">
                <Bell className="w-4 h-4 text-yellow-700 shrink-0" />
                <p className="text-xs text-yellow-800">{avisoEventos.mensaje}</p>
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold font-poppins flex items-center gap-2 mb-1">
                  <Plus className="w-4 h-4 text-azul" />
                  Nuevos eventos
                </h3>
                <p className="text-sm text-gray-500">Enterarte cuando se agregue un nuevo evento a la agenda.</p>
              </div>
              <button
                onClick={activarNotifNuevos}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  notifNuevos
                    ? 'bg-azul/10 text-azul border border-azul/30'
                    : 'bg-azul text-white hover:bg-azul-oscuro shadow-sm'
                }`}
              >
                {notifNuevos ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                {notifNuevos ? 'Activado' : 'Activar'}
              </button>
            </div>
            {notifNuevos && (
              <div className="mt-3 flex items-center gap-2 bg-azul/5 border border-azul/20 rounded-xl p-3">
                <CheckCircle className="w-4 h-4 text-azul shrink-0" />
                <p className="text-xs text-azul-oscuro">Te avisaremos cuando haya un evento nuevo en Baradero.</p>
              </div>
            )}
          </div>
        </div>

        {/* Próximos eventos */}
        <div>
          <div className="mb-5">
            <h2 className="text-xl font-bold font-poppins flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-verde" /> Próximos Eventos
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatActiva(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    catActiva === cat
                      ? 'bg-verde text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-verde hover:text-verde'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {eventosFiltrados.map(evento => (
              <div key={evento.id} className="card overflow-hidden group">
                <div className="h-48 relative overflow-hidden">
                  {evento.imagenData || evento.imagen ? (
                    <img
                      src={evento.imagenData || evento.imagen}
                      alt={evento.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white"
                      style={{ background: `linear-gradient(135deg, ${evento.color}, ${evento.color}99)` }}
                    >
                      <Calendar className="w-16 h-16 opacity-30" />
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {evento.fechaDisplay}
                  </div>
                </div>
                <div className="p-5">
                  <span className={`badge text-xs mb-2 ${categoriaBadgeColor[evento.categoria] || 'bg-gray-100 text-gray-600'}`}>
                    {evento.categoria}
                  </span>
                  <h3 className="font-bold font-poppins text-gray-800 mb-2 group-hover:text-verde transition-colors">
                    {evento.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{evento.descripcion}</p>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-verde" />
                      {evento.hora} hs
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-azul" />
                      {evento.ubicacion}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {eventosFiltrados.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay eventos en esta categoría</p>
            </div>
          )}
        </div>


      </div>
    </div>
  )
}
