import { useEffect, useState } from 'react'
import { collection, doc, getDocs, limit, onSnapshot, query, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Rol y sector asignado a la cuenta logueada (trabajadores/{uid}).
//
// Bootstrap: si la colección "trabajadores" está TOTALMENTE vacía (recién
// instalado el sistema, todavía no existe ni un admin) la primera cuenta
// que entra al panel se crea automáticamente como admin. Esto solo puede
// pasar una vez: apenas existe un trabajador, el bootstrap se desactiva
// para siempre y una cuenta sin documento propio queda sin acceso
// (trabajador = null).
//
// Esto es crítico ahora que la web pública permite que cualquier vecino
// se cree su propia cuenta (Google o email/contraseña) usando el mismo
// proyecto de Firebase Auth: sin este freno, un vecino que se registra y
// entra a /panel-trabajadores se volvería admin automáticamente.
export function useTrabajador(uid) {
  const [trabajador, setTrabajador] = useState(undefined) // undefined = cargando

  useEffect(() => {
    if (!uid) {
      setTrabajador(undefined)
      return
    }
    let cancelado = false
    const desuscribir = onSnapshot(doc(db, 'trabajadores', uid), async snap => {
      if (snap.exists()) {
        setTrabajador(snap.data())
        return
      }
      try {
        const otros = await getDocs(query(collection(db, 'trabajadores'), limit(1)))
        if (cancelado) return
        if (!otros.empty) {
          setTrabajador(null)
          return
        }
        setTrabajador({ rol: 'admin' })
        await setDoc(doc(db, 'trabajadores', uid), { email: auth.currentUser?.email || '', rol: 'admin' })
      } catch {
        // Sin permiso para ni siquiera consultar si hay otros trabajadores
        // (según las Reglas de Firestore, eso solo lo puede un admin o la
        // propia cuenta) → esta cuenta no es trabajador, sin acceso.
        if (!cancelado) setTrabajador(null)
      }
    })
    return () => {
      cancelado = true
      desuscribir()
    }
  }, [uid])

  return trabajador
}
