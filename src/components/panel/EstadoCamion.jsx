import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { Truck } from 'lucide-react'
import { db } from '../../firebase'
import { estadosCamionOpciones } from '../../data/panelCampos'
import { registrarHistorial } from '../../utils/historial'

export default function EstadoCamion() {
  const [estado, setEstado] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'estadoCamion'), snap => {
      setEstado(snap.exists() ? snap.data().valor : 'EN_SERVICIO')
    })
  }, [])

  const cambiar = async id => {
    setGuardando(true)
    await setDoc(doc(db, 'config', 'estadoCamion'), { valor: id })
    registrarHistorial({
      tipo: 'editar',
      seccion: 'residuos',
      detalle: `Estado del camión → ${estadosCamionOpciones.find(o => o.id === id)?.label}`,
    })
    setGuardando(false)
  }

  return (
    <div className="card p-6 mb-8">
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-verde" /> Estado del camión de residuos
      </h3>
      <div className="flex flex-wrap gap-3">
        {estadosCamionOpciones.map(op => (
          <button
            key={op.id}
            disabled={guardando}
            onClick={() => cambiar(op.id)}
            className={`px-5 py-3 rounded-2xl font-bold text-base transition-all disabled:opacity-50 ${
              estado === op.id ? 'bg-verde text-white shadow-md' : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-verde'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  )
}
