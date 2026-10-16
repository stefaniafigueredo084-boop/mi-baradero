import { useEffect, useState } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

// Escucha en vivo un documento que es de este vecino (su pase, un
// pasaje, un reclamo). Las Reglas solo dejan leerlo a su dueño (campo
// "uid" == el uid de la sesión) o al sector que lo atiende.
//
// Documentos de antes de que existiera el campo "uid" (creados con el
// id del dispositivo, sin sesión): la primera lectura se rechaza, así
// que se intenta "reclamarlo" una sola vez — escribir solo el uid, algo
// que las Reglas permiten únicamente si el documento todavía no tiene
// dueño — y se vuelve a escuchar.

// Versión sin hook (para escuchar varios documentos a la vez, como los
// reclamos de este dispositivo). onDato recibe { id, ...datos } o null.
export function escucharDocPropio(coleccion, id, uid, onDato) {
  const ref = doc(db, coleccion, id)
  let desuscribir = () => {}
  let cancelado = false
  let yaReclamado = false

  const escuchar = () => {
    desuscribir = onSnapshot(
      ref,
      snap => onDato(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      async error => {
        if (cancelado) return
        if (error.code === 'permission-denied' && !yaReclamado) {
          yaReclamado = true
          try {
            await updateDoc(ref, { uid })
            if (!cancelado) escuchar()
            return
          } catch {
            // Tiene otro dueño: no es de este vecino.
          }
        }
        onDato(null)
      }
    )
  }
  escuchar()
  return () => { cancelado = true; desuscribir() }
}

// Devuelve undefined mientras carga, null si no existe (o no se puede
// leer), o { id, ...datos }.
export function useDocPropio(coleccion, id) {
  const { uid } = useAuth()
  const [dato, setDato] = useState(undefined)

  useEffect(() => {
    if (!id) { setDato(null); return }
    if (uid === undefined) { setDato(undefined); return }
    if (uid === null) { setDato(null); return }
    setDato(undefined)
    return escucharDocPropio(coleccion, id, uid, setDato)
  }, [coleccion, id, uid])

  return dato
}
