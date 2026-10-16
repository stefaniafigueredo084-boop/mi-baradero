import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { escucharDocPropio } from './useDocPropio'

const CLAVE = 'mibaradero_reclamos'

// Los vecinos no pueden listar la colección "reclamos" (eso es solo del
// panel), pero sí leer los reclamos que crearon ellos (campo uid). Por eso cada
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
  const { uid } = useAuth()
  const [porId, setPorId] = useState({})
  const clave = ids.join(',')

  useEffect(() => {
    setPorId(previo => Object.fromEntries(Object.entries(previo).filter(([id]) => ids.includes(id))))
    if (!uid) return
    const desuscribir = ids.map(id =>
      escucharDocPropio('reclamos', id, uid, dato => setPorId(previo => ({ ...previo, [id]: dato })))
    )
    return () => desuscribir.forEach(fn => fn())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, uid])

  return {
    reclamos: ids.map(id => porId[id]).filter(Boolean),
    cargando: uid === undefined || ids.some(id => porId[id] === undefined),
  }
}
