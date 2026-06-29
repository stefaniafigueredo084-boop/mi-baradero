import { useState, useEffect } from 'react'
import { estadosCombi } from '../data/combiData'

export function useCombiSimulation() {
  const [estadoIndex, setEstadoIndex] = useState(0)
  const [posicion, setPosicion] = useState({ x: 15, y: 50 })
  const [progreso, setProgreso] = useState(0)

  const waypoints = [
    { x: 15, y: 50 },
    { x: 25, y: 45 },
    { x: 35, y: 38 },
    { x: 45, y: 42 },
    { x: 55, y: 50 },
    { x: 65, y: 57 },
    { x: 75, y: 65 },
    { x: 65, y: 57 },
    { x: 55, y: 50 },
    { x: 35, y: 38 },
    { x: 15, y: 50 },
  ]

  useEffect(() => {
    let step = 0
    const interval = setInterval(() => {
      step = (step + 1) % waypoints.length
      setPosicion(waypoints[step])
      setProgreso(Math.round((step / waypoints.length) * 100))

      const estadoIdx = Math.floor((step / waypoints.length) * estadosCombi.length)
      setEstadoIndex(estadoIdx % estadosCombi.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return {
    estadoActual: estadosCombi[estadoIndex],
    posicion,
    progreso,
  }
}
