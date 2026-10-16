import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

// Escucha en vivo un documento que es de este vecino (su pase, un
// pasaje, un reclamo). Las Reglas solo dejan leerlo a su dueño (campo
// "uid" == el uid de la sesión) o al sector que lo atiende; si no se
// puede leer, se trata como que no existe.

// Versión sin hook (para escuchar varios documentos a la vez, como los
// reclamos de este dispositivo). onDato recibe { id, ...datos } o null.
export function escucharDocPropio(coleccion, id, onDato) {
  return onSnapshot(
    doc(db, coleccion, id),
    snap => onDato(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    () => onDato(null)
  )
}

// Devuelve undefined mientras carga, null si no existe (o no se puede
// leer), o { id, ...datos }. Espera a tener sesión (uid) para escuchar.
export function useDocPropio(coleccion, id) {
  const { uid } = useAuth()
  const [dato, setDato] = useState(undefined)

  useEffect(() => {
    if (!id) { setDato(null); return }
    if (uid === undefined) { setDato(undefined); return }
    if (uid === null) { setDato(null); return }
    setDato(undefined)
    return escucharDocPropio(coleccion, id, setDato)
  }, [coleccion, id, uid])

  return dato
}
