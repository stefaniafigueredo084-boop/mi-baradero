import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

// Escucha en tiempo real una colección de Firestore ordenada por fecha
// de creación (más nuevo primero). Usado tanto por el panel de
// trabajadores (para listar/editar) como por las páginas públicas.
export function useColeccion(nombreColeccion) {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const q = query(collection(db, nombreColeccion), orderBy('creadoEn', 'desc'))
    return onSnapshot(
      q,
      snap => {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setCargando(false)
      },
      () => setCargando(false)
    )
  }, [nombreColeccion])

  return { items, cargando }
}
