import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { Check, Loader2, CalendarDays } from 'lucide-react'
import { db } from '../../firebase'
import { calendarioResiduosDefault } from '../../data/panelCampos'
import { registrarHistorial } from '../../utils/historial'
import Esqueleto from '../Esqueleto'

export default function CalendarioResiduos() {
  const [dias, setDias] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'calendarioResiduos'), snap => {
      setDias(snap.exists() ? snap.data().dias : calendarioResiduosDefault)
    }, () => {
      // Sin conexión o sin permiso: se muestra el calendario por defecto
      // en vez de quedarse en "Cargando..." para siempre.
      setDias(d => d ?? calendarioResiduosDefault)
      setError('No se pudo cargar el calendario guardado. Revisá tu conexión y recargá la página.')
    })
  }, [])

  const cambiarDia = (indice, campo, valor) => {
    setDias(prev => prev.map((d, i) => (i === indice ? { ...d, [campo]: valor } : d)))
  }

  const guardar = async () => {
    setGuardando(true)
    setError('')
    try {
      await setDoc(doc(db, 'config', 'calendarioResiduos'), { dias })
      registrarHistorial({ tipo: 'editar', seccion: 'residuos', detalle: 'Calendario de recolección actualizado' })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    } catch {
      setError('No se pudo guardar el calendario. Probá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  if (!dias) return <div className="card p-4 mb-8"><Esqueleto filas={4} alto="h-10" /></div>

  return (
    <div className="card p-4 mb-8">
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-acento" /> Calendario semanal de recolección
      </h3>
      <div className="space-y-2">
        {dias.map((d, i) => (
          <div key={d.dia} className="grid grid-cols-2 sm:grid-cols-[110px_1fr_150px] gap-2 items-center bg-gray-50 rounded p-3">
            <span className="font-semibold text-gray-700 text-sm">{d.dia}</span>
            <input
              className="input-field !py-2.5 !text-sm"
              value={d.tipo}
              onChange={e => cambiarDia(i, 'tipo', e.target.value)}
              placeholder="Ej: Reciclables"
            />
            <select
              className="select-field !py-2.5 !text-sm"
              value={d.color}
              onChange={e => cambiarDia(i, 'color', e.target.value)}
            >
              <option value="verde">Verde</option>
              <option value="azul">Azul</option>
              <option value="gris">Gris (sin servicio)</option>
            </select>
          </div>
        ))}
      </div>
      <button onClick={guardar} disabled={guardando} className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-60">
        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {guardado ? 'Guardado' : 'Guardar calendario'}
      </button>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-3 mt-3">{error}</p>}
    </div>
  )
}
