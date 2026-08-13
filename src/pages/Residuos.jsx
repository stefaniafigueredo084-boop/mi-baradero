import { useState, useEffect, useRef, useMemo } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { Trash2, Bell, BellOff, Truck, MapPin, Lightbulb, CheckCircle, XCircle, AlertTriangle, Navigation, Calendar } from 'lucide-react'
import { calendario as calendarioFijo, zonas as zonasFijas, estadosCamion, consejos as consejosFijos } from '../data/residuosData'
import { db } from '../firebase'
import { useColeccion } from '../hooks/useColeccion'
import { useAviso } from '../hooks/useAviso'
import { pedirPermisoNotificacion, mostrarNotificacion, saludar } from '../utils/notificaciones'
import AcordeonItem, { Acordeon } from '../components/panel/Acordeon'

function useGpsCamion(activo) {
  const [distancia, setDistancia] = useState(2400)
  const [notifEnviada, setNotifEnviada] = useState(false)
  const intervalo = useRef(null)

  useEffect(() => {
    if (!activo) {
      clearInterval(intervalo.current)
      setDistancia(2400)
      setNotifEnviada(false)
      return
    }
    intervalo.current = setInterval(() => {
      setDistancia(prev => {
        const nueva = prev - 80
        if (nueva <= 500 && !notifEnviada) {
          mostrarNotificacion('🚛 Mi Baradero — Camión cerca', {
            body: saludar('El camión de residuos está a menos de 500 metros. ¡Sacá las bolsas!'),
            icon: '/logo-mibaradero.png',
          }, 'basura')
          setNotifEnviada(true)
        }
        return nueva <= 0 ? 0 : nueva
      })
    }, 1000)
    return () => clearInterval(intervalo.current)
  }, [activo, notifEnviada])

  return distancia
}

// Estado del camión y calendario, publicados por el panel de trabajadores
// en documentos config/estadoCamion y config/calendarioResiduos.
function useDocConfig(nombreDoc, valorInicial, extraer) {
  const [valor, setValor] = useState(valorInicial)
  useEffect(() => {
    return onSnapshot(doc(db, 'config', nombreDoc), snap => {
      if (snap.exists()) setValor(extraer(snap.data()))
    })
  }, [nombreDoc])
  return valor
}

const colorMap = {
  verde: { bg: 'bg-verde/10', border: 'border-verde/30', text: 'text-verde', icon: 'bg-verde' },
  azul: { bg: 'bg-azul/10', border: 'border-azul/30', text: 'text-azul', icon: 'bg-azul' },
  gris: { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-400', icon: 'bg-gray-300' },
}

export default function Residuos() {
  const [notifActiva, setNotifActiva] = useState(false)
  const [gpsActivo, setGpsActivo] = useState(false)
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null)
  const distancia = useGpsCamion(gpsActivo)

  const estadoCamion = useDocConfig('estadoCamion', 'EN_SERVICIO', d => d.valor)
  const calendario = useDocConfig('calendarioResiduos', calendarioFijo, d => d.dias)

  const { items: zonasLive } = useColeccion('zonasResiduos')
  const zonas = useMemo(() => [
    ...zonasFijas.filter(z => !zonasLive.some(lz => lz.idOriginal === z.id)),
    ...zonasLive,
  ], [zonasLive])

  const { items: consejosLive } = useColeccion('consejosResiduos')
  const consejos = useMemo(() => [
    ...consejosFijos.filter(c => !consejosLive.some(lc => lc.idOriginal === c.titulo)),
    ...consejosLive,
  ], [consejosLive])

  const avisoResiduos = useAviso('avisoResiduos', notifActiva, aviso => ({
    title: '🚛 Mi Baradero — Recolección de Residuos',
    body: saludar(aviso.mensaje),
  }), 'basura')

  const hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long' })
  const hoyCapitalizado = hoy.charAt(0).toUpperCase() + hoy.slice(1)

  const activarGps = async () => {
    if (!gpsActivo) {
      await pedirPermisoNotificacion()
      setGpsActivo(true)
    } else {
      setGpsActivo(false)
    }
  }

  const pct = Math.max(0, Math.min(100, ((2400 - distancia) / 2400) * 100))
  const cerca = distancia <= 500

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero amarillo */}
      <div className="bg-amarillo text-gray-900 dark:text-white py-10 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4 flex-wrap sm:flex-nowrap">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/10 flex items-center justify-center shrink-0">
            <Trash2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-poppins">Recolección de Residuos</h1>
            <p className="text-gray-700 dark:text-white/80 text-sm sm:text-base">Calendario, alertas y seguimiento GPS del camión</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        <Acordeon>
          <AcordeonItem
            icono={Truck}
            color={estadoCamion === 'EN_SERVICIO' ? 'verde' : 'amarillo'}
            titulo="Estado del Camión"
            descripcion={estadosCamion[estadoCamion]?.label}
          >
            <div className="flex items-center gap-2">
              {estadoCamion === 'EN_SERVICIO'
                ? <CheckCircle className="w-5 h-5 text-verde" />
                : <XCircle className="w-5 h-5 text-red-400" />
              }
              <span className={`font-semibold ${estadoCamion === 'EN_SERVICIO' ? 'text-verde' : 'text-red-500'}`}>
                {estadosCamion[estadoCamion]?.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{estadosCamion[estadoCamion]?.descripcion}</p>
          </AcordeonItem>

          <AcordeonItem
            icono={Bell}
            color="amarillo"
            titulo="Notificaciones de Recolección"
            descripcion={notifActiva ? 'Activadas para tu zona' : 'Activá alertas antes de que pase el camión'}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                {notifActiva
                  ? 'Recibirás alertas antes de la recolección en tu zona.'
                  : 'Activá las notificaciones para recibir alertas en tu zona.'}
              </p>
              <button
                onClick={() => setNotifActiva(!notifActiva)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shrink-0 ${
                  notifActiva
                    ? 'bg-verde/10 text-verde border border-verde/30 hover:bg-verde/20'
                    : 'btn-amarillo'
                }`}
              >
                {notifActiva ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                {notifActiva ? 'Desactivar' : 'Activar notificaciones'}
              </button>
            </div>
            {notifActiva && (
              <div className="mt-3 bg-verde/5 border border-verde/20 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-verde shrink-0" />
                <p className="text-sm text-verde-oscuro">Notificaciones activadas. Te avisaremos 30 minutos antes de la recolección.</p>
              </div>
            )}
            {avisoResiduos?.mensaje && (
              <div className="mt-3 bg-amarillo/10 border border-amarillo/30 rounded-xl p-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-yellow-700 shrink-0" />
                <p className="text-sm text-yellow-800">{avisoResiduos.mensaje}</p>
              </div>
            )}
          </AcordeonItem>

          <AcordeonItem
            icono={Navigation}
            color="verde"
            titulo="Seguimiento GPS del Camión"
            descripcion="Ubicación en tiempo real, a menos de 500m te avisamos"
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={activarGps}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  gpsActivo
                    ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                    : 'bg-verde text-white hover:bg-verde-oscuro shadow-md'
                }`}
              >
                <Navigation className="w-4 h-4" />
                {gpsActivo ? 'Detener seguimiento' : 'Activar GPS'}
              </button>
            </div>

            {gpsActivo ? (
              <div className="space-y-4">
                {/* Distancia */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Distancia del camión</span>
                  <span className={`text-2xl font-bold font-poppins ${cerca ? 'text-red-500' : 'text-verde'}`}>
                    {distancia === 0 ? '¡Llegó!' : `${distancia} m`}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${cerca ? 'bg-red-400' : 'bg-verde'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Iconos de ruta */}
                <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                  <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Camión</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Tu casa</span>
                </div>

                {cerca && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">🚛</span>
                    <div>
                      <p className="font-bold text-red-600">¡El camión está muy cerca!</p>
                      <p className="text-sm text-red-500">Sacá las bolsas al cordón ahora.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-300 flex-col gap-2">
                <Truck className="w-12 h-12" />
                <p className="text-sm text-gray-400">Activá el GPS para ver la ubicación del camión</p>
              </div>
            )}
          </AcordeonItem>

          <AcordeonItem
            icono={Calendar}
            color="amarillo"
            titulo="Calendario Semanal"
            descripcion="Qué residuo corresponde cada día"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {calendario.map((dia) => {
                const esHoy = dia.dia === hoyCapitalizado
                const c = colorMap[dia.color]
                return (
                  <div
                    key={dia.dia}
                    className={`card p-4 border-2 text-center ${esHoy ? 'border-amarillo ring-2 ring-amarillo/30' : c.border} ${c.bg} transition-all`}
                  >
                    {esHoy && <span className="text-xs font-bold text-amarillo block mb-1">HOY</span>}
                    <p className="text-xs font-semibold text-gray-600 mb-2">{dia.dia}</p>
                    <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-lg">{dia.icono}</span>
                    </div>
                    <p className={`text-xs font-medium ${c.text}`}>{dia.tipo}</p>
                  </div>
                )
              })}
            </div>
          </AcordeonItem>

          <AcordeonItem
            icono={MapPin}
            color="verde"
            titulo="Alerta por Zona"
            descripcion="Elegí tu zona para ver cuándo pasa el camión"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {zonas.map(zona => (
                <button
                  key={zona.id}
                  onClick={() => setZonaSeleccionada(zonaSeleccionada?.id === zona.id ? null : zona)}
                  className={`card p-5 text-left transition-all border-2 ${
                    zonaSeleccionada?.id === zona.id ? 'border-verde ring-2 ring-verde/20' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold font-poppins text-gray-800">{zona.nombre}</h3>
                    <span className="badge bg-verde/10 text-verde text-xs">{zona.horario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amarillo" />
                    <p className="text-sm text-gray-600">
                      El camión estará en tu zona en{' '}
                      <span className="font-bold text-amarillo">{zona.proximaRecoleccion} min</span>
                    </p>
                  </div>
                  {zonaSeleccionada?.id === zona.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-verde font-medium">✓ Zona seleccionada — Recibirás alertas aquí</p>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {zonaSeleccionada && (
              <div className="mt-4 bg-amarillo/10 border border-amarillo/30 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amarillo flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    El camión estará en {zonaSeleccionada.nombre} en {zonaSeleccionada.proximaRecoleccion} minutos
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">Horario de recolección: {zonaSeleccionada.horario}</p>
                  <p className="text-sm text-amarillo font-medium mt-1">¡Recordá sacar las bolsas al cordón!</p>
                </div>
              </div>
            )}
          </AcordeonItem>

          <AcordeonItem
            icono={Lightbulb}
            color="amarillo"
            titulo="Consejos de Reciclado"
            descripcion="Tips para separar mejor tus residuos"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {consejos.map(c => (
                <div key={c.titulo} className="card p-5">
                  <div className="text-3xl mb-3">{c.icono}</div>
                  <h3 className="font-semibold font-poppins text-gray-800 mb-1">{c.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{c.descripcion}</p>
                </div>
              ))}
            </div>
          </AcordeonItem>
        </Acordeon>

      </div>
    </div>
  )
}
