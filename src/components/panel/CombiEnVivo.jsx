import { useEffect, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { MapPin, Navigation } from 'lucide-react'
import { db } from '../../firebase'
import { paradas } from '../../data/combiData'
import { registrarHistorial } from '../../utils/historial'

export default function CombiEnVivo() {
  const [paradaId, setParadaId] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'combiEnVivo'), snap => {
      setParadaId(snap.exists() ? snap.data().paradaId : null)
    })
  }, [])

  const marcar = async parada => {
    setGuardando(true)
    await setDoc(doc(db, 'config', 'combiEnVivo'), { paradaId: parada.id, actualizadoEn: serverTimestamp() })
    registrarHistorial({ tipo: 'editar', seccion: 'combi', detalle: `Combi marcada en ${parada.nombre}` })
    setGuardando(false)
  }

  const actual = paradas.find(p => p.id === paradaId)

  return (
    <div className="card p-6 mb-8">
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-1">
        <Navigation className="w-5 h-5 text-verde" /> Combi en vivo
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
            className={`p-4 rounded-2xl border-2 text-center transition-all disabled:opacity-50 ${
              paradaId === p.id ? 'bg-verde text-white border-verde shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-verde'
            }`}
          >
            <span className="text-2xl block mb-1">{p.icono}</span>
            <span className="font-bold text-sm">{p.nombre}</span>
          </button>
        ))}
      </div>
      {actual && (
        <p className="text-sm text-gray-400 mt-4 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 shrink-0" /> Última posición marcada: {actual.nombre}
        </p>
      )}
    </div>
  )
}
