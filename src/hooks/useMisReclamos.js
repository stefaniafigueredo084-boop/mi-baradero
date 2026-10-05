import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const CLAVE = 'mibaradero_reclamos'

// Los vecinos no pueden listar la colección "reclamos" (eso es solo del
// panel), pero sí leer UN reclamo cuyo id ya conocen. Por eso cada
// dispositivo recuerda acá los ids de los reclamos que mandó, igual que
// hace con su pase de combi.
export function leerIdsReclamos() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || '[]')
    return Array.isArray(guardado) ? guardado : []
  } catch {
    return []
  }
}

export function recordarReclamo(id) {
  const ids = [id, ...leerIdsReclamos().filter(i => i !== id)].slice(0, 30)
  try {
    localStorage.setItem(CLAVE, JSON.stringify(ids))
  } catch {
    // Sin espacio o localStorage bloqueado: el reclamo igual se envió,
    // solo no va a aparecer en "Mis reclamos" de este dispositivo.
  }
  return ids
}

// Escucha en vivo cada reclamo enviado desde este dispositivo, para que
// el vecino vea el cambio de estado y la respuesta apenas un empleado
// la carga. Un reclamo que el municipio eliminó simplemente deja de
// aparecer.
export function useMisReclamos(ids) {
  const [porId, setPorId] = useState({})
  const clave = ids.join(',')

  useEffect(() => {
    setPorId(previo => Object.fromEntries(Object.entries(previo).filter(([id]) => ids.includes(id))))
    const desuscribir = ids.map(id =>
      onSnapshot(
        doc(db, 'reclamos', id),
        snap => setPorId(previo => ({ ...previo, [id]: snap.exists() ? { id, ...snap.data() } : null })),
        () => setPorId(previo => ({ ...previo, [id]: null }))
      )
    )
    return () => desuscribir.forEach(fn => fn())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  return {
    reclamos: ids.map(id => porId[id]).filter(Boolean),
    cargando: ids.some(id => porId[id] === undefined),
  }
}
