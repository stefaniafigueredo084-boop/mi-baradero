import { useState } from 'react'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  linkWithPopup,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { AlertCircle, CheckCircle, Eye, EyeOff, LogIn, LogOut, Loader2, Mail, ShieldCheck, UserPlus } from 'lucide-react'
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
  const [password2, setPassword2] = useState('')
  const [verPass, setVerPass] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [recuperando, setRecuperando] = useState(false)
  const [recuperado, setRecuperado] = useState(false)

  const conGoogle = async () => {
    setError('')
    setCargando(true)
    try {
      // Si hay una sesión anónima, se VINCULA a la cuenta de Google en vez
      // de reemplazarla: el uid no cambia y el vecino conserva su pase,
      // sus pasajes y sus reclamos. Si esa cuenta de Google ya existía,
      // no se puede vincular y se entra directamente a ella.
      const actual = auth.currentUser
      if (actual?.isAnonymous) {
        try {
          await linkWithPopup(actual, googleProvider)
        } catch (err) {
          if (err.code !== 'auth/credential-already-in-use') throw err
          await signInWithCredential(auth, GoogleAuthProvider.credentialFromError(err))
        }
      } else {
        await signInWithPopup(auth, googleProvider)
      }
    } catch (err) {
      setError(MENSAJES_ERROR[err.code] ?? 'No se pudo iniciar sesión con Google.')
    } finally {
      setCargando(false)
    }
  }

  const enviar = async e => {
    e.preventDefault()
    setError('')
    if (modo === 'registro' && password !== password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setCargando(true)
    try {
      if (modo === 'registro') {
        // Igual que con Google: crear la cuenta vinculando la sesión
        // anónima mantiene el mismo uid (y con él, sus datos).
        const actual = auth.currentUser
        if (actual?.isAnonymous) {
          await linkWithCredential(actual, EmailAuthProvider.credential(email, password))
        } else {
          await createUserWithEmailAndPassword(auth, email, password)
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      setEmail('')
      setPassword('')
      setPassword2('')
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
      <div className="card p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primario/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-primario" />
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
    <div className="card p-4">
      <h2 className="text-lg font-bold font-poppins flex items-center gap-2 mb-1">
        <Mail className="w-5 h-5 text-primario" /> Mi cuenta
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
        <div className="relative">
          <input
            type={verPass ? 'text' : 'password'}
            required
            minLength={6}
            placeholder="Contraseña"
            autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
            className="input-field pr-11"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setVerPass(v => !v)}
            aria-label={verPass ? 'Ocultar contraseña' : 'Ver contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primario-oscuro transition-colors"
          >
            {verPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {modo === 'registro' && (
          <input
            type={verPass ? 'text' : 'password'}
            required
            minLength={6}
            placeholder="Repetir contraseña"
            autoComplete="new-password"
            className={`input-field ${password2 && password2 !== password ? '!border-red-400' : ''}`}
            value={password2}
            onChange={e => setPassword2(e.target.value)}
          />
        )}

        {modo === 'ingresar' && (
          <button
            type="button"
            onClick={recuperarPassword}
            disabled={recuperando}
            className="text-sm text-gray-500 hover:text-primario-oscuro font-medium disabled:opacity-60"
          >
            {recuperando ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
          </button>
        )}

        {recuperado && (
          <p className="text-primario text-sm flex items-center gap-1.5">
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
          setPassword2('')
        }}
        className="w-full text-center text-sm text-primario-oscuro font-semibold mt-4 hover:text-primario-oscuro"
      >
        {modo === 'registro' ? '¿Ya tenés cuenta? Ingresá' : '¿No tenés cuenta? Creá una'}
      </button>
    </div>
  )
}
