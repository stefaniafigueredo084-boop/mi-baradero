import { useState, useEffect } from 'react'
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { User, Phone, MapPin, Bell, BellOff, CheckCircle, Save, Trash2, Calendar, Recycle, Edit3, Sun, Moon, Type, Volume2, Play } from 'lucide-react'
import { pedirPermisoNotificacion, mostrarNotificacion, saludar } from '../utils/notificaciones'
import { db } from '../firebase'
import { idVecino, esPrimerGuardadoVecino, marcarVecinoGuardado, olvidarVecino } from '../utils/perfilLocal'
import { useAccesibilidad, TAMANOS_FUENTE } from '../context/AccesibilidadContext'
import { hablar } from '../utils/voz'
import { NOTIF_SECTORES } from '../data/notifSectores'

const ICONOS_NOTIF = { basura: Trash2, eventos: Calendar, nuevosEventos: Bell, puntosVerdes: Recycle }

const ZONAS = ['Zona Centro', 'Zona Norte', 'Zona Sur', 'Zona Este', 'Zona Oeste']

const defaultPerfil = {
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  direccion: '',
  zona: '',
  avatar: '',
  notif: {
    basura: false,
    eventos: false,
    puntosVerdes: false,
    nuevosEventos: false,
  },
  // Además de la notificación visual, ¿este sector te lo tengo que leer
  // en voz alta? Solo tiene efecto si "Lector de pantalla" está activado.
  notifVoz: {
    basura: false,
    eventos: false,
    puntosVerdes: false,
    nuevosEventos: false,
  },
}

export default function Perfil() {
  const { tema, setTema, tamanoFuente, setTamanoFuente, lector, setLector } = useAccesibilidad()
  const [perfil, setPerfil] = useState(() => {
    try {
      const guardado = localStorage.getItem('mibaradero_perfil')
      return guardado ? { ...defaultPerfil, ...JSON.parse(guardado) } : defaultPerfil
    } catch {
      return defaultPerfil
    }
  })
  const [guardado, setGuardado] = useState(false)
  const [editando, setEditando] = useState(false)

  const set = (campo, valor) => setPerfil(p => ({ ...p, [campo]: valor }))
  const setNotif = (campo, valor) => setPerfil(p => ({ ...p, notif: { ...p.notif, [campo]: valor } }))
  const setNotifVoz = (campo, valor) => setPerfil(p => ({ ...p, notifVoz: { ...p.notifVoz, [campo]: valor } }))

  const guardar = async () => {
    // Pedir permiso de notificaciones si hay alguna activa (si el
    // navegador no soporta notificaciones, esto no interrumpe el guardado)
    const hayNotif = Object.values(perfil.notif).some(Boolean)
    if (hayNotif) {
      await pedirPermisoNotificacion()
    }
    localStorage.setItem('mibaradero_perfil', JSON.stringify(perfil))

    // Le mandamos al municipio únicamente el nombre y qué notificaciones
    // tenés activas — nunca tu teléfono, dirección, email ni zona. Así
    // el administrador puede ver cuántos vecinos usan la app sin acceder
    // a tus datos de contacto.
    if (perfil.nombre?.trim()) {
      try {
        const esNuevo = esPrimerGuardadoVecino()
        await setDoc(doc(db, 'vecinos', idVecino()), {
          nombre: perfil.nombre.trim(),
          apellido: perfil.apellido?.trim() || '',
          notif: perfil.notif,
          actualizadoEn: serverTimestamp(),
          ...(esNuevo ? { creadoEn: serverTimestamp() } : {}),
        }, { merge: true })
        if (esNuevo) marcarVecinoGuardado()
      } catch {
        // Si falla (sin conexión, etc.) el perfil ya quedó guardado
        // localmente igual — no interrumpimos la experiencia del vecino.
      }
    }

    setGuardado(true)
    setEditando(false)
    setTimeout(() => setGuardado(false), 3000)

    if (hayNotif) {
      mostrarNotificacion('✅ Mi Baradero — Perfil guardado', {
        body: `Hola ${perfil.nombre || 'vecino'}, tus notificaciones están activas.`,
        icon: '/logo-mibaradero.png',
      })
    }
  }

  const limpiar = () => {
    if (confirm('¿Querés borrar todos tus datos de perfil?')) {
      localStorage.removeItem('mibaradero_perfil')
      deleteDoc(doc(db, 'vecinos', idVecino())).catch(() => {})
      olvidarVecino()
      setPerfil(defaultPerfil)
    }
  }

  const iniciales = perfil.nombre || perfil.apellido
    ? `${perfil.nombre?.[0] || ''}${perfil.apellido?.[0] || ''}`.toUpperCase()
    : '?'

  const escucharEjemplo = ejemplo => hablar(saludar(ejemplo))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-verde-oscuro to-[#064020] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold font-poppins shrink-0">
            {iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-bold font-poppins">
              {perfil.nombre ? `${perfil.nombre} ${perfil.apellido}` : 'Mi Perfil'}
            </h1>
            <p className="text-green-200 mt-1">
              {perfil.direccion ? perfil.direccion : 'Completá tu perfil para recibir notificaciones personalizadas'}
            </p>
            {perfil.zona && (
              <span className="inline-block mt-2 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full">
                📍 {perfil.zona}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Datos personales */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-poppins flex items-center gap-2">
              <User className="w-5 h-5 text-verde" /> Datos Personales
            </h2>
            <button
              onClick={() => setEditando(!editando)}
              className="flex items-center gap-1.5 text-sm font-semibold text-verde hover:text-verde-oscuro transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              {editando ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Nombre</label>
              <input
                type="text"
                value={perfil.nombre}
                onChange={e => set('nombre', e.target.value)}
                disabled={!editando}
                placeholder="Tu nombre"
                className="input-field disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Apellido</label>
              <input
                type="text"
                value={perfil.apellido}
                onChange={e => set('apellido', e.target.value)}
                disabled={!editando}
                placeholder="Tu apellido"
                className="input-field disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <Phone className="w-3 h-3" /> Teléfono
              </label>
              <input
                type="tel"
                value={perfil.telefono}
                onChange={e => set('telefono', e.target.value)}
                disabled={!editando}
                placeholder="Ej: 03329-XXXXXX"
                className="input-field disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
              <input
                type="email"
                value={perfil.email}
                onChange={e => set('email', e.target.value)}
                disabled={!editando}
                placeholder="tu@email.com"
                className="input-field disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Dirección
              </label>
              <input
                type="text"
                value={perfil.direccion}
                onChange={e => set('direccion', e.target.value)}
                disabled={!editando}
                placeholder="Ej: Alsina 159"
                className="input-field disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Zona</label>
              <select
                value={perfil.zona}
                onChange={e => set('zona', e.target.value)}
                disabled={!editando}
                className="select-field disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Seleccioná tu zona</option>
                {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Accesibilidad */}
        <div className="card p-6">
          <h2 className="text-lg font-bold font-poppins flex items-center gap-2 mb-5">
            <Sun className="w-5 h-5 text-amarillo" /> Accesibilidad
          </h2>

          <div className="space-y-6">
            {/* Tema claro/oscuro */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Apariencia</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTema('claro')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    tema === 'claro' ? 'bg-verde text-white border-verde' : 'bg-white text-gray-600 border-gray-200 hover:border-verde'
                  }`}
                >
                  <Sun className="w-4 h-4" /> Claro
                </button>
                <button
                  onClick={() => setTema('oscuro')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    tema === 'oscuro' ? 'bg-verde text-white border-verde' : 'bg-white text-gray-600 border-gray-200 hover:border-verde'
                  }`}
                >
                  <Moon className="w-4 h-4" /> Oscuro
                </button>
              </div>
            </div>

            {/* Tamaño de letra */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Type className="w-4 h-4" /> Tamaño de letra
              </p>
              <div className="grid grid-cols-4 gap-2">
                {TAMANOS_FUENTE.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setTamanoFuente(t.id)}
                    title={t.descripcion}
                    className={`py-3 rounded-xl font-bold border-2 transition-all ${
                      tamanoFuente === t.id ? 'bg-verde text-white border-verde' : 'bg-white text-gray-600 border-gray-200 hover:border-verde'
                    }`}
                    style={{ fontSize: `${0.8 + i * 0.15}rem` }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Cambia el tamaño de todo el texto del sitio.</p>
            </div>

            {/* Lector de pantalla */}
            <div className="flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${lector ? 'bg-verde/15' : 'bg-gray-200'}`}>
                  <Volume2 className={`w-5 h-5 ${lector ? 'text-verde' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Lector de pantalla</p>
                  <p className="text-xs text-gray-500">Muestra un botón para escuchar el contenido de cada página en voz alta.</p>
                </div>
              </div>
              <button
                onClick={() => setLector(!lector)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${lector ? 'bg-verde' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${lector ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="card p-6">
          <h2 className="text-lg font-bold font-poppins flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5 text-azul" /> Mis Notificaciones
          </h2>
          <p className="text-sm text-gray-500 mb-5 -mt-2">
            Elegí qué avisos querés recibir. Te llegará una notificación al dispositivo y al teléfono si lo cargaste.
          </p>
          <div className="space-y-3">
            {NOTIF_SECTORES.map(({ key, label, desc, color, ejemplo }) => {
              const Icon = ICONOS_NOTIF[key]
              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    perfil.notif[key]
                      ? color === 'amarillo' ? 'border-amarillo/40 bg-amarillo/5'
                      : color === 'azul' ? 'border-azul/30 bg-azul/5'
                      : 'border-verde/30 bg-verde/5'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        perfil.notif[key]
                          ? color === 'amarillo' ? 'bg-amarillo/20' : color === 'azul' ? 'bg-azul/15' : 'bg-verde/15'
                          : 'bg-gray-200'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          perfil.notif[key]
                            ? color === 'amarillo' ? 'text-yellow-600' : color === 'azul' ? 'text-azul' : 'text-verde'
                            : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotif(key, !perfil.notif[key])}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${
                        perfil.notif[key] ? 'bg-verde' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                        perfil.notif[key] ? 'left-6' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Si está activada, ofrecemos que también llegue hablada */}
                  {perfil.notif[key] && (
                    <div className="mt-3 pt-3 border-t border-gray-200/70 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <Volume2 className={`w-4 h-4 shrink-0 ${perfil.notifVoz[key] ? 'text-verde' : 'text-gray-400'}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-700">Recibir también con voz</p>
                          <button
                            type="button"
                            onClick={() => escucharEjemplo(ejemplo)}
                            className="flex items-center gap-1 text-xs text-azul hover:text-azul-oscuro font-medium mt-0.5"
                          >
                            <Play className="w-3 h-3" /> Escuchar ejemplo
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifVoz(key, !perfil.notifVoz[key])}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${
                          perfil.notifVoz[key] ? 'bg-verde' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                          perfil.notifVoz[key] ? 'left-6' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {lector === false && (
            <p className="text-xs text-gray-400 mt-3">
              💡 Para que las notificaciones se lean en voz alta necesitás activar "Lector de pantalla" más arriba.
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={guardar}
            className="flex-1 flex items-center justify-center gap-2 bg-verde text-white font-bold py-3.5 rounded-2xl hover:bg-verde-oscuro transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Save className="w-5 h-5" />
            Guardar perfil
          </button>
          <button
            onClick={limpiar}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-red-200 text-red-400 hover:bg-red-50 font-semibold text-sm transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Borrar datos
          </button>
        </div>

        {guardado && (
          <div className="flex items-center gap-3 bg-verde/10 border border-verde/30 rounded-2xl p-4">
            <CheckCircle className="w-5 h-5 text-verde shrink-0" />
            <p className="text-verde-oscuro font-semibold text-sm">¡Perfil guardado correctamente!</p>
          </div>
        )}

      </div>
    </div>
  )
}
