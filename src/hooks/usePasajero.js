import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { idVecino } from '../utils/perfilLocal'

// Escucha en vivo el documento de pasajero de este dispositivo
// (pasajeros/{idVecino()}) — la categoría verificada (permanente:
// estudiante/jubilado/discapacidad), necesaria para enterarse cuando un
// empleado aprueba o rechaza la solicitud, algo que el propio
// dispositivo no puede saber de otra forma. Si todavía no existe (nunca
// pidió ninguna categoría especial), pasajero es null — sigue pudiendo
// comprar pasajes "Común" igual.
export function usePasajero() {
  const [pasajero, setPasajero] = useState(undefined) // undefined = cargando

  useEffect(() => {
    return onSnapshot(
      doc(db, 'pasajeros', idVecino()),
      snap => setPasajero(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      () => setPasajero(null)
    )
  }, [])

  return { pasajero, cargando: pasajero === undefined }
}
