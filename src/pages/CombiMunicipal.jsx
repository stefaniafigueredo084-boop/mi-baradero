import { useEffect, useMemo, useRef, useState } from 'react'
import { Bus, MapPin, Clock, Users, CheckCircle, AlertCircle, Navigation, Bell, BellOff, AlertTriangle, Info, Landmark, MessageCircle } from 'lucide-react'
import { useCombiSimulation } from '../hooks/useCombiSimulation'
import { useCombiEnVivo } from '../hooks/useCombiEnVivo'
import { useColeccion } from '../hooks/useColeccion'
import { paradas, horarios as horariosFijos, alertasCombi as alertasFijas, destinos, datosPago } from '../data/combiData'
import QRModal from '../components/QRModal'
import CopiarCampo from '../components/CopiarCampo'
import { pedirPermisoNotificacion, mostrarNotificacion, saludar } from '../utils/notificaciones'

export default function CombiMunicipal() {
  const simulacion = useCombiSimulation()
  const enVivo = useCombiEnVivo()
  const { estadoActual, posicion, progreso } = enVivo || simulacion

  const [form, setForm] = useState({ nombre: '', dni: '', destino: '', fecha: '', horario: '' })
  const [qrDatos, setQrDatos] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [paso, setPaso] = useState('formulario') // 'formulario' | 'pago'
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
        })
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
      })
    }
  }

  // Horarios y alertas cargados desde el panel de trabajadores, combinados
  // con los datos fijos del sitio.
  const { items: horariosLive } = useColeccion('horariosCombi')
  const { items: alertasLive } = useColeccion('alertasCombi')
  const horarios = useMemo(() => [
    ...horariosFijos.filter(h => !horariosLive.some(lh => lh.idOriginal === h.id)),
    ...horariosLive,
  ], [horariosLive])
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
        })
      }
    }
  }, [alertasLive, notifActiva])

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.dni.trim() || !/^\d{7,8}$/.test(form.dni)) e.dni = 'DNI inválido (7-8 dígitos)'
    if (!form.destino) e.destino = 'Seleccioná un destino'
    if (!form.fecha) e.fecha = 'Requerido'
    if (!form.horario) e.horario = 'Seleccioná un horario'
    return e
  }

  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    setErrors({})
    setPaso('pago')
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const confirmarPago = () => {
    const horarioSeleccionado = horarios.find(h => h.id === parseInt(form.horario))
    const texto = [
      '*Comprobante de pago - Pasaje Combi Municipal*',
      `Nombre: ${form.nombre}`,
      `DNI: ${form.dni}`,
      `Destino: ${form.destino}`,
      `Fecha: ${form.fecha}`,
      `Horario: ${horarioSeleccionado?.salida || form.horario}`,
      '',
      'Adjunto el comprobante de la transferencia.',
    ].join('\n')
    const url = `https://wa.me/${datosPago.telefono}?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setQrDatos({ ...form, horario: horarioSeleccionado?.salida || form.horario })
    setSubmitted(true)
    setPaso('formulario')
  }

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
              </div>
            ))}
          </div>
        </div>

        {/* Compra de pasaje */}
        <div className="card p-6 lg:p-8">
          <h2 className="text-xl font-bold font-poppins mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-verde" /> Comprar Pasaje
          </h2>

          {submitted && !qrDatos && (
            <div className="bg-verde/10 border border-verde/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-verde" />
              <p className="text-verde-oscuro font-medium">¡Pasaje comprado con éxito!</p>
            </div>
          )}

          {paso === 'pago' ? (
            <div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm text-gray-600 space-y-1">
                <p><span className="font-semibold text-gray-800">{form.nombre}</span> · DNI {form.dni}</p>
                <p>{form.destino} · {form.fecha}</p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Landmark className="w-5 h-5 text-verde" />
                <h3 className="font-bold font-poppins text-gray-800">Datos para transferir</h3>
              </div>

              <div className="space-y-3 mb-6">
                <CopiarCampo label="Alias" valor={datosPago.alias} />
                <CopiarCampo label="Titular" valor={datosPago.titular} />
              </div>

              <div className="bg-azul/5 border border-azul/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-azul shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  Una vez que hagas la transferencia, envianos el comprobante por WhatsApp al{' '}
                  <span className="font-semibold text-azul-oscuro">{datosPago.telefonoVisible}</span> para confirmar tu pasaje.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => setPaso('formulario')} className="btn-secondary sm:w-40">
                  Volver
                </button>
                <button type="button" onClick={confirmarPago} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Enviar comprobante por WhatsApp
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo *</label>
                <input
                  type="text"
                  className={`input-field ${errors.nombre ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  placeholder="Juan García"
                  value={form.nombre}
                  onChange={e => handleChange('nombre', e.target.value)}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">DNI *</label>
                <input
                  type="text"
                  className={`input-field ${errors.dni ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  placeholder="30123456"
                  value={form.dni}
                  onChange={e => handleChange('dni', e.target.value.replace(/\D/g, ''))}
                  maxLength={8}
                />
                {errors.dni && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dni}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Destino *</label>
                <select
                  className={`select-field ${errors.destino ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  value={form.destino}
                  onChange={e => handleChange('destino', e.target.value)}
                >
                  <option value="">Seleccioná destino</option>
                  {destinos.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.destino && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.destino}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha *</label>
                <input
                  type="date"
                  className={`input-field ${errors.fecha ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  value={form.fecha}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => handleChange('fecha', e.target.value)}
                />
                {errors.fecha && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fecha}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Horario *</label>
                <select
                  className={`select-field ${errors.horario ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  value={form.horario}
                  onChange={e => handleChange('horario', e.target.value)}
                >
                  <option value="">Seleccioná horario</option>
                  {horarios.filter(h => h.disponibles > 0).map(h => (
                    <option key={h.id} value={h.id}>
                      {h.salida} - {h.origen} → {h.destino} ({h.disponibles} lugares)
                    </option>
                  ))}
                </select>
                {errors.horario && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.horario}</p>}
              </div>

              <div className="sm:col-span-2">
                <button type="submit" className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2">
                  <Bus className="w-5 h-5" />
                  Comprar Pasaje
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {qrDatos && <QRModal datos={qrDatos} onClose={() => setQrDatos(null)} />}
    </div>
  )
}
