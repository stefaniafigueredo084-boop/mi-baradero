import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { Truck } from 'lucide-react'
import { db } from '../../firebase'
import { estadosCamionOpciones } from '../../data/panelCampos'
import { registrarHistorial } from '../../utils/historial'

export default function EstadoCamion() {
  const [estado, setEstado] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'estadoCamion'), snap => {
      setEstado(snap.exists() ? snap.data().valor : 'EN_SERVICIO')
    }, () => setError('No se pudo cargar el estado actual. Revisá tu conexión.'))
  }, [])

  const cambiar = async id => {
    setGuardando(true)
    setError('')
    try {
      await setDoc(doc(db, 'config', 'estadoCamion'), { valor: id })
      registrarHistorial({
        tipo: 'editar',
        seccion: 'residuos',
        detalle: `Estado del camión → ${estadosCamionOpciones.find(o => o.id === id)?.label}`,
      })
    } catch {
      setError('No se pudo cambiar el estado. Probá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="card p-4 mb-8">
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-primario" /> Estado del camión de residuos
      </h3>
      <div className="flex flex-wrap gap-3">
        {estadosCamionOpciones.map(op => (
          <button
            key={op.id}
            disabled={guardando}
            onClick={() => cambiar(op.id)}
            className={`px-5 py-3 rounded-2xl font-bold text-base transition-all disabled:opacity-50 ${
              estado === op.id ? 'bg-primario text-white shadow-md' : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-primario'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-3 mt-3">{error}</p>}
    </div>
  )
}
