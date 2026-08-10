import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'

// Pasajes vendidos (pagados, hayan embarcado o no) para un horario y
// fecha puntuales — a diferencia del contador de embarques escaneados,
// esto le muestra al conductor cuánta gente compró pasaje para el viaje
// antes de salir, no solo a quién ya subió.
export function usePasajesVendidos(horarioId, fecha) {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!horarioId || !fecha) {
      setItems([])
      setCargando(true)
      return
    }
    setCargando(true)
    const q = query(
      collection(db, 'pasajes'),
      where('horarioId', '==', horarioId),
      where('fecha', '==', fecha),
      where('estado', '==', 'confirmado')
    )
    return onSnapshot(
      q,
      snap => {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setCargando(false)
      },
      () => setCargando(false)
    )
  }, [horarioId, fecha])

  return { items, cargando }
}
