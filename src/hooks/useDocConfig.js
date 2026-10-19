import { useEffect, useRef, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

// Escucha un documento config/{nombreDoc} que publica el panel de
// trabajadores (estado del camión, calendario de residuos...). Mientras
// no exista o no haya conexión, devuelve el valor por defecto.
export function useDocConfig(nombreDoc, valorInicial, extraer) {
  const [valor, setValor] = useState(valorInicial)
  const extraerRef = useRef(extraer)
  extraerRef.current = extraer
  useEffect(() => {
    return onSnapshot(doc(db, 'config', nombreDoc), snap => {
      if (snap.exists()) setValor(extraerRef.current(snap.data()))
    }, () => {
      // Sin conexión: se queda con el valor por defecto.
    })
  }, [nombreDoc])
  return valor
}
