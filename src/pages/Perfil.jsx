import { useState, useEffect } from 'react'
import { deleteUser } from 'firebase/auth'
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { User, Phone, MapPin, Bell, BellOff, CheckCircle, Save, Trash2, Calendar, Recycle, Edit3, Sun, Moon, Type, Volume2, Play, Bus, Ticket, ChevronRight, Loader2 } from 'lucide-react'
import { pedirPermisoNotificacion, mostrarNotificacion, saludar } from '../utils/notificaciones'
import { auth, db } from '../firebase'
import { idVecino, esPrimerGuardadoVecino, marcarVecinoGuardado, olvidarVecino } from '../utils/perfilLocal'
import { useAccesibilidad, TAMANOS_FUENTE } from '../context/AccesibilidadContext'
import { useAuth } from '../context/AuthContext'
import { hablar } from '../utils/voz'
import { NOTIF_SECTORES } from '../data/notifSectores'
import CuentaVecino from '../components/CuentaVecino'
import ImagenInput from '../components/panel/ImagenInput'

const ICONOS_NOTIF = { basura: Trash2, eventos: Calendar, puntosVerdes: Recycle, combi: Bus }

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
    combi: false,
  },
  // Además de la notificación visual, ¿este sector te lo tengo que leer
  // en voz alta?
  notifVoz: {
    basura: false,
    eventos: false,
    puntosVerdes: false,
    combi: false,
  },
}

export default function Perfil() {
  const { tema, setTema, tamanoFuente, setTamanoFuente, lector, setLector } = useAccesibilidad()
  const { usuario: cuenta } = useAuth()
  const [perfil, setPerfil] = useState(() => {
    try {
      const guardado = localStorage.getItem('mibaradero_perfil')
      if (!guardado) return defaultPerfil
      const datos = JSON.parse(guardado)
      // Migración: "Eventos próximos" y "Nuevos eventos" eran dos sectores
      // separados y ahora son uno solo ("eventos"). Si alguien ya tenía
      // activado cualquiera de los dos viejos, el sector combinado queda
      // activado (no perdemos la preferencia que ya habían elegido).
      if (datos.notif?.nuevosEventos) datos.notif.eventos = true
      if (datos.notifVoz?.nuevosEventos) datos.notifVoz.eventos = true
      return {
        ...defaultPerfil,
        ...datos,
        notif: { ...defaultPerfil.notif, ...datos.notif },
        notifVoz: { ...defaultPerfil.notifVoz, ...datos.notifVoz },
      }
    } catch {
      return defaultPerfil
    }
  })
  const [guardado, setGuardado] = useState(false)
  const [editando, setEditando] = useState(false)

  const set = (campo, valor) => setPerfil(p => ({ ...p, [campo]: valor }))
  const setNotif = (campo, valor) => setPerfil(p => ({ ...p, notif: { ...p.notif, [campo]: valor } }))
  const setNotifVoz = (campo, valor) => setPerfil(p => ({ ...p, notifVoz: { ...p.notifVoz, [campo]: valor } }))

  // Al iniciar sesión, si esa cuenta ya tenía un perfil guardado (por
  // ejemplo, desde otro dispositivo) lo traemos para no perderlo.
  useEffect(() => {
    if (!cuenta) return
    // Precarga el email de la cuenta (Google o el que usó para
    // registrarse) — es un dato que ya dio, no hace falta pedírselo de nuevo.
    setPerfil(p => ({ ...p, email: p.email || cuenta.email || '' }))
    getDoc(doc(db, 'vecinos', cuenta.uid)).then(snap => {
      if (!snap.exists()) return
      const d = snap.data()
      setPerfil(p => ({
        ...p,
        nombre: d.nombre || p.nombre,
        apellido: d.apellido || p.apellido,
        notif: d.notif || p.notif,
        avatar: d.avatar || p.avatar,
      }))
    }).catch(() => {})
  }, [cuenta])

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
    //
    // Si hay sesión iniciada, el documento queda ligado a la cuenta
    // (usuario.uid) en vez de al id anónimo del dispositivo — así el
    // perfil se puede recuperar desde cualquier otro dispositivo.
    if (perfil.nombre?.trim()) {
      try {
        const esNuevo = !cuenta && esPrimerGuardadoVecino()
        const idDoc = cuenta ? cuenta.uid : idVecino()
        await setDoc(doc(db, 'vecinos', idDoc), {
          nombre: perfil.nombre.trim(),
          apellido: perfil.apellido?.trim() || '',
          notif: perfil.notif,
          avatar: perfil.avatar || '',
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

  const [borrandoCuenta, setBorrandoCuenta] = useState(false)
  const [errorBorrar, setErrorBorrar] = useState('')

  const borrarCuenta = async () => {
    if (!confirm('¿Querés borrar tu cuenta? Se borran tu perfil y tus notificaciones, y no se puede deshacer.')) return
    setErrorBorrar('')
    setBorrandoCuenta(true)
    localStorage.removeItem('mibaradero_perfil')
    try {
      if (cuenta) {
        await deleteDoc(doc(db, 'vecinos', cuenta.uid)).catch(() => {})
        await deleteUser(cuenta)
      } else {
        await deleteDoc(doc(db, 'vecinos', idVecino())).catch(() => {})
        olvidarVecino()
      }
      setPerfil(defaultPerfil)
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        setErrorBorrar('Por seguridad, cerrá sesión y volvé a entrar antes de borrar la cuenta.')
      } else {
        setErrorBorrar('No se pudo borrar la cuenta. Probá de nuevo.')
      }
    } finally {
      setBorrandoCuenta(false)
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
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold font-poppins shrink-0 overflow-hidden">
            {perfil.avatar ? <img src={perfil.avatar} alt="" className="w-full h-full object-cover" /> : iniciales}
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

        {/* Mientras se confirma si hay sesión iniciada, no mostramos nada
            todavía — evita el parpadeo de "iniciá sesión" seguido de
            inmediato por el perfil ya logueado. */}
        {cuenta === undefined && (
          <div className="card p-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-verde animate-spin" />
          </div>
        )}

        {/* Sin sesión: solo se ve la tarjeta de "Mi cuenta". El resto del
            perfil (datos, accesibilidad, notificaciones) aparece recién
            después de loguearse, más abajo. */}
        {cuenta === null && <CuentaVecino usuario={cuenta} />}

        {cuenta && (
          <>
            {/* Mi cuenta (resumen: sesión iniciada + cerrar sesión) */}
            <CuentaVecino usuario={cuenta} />

            {/* Mi Pase (vive dentro de la página de la Combi) */}
            <Link
              to="/combi"
              className="card p-5 flex items-center gap-4 hover:border-verde hover:border-2 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-verde/10 flex items-center justify-center shrink-0">
                <Ticket className="w-6 h-6 text-verde" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold font-poppins text-gray-800">Mi Pase de la combi</p>
                <p className="text-sm text-gray-500">Pedí tu categoría (estudiante, jubilado, discapacidad) y generá tu QR para viajar.</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-verde transition-colors shrink-0" />
            </Link>

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

          {editando && (
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Foto de perfil (opcional)</label>
              <ImagenInput valor={perfil.avatar} onChange={valor => set('avatar', valor)} />
            </div>
          )}

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
            onClick={borrarCuenta}
            disabled={borrandoCuenta}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-red-200 text-red-400 hover:bg-red-50 font-semibold text-sm transition-all duration-200 disabled:opacity-60"
          >
            {borrandoCuenta ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Borrar cuenta
          </button>
        </div>

        {errorBorrar && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-500 font-semibold text-sm">{errorBorrar}</p>
          </div>
        )}

        {guardado && (
          <div className="flex items-center gap-3 bg-verde/10 border border-verde/30 rounded-2xl p-4">
            <CheckCircle className="w-5 h-5 text-verde shrink-0" />
            <p className="text-verde-oscuro font-semibold text-sm">¡Perfil guardado correctamente!</p>
          </div>
        )}
          </>
        )}

      </div>
    </div>
  )
}
