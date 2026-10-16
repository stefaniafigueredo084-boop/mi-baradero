import { useEffect, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { MapPin, Navigation } from 'lucide-react'
import { db } from '../../firebase'
import { paradas } from '../../data/combiData'
import { registrarHistorial } from '../../utils/historial'

export default function CombiEnVivo() {
  const [paradaId, setParadaId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'combiEnVivo'), snap => {
      setParadaId(snap.exists() ? snap.data().paradaId : null)
    }, () => setError('No se pudo cargar la posición actual. Revisá tu conexión.'))
  }, [])

  const marcar = async parada => {
    setGuardando(true)
    setError('')
    try {
      await setDoc(doc(db, 'config', 'combiEnVivo'), { paradaId: parada.id, actualizadoEn: serverTimestamp() })
      registrarHistorial({ tipo: 'editar', seccion: 'combi', detalle: `Combi marcada en ${parada.nombre}` })
    } catch {
      setError('No se pudo marcar la posición. Probá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const actual = paradas.find(p => p.id === paradaId)

  return (
    <div className="card p-4 mb-8">
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-1">
        <Navigation className="w-5 h-5 text-primario" /> Combi en vivo
      </h3>
      <p className="text-gray-500 text-sm mb-5">
        Marcá dónde está la combi ahora: se actualiza al instante para todos los vecinos y les llega una notificación.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {paradas.map(p => (
          <button
            key={p.id}
            disabled={guardando}
            onClick={() => marcar(p)}
            className={`p-4 rounded border-2 text-center transition-all disabled:opacity-50 ${
              paradaId === p.id ? 'bg-primario text-white border-primario shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-primario'
            }`}
          >
            <p.icono className="w-7 h-7 mx-auto mb-1.5" />
            <span className="font-bold text-sm">{p.nombre}</span>
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-3 mt-3">{error}</p>}
      {actual && (
        <p className="text-sm text-gray-400 mt-4 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 shrink-0" /> Última posición marcada: {actual.nombre}
        </p>
      )}
    </div>
  )
}
