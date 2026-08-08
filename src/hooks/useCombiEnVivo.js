import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { paradas } from '../data/combiData'

// Si un trabajador marcó una parada desde el panel (config/combiEnVivo),
// devuelve la posición real. Si no hay nada marcado, devuelve null y la
// página cae de vuelta a la simulación local (useCombiSimulation).
export function useCombiEnVivo() {
  const [paradaId, setParadaId] = useState(null)

  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'combiEnVivo'), snap => {
      setParadaId(snap.exists() ? snap.data().paradaId : null)
    })
  }, [])

  if (!paradaId) return null
  const indice = paradas.findIndex(p => p.id === paradaId)
  if (indice === -1) return null
  const parada = paradas[indice]

  return {
    estadoActual: `Combi en ${parada.nombre}`,
    posicion: { x: parada.posX, y: parada.posY },
    progreso: Math.round((indice / (paradas.length - 1)) * 100),
    paradaId,
  }
}
