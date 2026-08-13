import { useState } from 'react'
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { AlertCircle, LogIn, Shield, Loader2 } from 'lucide-react'
import { auth } from '../firebase'
import LogoMiBaradero from '../components/LogoMiBaradero'
import IconoGoogle from '../components/IconoGoogle'

const googleProvider = new GoogleAuthProvider()

export default function LoginTrabajadores() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [entrandoGoogle, setEntrandoGoogle] = useState(false)

  const ingresar = async e => {
    e.preventDefault()
    setError('')
    setEntrando(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Email o contraseña incorrectos.')
    } finally {
      setEntrando(false)
    }
  }

  const conGoogle = async () => {
    setError('')
    setEntrandoGoogle(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      // Si cerró la ventana de Google antes de elegir cuenta, no es un
      // error real — no hace falta mostrarle nada.
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('No se pudo iniciar sesión con Google.')
      }
    } finally {
      setEntrandoGoogle(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-verde-oscuro to-[#064020] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <LogoMiBaradero size="md" theme="white" />
        </div>
        <form onSubmit={ingresar} className="bg-white rounded-3xl shadow-2xl p-7">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-verde" />
            <h1 className="text-xl font-bold font-poppins text-gray-800">Panel de Trabajadores</h1>
          </div>
          <p className="text-gray-500 text-sm mb-6">Acceso exclusivo para personal municipal</p>

          <button
            type="button"
            onClick={conGoogle}
            disabled={entrandoGoogle || entrando}
            className="w-full flex items-center justify-center gap-2.5 border-2 border-gray-200 rounded-2xl py-3 font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 mb-4"
          >
            {entrandoGoogle ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <IconoGoogle />}
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-xs text-gray-400">o con email</span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            required
            className="input-field mb-4"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="trabajador@mibaradero.com"
          />

          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
          <input
            type="password"
            required
            className="input-field mb-4"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <p className="text-red-500 text-sm mb-4 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </p>
          )}

          <button type="submit" disabled={entrando || entrandoGoogle} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {entrando ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
