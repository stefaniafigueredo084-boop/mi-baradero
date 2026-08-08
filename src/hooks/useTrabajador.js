import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Rol y sector asignado a la cuenta logueada (trabajadores/{uid}).
// Si la cuenta no tiene un documento todavía (por ejemplo, una cuenta
// creada a mano desde Firebase Console antes de que existiera este
// sistema de roles, o la primera vez que se usa el panel) se le crea
// automáticamente uno con rol "admin" — así nadie queda afuera del
// panel por accidente, y las Reglas de Seguridad de Firestore (que
// exigen que el documento exista) tienen algo para leer desde el primer
// login.
export function useTrabajador(uid) {
  const [trabajador, setTrabajador] = useState(undefined) // undefined = cargando

  useEffect(() => {
    if (!uid) {
      setTrabajador(undefined)
      return
    }
    let creando = false
    return onSnapshot(doc(db, 'trabajadores', uid), snap => {
      if (snap.exists()) {
        setTrabajador(snap.data())
        return
      }
      setTrabajador({ rol: 'admin' })
      if (!creando) {
        creando = true
        setDoc(doc(db, 'trabajadores', uid), { email: auth.currentUser?.email || '', rol: 'admin' }).catch(() => {})
      }
    })
  }, [uid])

  return trabajador
}
