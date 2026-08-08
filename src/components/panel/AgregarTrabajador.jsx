import { useState } from 'react'
import { deleteApp, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { AlertCircle, CheckCircle, Loader2, ShieldCheck, UserPlus } from 'lucide-react'
import { auth, db } from '../../firebase'
import { registrarHistorial } from '../../utils/historial'
import { SECTORES } from '../../data/sectores'

// Crear una cuenta nueva con createUserWithEmailAndPassword() inicia
// sesión automáticamente con ESA cuenta en la app actual — lo cual
// echaría a la persona que está usando el panel. Para evitarlo, se crea
// una instancia secundaria y temporal de Firebase solo para el alta, y
// se descarta apenas termina.
export default function AgregarTrabajador() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceso, setAcceso] = useState('admin') // 'admin' | id de sector
  const [resultado, setResultado] = useState(null)
  const [creando, setCreando] = useState(false)

  const crear = async e => {
    e.preventDefault()
    setResultado(null)
    if (password.length < 6) {
      setResultado({ ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }
    setCreando(true)
    const appTemporal = initializeApp(auth.app.options, `temp-${Date.now()}`)
    const authTemporal = getAuth(appTemporal)
    try {
      const cred = await createUserWithEmailAndPassword(authTemporal, email, password)
      const rol = acceso === 'admin' ? 'admin' : 'sector'
      await setDoc(doc(db, 'trabajadores', cred.user.uid), {
        email,
        rol,
        ...(rol === 'sector' ? { sector: acceso } : {}),
      })
      await registrarHistorial({
        tipo: 'crear',
        seccion: 'usuarios',
        detalle: `Cuenta creada: ${email} (${rol === 'admin' ? 'Administrador general' : SECTORES.find(s => s.id === acceso)?.label})`,
      })
      setResultado({ ok: true, mensaje: `Cuenta creada para ${email}.` })
      setEmail('')
      setPassword('')
      setAcceso('admin')
    } catch (err) {
      setResultado({
        ok: false,
        mensaje: err.code === 'auth/email-already-in-use' ? 'Ese email ya tiene una cuenta.' : 'No se pudo crear la cuenta.',
      })
    } finally {
      await deleteApp(appTemporal)
      setCreando(false)
    }
  }

  return (
    <div className="card p-6 max-w-lg">
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-1">
        <UserPlus className="w-5 h-5 text-verde" /> Agregar trabajador
      </h3>
      <p className="text-gray-500 text-sm mb-5">Creá una cuenta para que otro empleado pueda entrar al panel.</p>
      <form onSubmit={crear} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            required
            className="input-field"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="nuevo@mibaradero.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
          <input
            type="password"
            required
            className="input-field"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Acceso al panel</label>
          <div className="space-y-2">
            <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-colors ${acceso === 'admin' ? 'border-verde bg-verde/5' : 'border-gray-200'}`}>
              <input type="radio" name="acceso" checked={acceso === 'admin'} onChange={() => setAcceso('admin')} className="accent-verde w-4 h-4" />
              <ShieldCheck className="w-4 h-4 text-verde shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Administrador general</p>
                <p className="text-xs text-gray-500">Accede a todas las secciones y al historial de actividad.</p>
              </div>
            </label>
            {SECTORES.map(s => (
              <label key={s.id} className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-colors ${acceso === s.id ? 'border-azul bg-azul/5' : 'border-gray-200'}`}>
                <input type="radio" name="acceso" checked={acceso === s.id} onChange={() => setAcceso(s.id)} className="accent-azul w-4 h-4" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Solo {s.label}</p>
                  <p className="text-xs text-gray-500">Únicamente puede ver y editar esta sección.</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {resultado && (
          <p className={`text-sm flex items-center gap-1.5 ${resultado.ok ? 'text-verde' : 'text-red-500'}`}>
            {resultado.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {resultado.mensaje}
          </p>
        )}
        <button type="submit" disabled={creando} className="btn-primary flex items-center gap-2 disabled:opacity-60">
          {creando ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Crear cuenta
        </button>
      </form>
      <p className="text-xs text-gray-400 mt-5 leading-relaxed">
        Para dar de baja a un trabajador hacelo desde Firebase Console → Authentication → Users: por seguridad, desde acá no se pueden eliminar cuentas de otras personas.
      </p>
    </div>
  )
}
