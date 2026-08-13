import { useState } from 'react'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { AlertCircle, CheckCircle, LogIn, LogOut, Loader2, Mail, ShieldCheck, UserPlus } from 'lucide-react'
import { auth } from '../firebase'
import IconoGoogle from './IconoGoogle'

const googleProvider = new GoogleAuthProvider()

const MENSAJES_ERROR = {
  'auth/email-already-in-use': 'Ese email ya tiene una cuenta. Probá ingresar en vez de crear una nueva.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'No existe una cuenta con ese email.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/missing-email': 'Escribí tu email arriba primero.',
  'auth/popup-closed-by-user': '',
}

// Tarjeta de "Mi cuenta" para la web pública: iniciar sesión con Google
// o con email/contraseña, o crear una cuenta nueva. Es opcional — el
// sitio funciona sin loguearse, pero al iniciar sesión el perfil y las
// notificaciones quedan guardados en la cuenta (se pueden recuperar
// desde cualquier dispositivo) en vez de solo en este navegador.
export default function CuentaVecino({ usuario }) {
  const [modo, setModo] = useState('ingresar') // 'ingresar' | 'registro'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [recuperando, setRecuperando] = useState(false)
  const [recuperado, setRecuperado] = useState(false)

  const conGoogle = async () => {
    setError('')
    setCargando(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      setError(MENSAJES_ERROR[err.code] ?? 'No se pudo iniciar sesión con Google.')
    } finally {
      setCargando(false)
    }
  }

  const enviar = async e => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      if (modo === 'registro') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(MENSAJES_ERROR[err.code] ?? 'No se pudo completar la operación.')
    } finally {
      setCargando(false)
    }
  }

  const recuperarPassword = async () => {
    setError('')
    setRecuperado(false)
    if (!email) { setError('Escribí tu email arriba primero.'); return }
    setRecuperando(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setRecuperado(true)
    } catch (err) {
      setError(MENSAJES_ERROR[err.code] ?? 'No se pudo enviar el email de recuperación.')
    } finally {
      setRecuperando(false)
    }
  }

  if (usuario) {
    return (
      <div className="card p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-verde/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-verde" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm">Sesión iniciada</p>
            <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold font-poppins flex items-center gap-2 mb-1">
        <Mail className="w-5 h-5 text-verde" /> Mi cuenta
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Iniciá sesión para completar tu perfil y notificaciones — quedan guardados en tu cuenta y los podés recuperar desde cualquier dispositivo.
      </p>

      <button
        onClick={conGoogle}
        disabled={cargando}
        className="w-full flex items-center justify-center gap-2.5 border-2 border-gray-200 rounded-2xl py-3 font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 mb-4"
      >
        <IconoGoogle />
        Continuar con Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-px bg-gray-100 flex-1" />
        <span className="text-xs text-gray-400">o con email</span>
        <div className="h-px bg-gray-100 flex-1" />
      </div>

      <form onSubmit={enviar} className="space-y-3">
        <input
          type="email"
          required
          placeholder="tu@email.com"
          className="input-field"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Contraseña"
          className="input-field"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {modo === 'ingresar' && (
          <button
            type="button"
            onClick={recuperarPassword}
            disabled={recuperando}
            className="text-xs text-gray-400 hover:text-verde font-medium disabled:opacity-60"
          >
            {recuperando ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
          </button>
        )}

        {recuperado && (
          <p className="text-verde text-sm flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 shrink-0" /> Te enviamos un email para reestablecer tu contraseña.
          </p>
        )}

        {error && (
          <p className="text-red-500 text-sm flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        <button type="submit" disabled={cargando} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
          {cargando ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : modo === 'registro' ? (
            <UserPlus className="w-5 h-5" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          {modo === 'registro' ? 'Crear cuenta' : 'Ingresar'}
        </button>
      </form>

      <button
        onClick={() => {
          setModo(m => (m === 'registro' ? 'ingresar' : 'registro'))
          setError('')
        }}
        className="w-full text-center text-sm text-verde font-semibold mt-4 hover:text-verde-oscuro"
      >
        {modo === 'registro' ? '¿Ya tenés cuenta? Ingresá' : '¿No tenés cuenta? Creá una'}
      </button>
    </div>
  )
}
