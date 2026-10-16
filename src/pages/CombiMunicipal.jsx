import { useEffect, useMemo, useRef, useState } from 'react'
import { Bus, MapPin, Clock, Users, CheckCircle, Navigation, Bell, BellOff, AlertTriangle, Info, Ticket, Accessibility } from 'lucide-react'
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
        mostrarNotificacion('Mi Baradero — Combi Municipal', {
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
      mostrarNotificacion('Mi Baradero — Combi Municipal', {
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
        mostrarNotificacion('Mi Baradero — Combi Municipal', {
          body: saludar(ultima.mensaje),
          icon: '/logo-mibaradero.png',
        }, 'combi')
      }
    }
  }, [alertasLive, notifActiva])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primario text-white py-5 sm:py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-secundario text-tinta flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-poppins">Combi Municipal</h1>
            <p className="text-white/80 text-sm sm:text-base">Ruta Alsina · Portela · Baradero</p>
          </div>
        </div>
      </div>

      {/* Barra para saltar directo a una sección — la página tiene
          bastante contenido para leer de una sola vez, esto es solo
          para orientarse rápido, no para esconder nada (a diferencia
          del acordeón del panel de empleados, esto lo lee un vecino de
          punta a punta). */}
      <nav className="sticky top-[59px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2 grid grid-cols-5 gap-1.5 sm:flex sm:gap-2">
          {[
            { href: '#en-vivo', label: 'Recorrido' },
            { href: '#alertas', label: 'Alertas' },
            { href: '#paradas', label: 'Paradas' },
            { href: '#horarios', label: 'Horarios' },
            { href: '#mi-pase', label: 'Mi Pase' },
          ].map(s => (
            <a
              key={s.href}
              href={s.href}
              className="min-h-[44px] inline-flex items-center justify-center px-1 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-center whitespace-nowrap bg-gray-100 text-gray-600 hover:bg-primario/10 hover:text-primario-oscuro transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-6">

        {/* Estado en tiempo real */}
        <div id="en-vivo" className="card p-4 scroll-mt-32">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <Navigation className="w-6 h-6 text-primario" />
            {/* "En vivo" solo cuando un empleado marcó la parada actual;
                si no, es la simulación del recorrido y se dice "estimado". */}
            <h2 className="text-xl font-bold font-poppins">{enVivo ? 'Dónde está la combi' : 'Recorrido estimado'}</h2>
            {enVivo ? (
              <span className="badge bg-primario/10 text-primario-oscuro">
                <span className="w-2 h-2 rounded-full bg-primario animate-pulse inline-block mr-1" />
                Marcada por el municipio
              </span>
            ) : (
              <span className="badge bg-gray-100 text-gray-600">Estimado</span>
            )}
            <button
              onClick={activarNotif}
              className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                notifActiva ? 'bg-secundario/10 text-secundario border border-secundario/30' : 'bg-primario text-white hover:bg-primario-oscuro shadow-sm'
              }`}
            >
              {notifActiva ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              {notifActiva ? 'Notificaciones activadas' : 'Avisame cuando se mueva'}
            </button>
          </div>

          {/* Mapa simulado */}
          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded border border-gray-200 h-64 overflow-hidden mb-5">
            {/* Ruta SVG */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points="15,50 25,45 35,38 55,50 75,65"
                fill="none"
                stroke="#3D8B68"
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
                <div className="w-8 h-8 rounded-full bg-white border-2 border-primario shadow-md flex items-center justify-center text-primario">
                  <p.icono className="w-4 h-4" />
                </div>
                {/* max-w + truncate (en vez de whitespace-nowrap sin límite):
                    las paradas están a 20% de distancia entre sí en el mapa, así
                    que un nombre largo sin tope ("Centro de Camioneros") se comía
                    el espacio de la parada vecina en pantallas angostas. Con esto
                    nunca ocupa más ancho que el que tiene disponible, sea cual sea
                    el tamaño de pantalla; el nombre completo sigue apareciendo en
                    la tarjeta de "Paradas Disponibles" más abajo. */}
                <span className="absolute top-9 left-1/2 -translate-x-1/2 max-w-[64px] sm:max-w-[100px] truncate text-center text-xs font-medium text-gray-700 bg-white/80 px-1.5 py-0.5 rounded-md">
                  {p.nombre}
                </span>
              </div>
            ))}

            {/* Combi */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 z-10"
              style={{ left: `${posicion.x}%`, top: `${posicion.y}%` }}
            >
              <div className="w-10 h-10 rounded-full bg-primario shadow-lg flex items-center justify-center animate-bounce-soft">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-2 rounded-full bg-primario/20 marker-pulse" />
            </div>

            <div className="absolute top-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-lg">
              Mapa ilustrativo
            </div>
          </div>

          {/* Estado actual */}
          <div className="bg-primario/5 border border-primario/20 rounded p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primario flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-primario-oscuro">{estadoActual}</p>
              <p className="text-sm text-gray-500">
                {enVivo ? 'Última parada marcada por el municipio' : 'Estimado según el recorrido habitual: no es la posición real'}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400">Recorrido</p>
              <p className="font-bold text-primario">{progreso}%</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-3 bg-gray-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primario to-primario-oscuro h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Alertas */}
        <div id="alertas" className="scroll-mt-32">
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
                atiempo: { bg: 'bg-green-50 border-green-200', icono: <CheckCircle   className="w-5 h-5 text-secundario shrink-0" />,   badge: 'bg-primario/10 text-primario',    label: 'A tiempo' },
                aviso:   { bg: 'bg-emerald-50 border-emerald-200',   icono: <Info          className="w-5 h-5 text-secundario shrink-0" />,    badge: 'bg-secundario/10 text-secundario',      label: 'Aviso' },
              }[alerta.tipo]

              return (
                <div key={alerta.id} className={`border rounded p-4 flex items-start gap-3 ${estilos.bg}`}>
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
        <div id="paradas" className="scroll-mt-32">
          <h2 className="text-xl font-bold font-poppins mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primario" /> Paradas Disponibles
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {paradas.map(p => (
              <div key={p.id} className="card p-4 text-center hover:border-primario hover:border-2 cursor-pointer transition-all">
                <div className="w-12 h-12 rounded-2xl bg-primario/10 text-primario flex items-center justify-center mx-auto mb-3">
                  <p.icono className="w-6 h-6" />
                </div>
                <h3 className="font-semibold font-poppins text-gray-800 text-sm">{p.nombre}</h3>
                <p className="text-xs text-gray-500 mt-1">{p.descripcion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Horarios */}
        <div id="horarios" className="scroll-mt-32">
          <h2 className="text-xl font-bold font-poppins mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-secundario" /> Horarios del Día
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {horarios.map(h => (
              <div key={h.id} className={`card p-4 border-l-4 ${h.disponibles === 0 ? 'border-red-400 opacity-60' : 'border-primario'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-primario-oscuro">{h.salida}</span>
                  {h.disponibles === 0
                    ? <span className="badge bg-red-100 text-red-600 text-xs">Sin lugares</span>
                    : <span className="badge bg-primario/10 text-primario text-xs">{h.disponibles} lugares</span>
                  }
                </div>
                <p className="text-xs text-gray-500">{h.origen} → {h.destino}</p>
                <p className="text-xs text-gray-400">Llega: {h.llegada}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Users className="w-3 h-3 text-gray-400" />
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-primario h-1.5 rounded-full"
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
        <div id="mi-pase" className="scroll-mt-32">
          <MiPaseSection />
        </div>

      </div>
    </div>
  )
}

// Lugares que quedan hoy descontando los pasajes ya vendidos (pago
// confirmado), aunque esa gente todavía no haya subido (independiente
// del contador manual "disponibles" de arriba, que sigue siendo el que
// usa la compra de pasaje por WhatsApp).
function LugaresConPase({ horario }) {
  const viaje = useViaje(horario)
  if (!viaje || viaje.cargando) return null
  const { libresVenta: libres, prioritarios, liberado } = viaje.asientos
  const hayReservados = prioritarios.discapacidad.reservados > 0 || prioritarios.jubilado.reservados > 0

  return (
    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 flex-wrap">
      <Ticket className="w-3 h-3 text-secundario shrink-0" />
      <span className="text-xs text-gray-500">{libres} libres para comprar con pase QR</span>
      {!liberado && hayReservados && (
        <span className="text-xs text-gray-400">
          (<Accessibility className="w-3 h-3 inline -mt-0.5" aria-label="Discapacidad" /> {prioritarios.discapacidad.libres}/{prioritarios.discapacidad.reservados} · Jubilados {prioritarios.jubilado.libres}/{prioritarios.jubilado.reservados})
        </span>
      )}
    </div>
  )
}
