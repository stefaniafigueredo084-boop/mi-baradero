import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { idVecino } from '../utils/perfilLocal'
import { idPasaje } from '../utils/pase'

// Escucha en vivo el pasaje de este dispositivo para un horario y fecha
// puntuales (id determinístico: pasajeroId_horarioId_fecha). null si
// todavía no se compró ningún pasaje para ese viaje.
export function usePasaje(horarioId, fecha) {
  const id = horarioId && fecha ? idPasaje(idVecino(), horarioId, fecha) : null
  const [pasaje, setPasaje] = useState(undefined) // undefined = cargando

  useEffect(() => {
    if (!id) {
      setPasaje(null)
      return
    }
    setPasaje(undefined)
    return onSnapshot(
      doc(db, 'pasajes', id),
      snap => setPasaje(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      () => setPasaje(null)
    )
  }, [id])

  return { id, pasaje, cargando: pasaje === undefined }
}
