import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

// Lista completa de cuentas del panel (trabajadores/{uid}). Sin
// "orderBy" a propósito: muchas cuentas viejas no tienen "creadoEn"
// (ese campo se sumó después) y quedarían invisibles con un
// useColeccion común, que sí ordena por esa fecha.
export function useTrabajadores() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    return onSnapshot(
      collection(db, 'trabajadores'),
      snap => {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setCargando(false)
      },
      () => setCargando(false)
    )
  }, [])

  return { items, cargando }
}
