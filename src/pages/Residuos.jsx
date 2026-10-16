import { useState, useEffect, useRef, useMemo } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { Trash2, Bell, BellOff, Truck, MapPin, Lightbulb, CheckCircle, XCircle, AlertTriangle, Navigation, Calendar, Recycle } from 'lucide-react'
import { calendario as calendarioFijo, zonas as zonasFijas, estadosCamion, consejos as consejosFijos } from '../data/residuosData'
import { db } from '../firebase'
import { useColeccion } from '../hooks/useColeccion'
import { useAviso } from '../hooks/useAviso'
import { pedirPermisoNotificacion, mostrarNotificacion, saludar } from '../utils/notificaciones'
import AcordeonItem from '../components/panel/Acordeon'
import { iconoConsejo } from '../data/iconosConsejo'

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
          mostrarNotificacion('Mi Baradero — Camión cerca', {
            body: saludar('Según el recorrido estimado, el camión de residuos estaría a menos de 500 metros. ¡Sacá las bolsas!'),
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
  const extraerRef = useRef(extraer)
  extraerRef.current = extraer
  useEffect(() => {
    return onSnapshot(doc(db, 'config', nombreDoc), snap => {
      if (snap.exists()) setValor(extraerRef.current(snap.data()))
    }, () => {
      // Sin conexión: se queda con el valor por defecto.
    })
  }, [nombreDoc])
  return valor
}

const colorMap = {
  verde: { bg: 'bg-secundario/10', border: 'border-secundario/30', text: 'text-secundario', icon: 'bg-secundario' },
  azul: { bg: 'bg-primario/10', border: 'border-primario/30', text: 'text-primario', icon: 'bg-primario' },
  gris: { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-400', icon: 'bg-gray-300' },
}

// Ícono de cada día según el tipo de recolección (el color que ya viene
// en los datos).
const ICONO_DIA = { verde: Trash2, azul: Recycle, gris: XCircle }

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
    title: 'Mi Baradero — Recolección de Residuos',
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
      <div className="bg-primario text-white py-5 sm:py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-secundario text-tinta flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-poppins">Recolección de Residuos</h1>
            <p className="text-white/80 text-sm sm:text-base">Calendario, alertas y recorrido estimado del camión</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-6">

        {/* Estado camión + notificaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`card p-4 border-l-4 ${estadoCamion === 'EN_SERVICIO' ? 'border-secundario' : 'border-red-400'} lg:col-span-1`}>
            <div className="flex items-center gap-3 mb-2">
              <Truck className={`w-6 h-6 ${estadoCamion === 'EN_SERVICIO' ? 'text-secundario' : 'text-red-400'}`} />
              <h3 className="font-bold font-poppins">Estado del Camión</h3>
            </div>
            <div className="flex items-center gap-2">
              {estadoCamion === 'EN_SERVICIO'
                ? <CheckCircle className="w-5 h-5 text-secundario" />
                : <XCircle className="w-5 h-5 text-red-400" />
              }
              <span className={`font-semibold ${estadoCamion === 'EN_SERVICIO' ? 'text-secundario' : 'text-red-500'}`}>
                {estadosCamion[estadoCamion]?.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{estadosCamion[estadoCamion]?.descripcion}</p>
          </div>

          <div className="card p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold font-poppins flex items-center gap-2">
                  <Bell className="w-5 h-5 text-acento" />
                  Notificaciones de Recolección
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {notifActiva
                    ? 'Recibirás alertas antes de la recolección en tu zona.'
                    : 'Activá las notificaciones para recibir alertas en tu zona.'}
                </p>
              </div>
              <button
                onClick={() => setNotifActiva(!notifActiva)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  notifActiva
                    ? 'bg-secundario/10 text-secundario border border-secundario/30 hover:bg-secundario/20'
                    : 'btn-acento'
                }`}
              >
                {notifActiva ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                {notifActiva ? 'Desactivar' : 'Activar notificaciones'}
              </button>
            </div>
            {notifActiva && (
              <div className="mt-3 bg-secundario/5 border border-secundario/20 rounded p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secundario shrink-0" />
                <p className="text-sm text-secundario-oscuro">Notificaciones activadas. Te avisaremos 30 minutos antes de la recolección.</p>
              </div>
            )}
            {avisoResiduos?.mensaje && (
              <div className="mt-3 bg-acento/10 border border-acento/30 rounded p-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-900 shrink-0" />
                <p className="text-sm text-amber-900">{avisoResiduos.mensaje}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recorrido estimado del camión: es una estimación según el
            recorrido habitual (no hay GPS en el camión), y así se dice. */}
        <div className={`card p-4 border-2 transition-all duration-300 ${cerca ? 'border-red-400 shadow-red-100 shadow-lg' : gpsActivo ? 'border-primario/40' : 'border-transparent'}`}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold font-poppins flex items-center gap-2">
                <Navigation className={`w-5 h-5 ${gpsActivo ? 'text-primario' : 'text-gray-400'}`} />
                Recorrido estimado del camión
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Una estimación de cuánto falta para que pase, según el recorrido habitual. No es la ubicación real del camión.
              </p>
            </div>
            <button
              onClick={activarGps}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                gpsActivo
                  ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                  : 'bg-primario text-white hover:bg-primario-oscuro shadow-md'
              }`}
            >
              <Navigation className="w-4 h-4" />
              {gpsActivo ? 'Ocultar' : 'Ver recorrido estimado'}
            </button>
          </div>

          {gpsActivo ? (
            <div className="space-y-4">
              {/* Distancia */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Distancia estimada</span>
                <span className={`text-2xl font-bold font-poppins ${cerca ? 'text-red-500' : 'text-primario'}`}>
                  {distancia === 0 ? 'Debería estar pasando' : `≈ ${distancia} m`}
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${cerca ? 'bg-red-400' : 'bg-primario'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Iconos de ruta */}
              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Camión</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Tu casa</span>
              </div>

              {cerca && (
                <div className="bg-red-50 border border-red-200 rounded p-4 flex items-center gap-3">
                  <Truck className="w-7 h-7 text-red-500 shrink-0" />
                  <div>
                    <p className="font-bold text-red-600">El camión debería estar cerca</p>
                    <p className="text-sm text-red-500">Según el recorrido estimado. Sacá las bolsas al cordón.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-300 flex-col gap-2">
              <Truck className="w-12 h-12" />
              <p className="text-sm text-gray-400">Tocá "Ver recorrido estimado" para saber cuánto falta, aproximadamente</p>
            </div>
          )}
        </div>

        {/* Calendario semanal — colapsado, como en el panel de trabajadores */}
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
              const IconoDia = ICONO_DIA[dia.color] || XCircle
              return (
                <div
                  key={dia.dia}
                  className={`card p-4 border-2 text-center ${esHoy ? 'border-acento ring-2 ring-acento/30' : c.border} ${c.bg} transition-all`}
                >
                  {esHoy && <span className="inline-block bg-acento text-tinta text-xs font-bold px-2 py-0.5 rounded mb-1">HOY</span>}
                  <p className="text-xs font-semibold text-gray-600 mb-2">{dia.dia}</p>
                  <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center mx-auto mb-2`}>
                    <IconoDia className="w-5 h-5 text-white" />
                  </div>
                  <p className={`text-xs font-medium ${c.text}`}>{dia.tipo}</p>
                </div>
              )
            })}
          </div>
        </AcordeonItem>

        {/* Alertas por zona */}
        <div>
          <h2 className="text-xl font-bold font-poppins mb-5 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primario" /> Alerta por Zona
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zonas.map(zona => (
              <button
                key={zona.id}
                onClick={() => setZonaSeleccionada(zonaSeleccionada?.id === zona.id ? null : zona)}
                className={`card p-4 text-left transition-all border-2 ${
                  zonaSeleccionada?.id === zona.id ? 'border-primario ring-2 ring-primario/20' : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold font-poppins text-gray-800">{zona.nombre}</h3>
                  <span className="badge bg-primario/10 text-primario text-xs">{zona.horario}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-acento" />
                  <p className="text-sm text-gray-600">
                    El camión estará en tu zona en{' '}
                    <span className="font-bold text-amber-900">{zona.proximaRecoleccion} min</span>
                  </p>
                </div>
                {zonaSeleccionada?.id === zona.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-primario font-medium flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 shrink-0" /> Zona seleccionada — Recibirás alertas aquí</p>
                  </div>
                )}
              </button>
            ))}
          </div>

          {zonaSeleccionada && (
            <div className="mt-4 bg-acento/10 border border-acento/30 rounded p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-acento flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  El camión estará en {zonaSeleccionada.nombre} en {zonaSeleccionada.proximaRecoleccion} minutos
                </p>
                <p className="text-sm text-gray-600 mt-0.5">Horario de recolección: {zonaSeleccionada.horario}</p>
                <p className="text-sm text-amber-900 font-medium mt-1">¡Recordá sacar las bolsas al cordón!</p>
              </div>
            </div>
          )}
        </div>

        {/* Consejos — colapsado, como en el panel de trabajadores */}
        <AcordeonItem
          icono={Lightbulb}
          color="amarillo"
          titulo="Consejos de Reciclado"
          descripcion="Tips para separar mejor tus residuos"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {consejos.map(c => {
              const IconoConsejo = iconoConsejo(c.icono)
              return (
              <div key={c.titulo} className="card p-4">
                <div className="w-12 h-12 rounded-2xl bg-acento/25 text-amber-900 flex items-center justify-center mb-3">
                  <IconoConsejo className="w-6 h-6" />
                </div>
                <h3 className="font-semibold font-poppins text-gray-800 mb-1">{c.titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{c.descripcion}</p>
              </div>
              )
            })}
          </div>
        </AcordeonItem>

      </div>
    </div>
  )
}
