import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { Check, Loader2, CalendarDays } from 'lucide-react'
import { db } from '../../firebase'
import { calendarioResiduosDefault } from '../../data/panelCampos'
import { registrarHistorial } from '../../utils/historial'

export default function CalendarioResiduos() {
  const [dias, setDias] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'calendarioResiduos'), snap => {
      setDias(snap.exists() ? snap.data().dias : calendarioResiduosDefault)
    })
  }, [])

  const cambiarDia = (indice, campo, valor) => {
    setDias(prev => prev.map((d, i) => (i === indice ? { ...d, [campo]: valor } : d)))
  }

  const guardar = async () => {
    setGuardando(true)
    await setDoc(doc(db, 'config', 'calendarioResiduos'), { dias })
    registrarHistorial({ tipo: 'editar', seccion: 'residuos', detalle: 'Calendario de recolección actualizado' })
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  if (!dias) return <p className="text-gray-400 text-sm">Cargando...</p>

  return (
    <div className="card p-6 mb-8">
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-amarillo" /> Calendario semanal de recolección
      </h3>
      <div className="space-y-2">
        {dias.map((d, i) => (
          <div key={d.dia} className="grid grid-cols-2 sm:grid-cols-[110px_1fr_150px_70px] gap-2 items-center bg-gray-50 rounded-xl p-3">
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
            <input
              className="input-field !py-2.5 !text-sm text-center"
              value={d.icono}
              onChange={e => cambiarDia(i, 'icono', e.target.value)}
              placeholder="🗑️"
            />
          </div>
        ))}
      </div>
      <button onClick={guardar} disabled={guardando} className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-60">
        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {guardado ? 'Guardado ✓' : 'Guardar calendario'}
      </button>
    </div>
  )
}
