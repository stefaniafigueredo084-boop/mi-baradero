import { useEffect, useMemo, useRef, useState } from 'react'
import { Bus, MapPin, Clock, Users, CheckCircle, Navigation, Bell, BellOff, AlertTriangle, Info, Ticket } from 'lucide-react'
import { useCombiSimulation } from '../hooks/useCombiSimulation'
import { useCombiEnVivo } from '../hooks/useCombiEnVivo'
import { useColeccion } from '../hooks/useColeccion'
import { useViaje } from '../hooks/useViaje'
import { useHorariosCombi } from '../hooks/useHorariosCombi'
import { paradas, alertasCombi as alertasFijas } from '../data/combiData'
import MiPaseSection from '../components/combi/MiPaseSection'
import { pedirPermisoNotificacion, mostrarNotificacion, saludar } from '../utils/notificaciones'

export default function CombiMunicipal() {
  const simulacion = useCombiSimulation()
  const enVivo = useCombiEnVivo()
  const { estadoActual, posicion, progreso } = enVivo || simulacion

  const [notifActiva, setNotifActiva] = useState(false)

  // Notificación cuando un trabajador mueve la combi de posición.
  const ultimaParadaId = useRef(enVivo?.paradaId)
  useEffect(() => {
    if (!enVivo) return
    if (ultimaParadaId.current === undefined) {
      ultimaParadaId.current = enVivo.paradaId
      return
    }
    if (enVivo.paradaId !== ultimaParadaId.current) {
      ultimaParadaId.current = enVivo.paradaId
      if (notifActiva) {
        mostrarNotificacion('🚌 Mi Baradero — Combi Municipal', {
          body: saludar(`${enVivo.estadoActual}. ¡Prepará tu pasaje!`),
          icon: '/logo-mibaradero.png',
        }, 'combi')
      }
    }
  }, [enVivo, notifActiva])

  const activarNotif = async () => {
    if (notifActiva) {
      setNotifActiva(false)
      return
    }
    const permiso = await pedirPermisoNotificacion()
    if (permiso === 'granted') {
      setNotifActiva(true)
      mostrarNotificacion('🚌 Mi Baradero — Combi Municipal', {
        body: saludar('Te avisaremos cuando la combi cambie de posición.'),
        icon: '/logo-mibaradero.png',
      }, 'combi')
    }
  }

  // Horarios y alertas cargados desde el panel de trabajadores, combinados
  // con los datos fijos del sitio.
  const horarios = useHorariosCombi()
  const { items: alertasLive } = useColeccion('alertasCombi')
  const alertasCombi = useMemo(() => [
    ...alertasLive,
    ...alertasFijas.filter(a => !alertasLive.some(la => la.idOriginal === a.id)),
  ], [alertasLive])

  // Notificación cuando se publica una alerta nueva.
  const ultimaAlertaId = useRef(undefined)
  useEffect(() => {
    const ultima = alertasLive[0]
    if (ultimaAlertaId.current === undefined) {
      ultimaAlertaId.current = ultima?.id ?? null
      return
    }
    if (ultima && ultima.id !== ultimaAlertaId.current) {
      ultimaAlertaId.current = ultima.id
      if (notifActiva) {
        mostrarNotificacion('🚌 Mi Baradero — Combi Municipal', {
          body: saludar(ultima.mensaje),
          icon: '/logo-mibaradero.png',
        }, 'combi')
      }
    }
  }, [alertasLive, notifActiva])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-verde to-verde-oscuro text-white py-10 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4 flex-wrap sm:flex-nowrap">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Bus className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-poppins">Combi Municipal</h1>
            <p className="text-white/80 text-sm sm:text-base">Ruta Alsina · Portela · Baradero</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* Estado en tiempo real */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <Navigation className="w-6 h-6 text-verde" />
            <h2 className="text-xl font-bold font-poppins">Seguimiento en Tiempo Real</h2>
            <span className="badge bg-verde/10 text-verde">
              <span className="w-2 h-2 rounded-full bg-verde animate-pulse inline-block mr-1" />
              En vivo
            </span>
            <button
              onClick={activarNotif}
              className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                notifActiva ? 'bg-verde/10 text-verde border border-verde/30' : 'bg-verde text-white hover:bg-verde-oscuro shadow-sm'
              }`}
            >
              {notifActiva ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              {notifActiva ? 'Notificaciones activadas' : 'Avisame cuando se mueva'}
            </button>
          </div>

          {/* Mapa simulado */}
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-gray-200 h-64 overflow-hidden mb-5">
            {/* Ruta SVG */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points="15,50 25,45 35,38 55,50 75,65"
                fill="none"
                stroke="#1B8E3E"
                strokeWidth="0.8"
                strokeDasharray="2,1"
                opacity="0.5"
              />
            </svg>

            {/* Paradas */}
            {paradas.map(p => (
              <div
                key={p.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.posX}%`, top: `${p.posY}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-white border-2 border-verde shadow-md flex items-center justify-center text-sm">
                  {p.icono}
                </div>
                <span className="absolute top-9 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap bg-white/80 px-1.5 py-0.5 rounded-md">
                  {p.nombre}
                </span>
              </div>
            ))}

            {/* Combi */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 z-10"
              style={{ left: `${posicion.x}%`, top: `${posicion.y}%` }}
            >
              <div className="w-10 h-10 rounded-full bg-verde shadow-lg flex items-center justify-center animate-bounce-soft">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-2 rounded-full bg-verde/20 marker-pulse" />
            </div>

            <div className="absolute top-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-lg">
              Mapa simulado
            </div>
          </div>

          {/* Estado actual */}
          <div className="bg-verde/5 border border-verde/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-verde flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-verde-oscuro">{estadoActual}</p>
              <p className="text-sm text-gray-500">
                {enVivo ? 'Posición confirmada por el municipio' : 'Actualización automática cada 2.5 segundos'}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400">Recorrido</p>
              <p className="font-bold text-verde">{progreso}%</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-3 bg-gray-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-verde to-verde-oscuro h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Alertas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-poppins flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" /> Alertas y Demoras
            </h2>
            <span className="badge bg-orange-100 text-orange-600 text-xs font-semibold">
              {alertasCombi.filter(a => a.tipo === 'demora').length} demoras activas
            </span>
          </div>
          <div className="space-y-3">
            {alertasCombi.map(alerta => {
              const estilos = {
                demora:  { bg: 'bg-red-50 border-red-200',    icono: <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />, badge: 'bg-red-100 text-red-600',    label: 'Demora' },
                atiempo: { bg: 'bg-green-50 border-green-200', icono: <CheckCircle   className="w-5 h-5 text-verde shrink-0" />,   badge: 'bg-verde/10 text-verde',    label: 'A tiempo' },
                aviso:   { bg: 'bg-blue-50 border-blue-200',   icono: <Info          className="w-5 h-5 text-azul shrink-0" />,    badge: 'bg-azul/10 text-azul',      label: 'Aviso' },
              }[alerta.tipo]

              return (
                <div key={alerta.id} className={`border rounded-2xl p-4 flex items-start gap-3 ${estilos.bg}`}>
                  {estilos.icono}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`badge text-xs font-bold px-2 py-0.5 rounded-full ${estilos.badge}`}>
                        {estilos.label}
                      </span>
                      <span className="text-xs font-semibold text-gray-600">Combi {alerta.horario} hs</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{alerta.mensaje}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 mt-0.5">{alerta.hora} hs</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Paradas */}
        <div>
          <h2 className="text-xl font-bold font-poppins mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-verde" /> Paradas Disponibles
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {paradas.map(p => (
              <div key={p.id} className="card p-5 text-center hover:border-verde hover:border-2 cursor-pointer transition-all">
                <div className="text-3xl mb-2">{p.icono}</div>
                <h3 className="font-semibold font-poppins text-gray-800 text-sm">{p.nombre}</h3>
                <p className="text-xs text-gray-500 mt-1">{p.descripcion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Horarios */}
        <div>
          <h2 className="text-xl font-bold font-poppins mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-azul" /> Horarios del Día
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {horarios.map(h => (
              <div key={h.id} className={`card p-4 border-l-4 ${h.disponibles === 0 ? 'border-red-400 opacity-60' : 'border-verde'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-verde-oscuro">{h.salida}</span>
                  {h.disponibles === 0
                    ? <span className="badge bg-red-100 text-red-600 text-xs">Sin lugares</span>
                    : <span className="badge bg-verde/10 text-verde text-xs">{h.disponibles} lugares</span>
                  }
                </div>
                <p className="text-xs text-gray-500">{h.origen} → {h.destino}</p>
                <p className="text-xs text-gray-400">Llega: {h.llegada}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Users className="w-3 h-3 text-gray-400" />
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-verde h-1.5 rounded-full"
                      style={{ width: `${100 - (h.disponibles / 15 * 100)}%` }}
                    />
                  </div>
                </div>
                <LugaresConPase horario={h} />
              </div>
            ))}
          </div>
        </div>

        {/* Mi Pase (QR) */}
        <MiPaseSection />

      </div>
    </div>
  )
}

// Lugares que quedan hoy contando embarques reales confirmados con el
// pase QR (independiente del contador manual "disponibles" de arriba,
// que sigue siendo el que usa la compra de pasaje por WhatsApp).
function LugaresConPase({ horario }) {
  const viaje = useViaje(horario)
  if (!viaje || viaje.cargando) return null
  const { libres, prioritarios, liberado } = viaje.asientos
  const hayReservados = prioritarios.discapacidad.reservados > 0 || prioritarios.jubilado.reservados > 0

  return (
    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 flex-wrap">
      <Ticket className="w-3 h-3 text-azul shrink-0" />
      <span className="text-[11px] text-gray-500">{libres} con pase QR</span>
      {!liberado && hayReservados && (
        <span className="text-[11px] text-gray-400">
          (♿ {prioritarios.discapacidad.libres}/{prioritarios.discapacidad.reservados} · 👴 {prioritarios.jubilado.libres}/{prioritarios.jubilado.reservados})
        </span>
      )}
    </div>
  )
}
