import { useEffect, useRef, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

// Escucha el documento config/{nombreDoc} donde el panel de trabajadores
// publica avisos puntuales (EnviarAviso). Devuelve el último aviso, y si
// "activo" es true dispara una notificación del navegador cada vez que
// llega uno nuevo (comparando por su timestamp "enviadoEn").
export function useAviso(nombreDoc, activo, formatear) {
  const [aviso, setAviso] = useState(null)
  const activoRef = useRef(activo)
  activoRef.current = activo
  const ultimoEnviadoEn = useRef(undefined)

  useEffect(() => {
    return onSnapshot(doc(db, 'config', nombreDoc), snap => {
      const datos = snap.exists() ? snap.data() : null
      setAviso(datos)
      if (ultimoEnviadoEn.current === undefined) {
        ultimoEnviadoEn.current = datos?.enviadoEn ?? null
        return
      }
      if (datos && datos.enviadoEn !== ultimoEnviadoEn.current) {
        ultimoEnviadoEn.current = datos.enviadoEn
        if (activoRef.current && Notification.permission === 'granted') {
          const { title, body } = formatear(datos)
          new Notification(title, { body, icon: '/logo-mibaradero.png' })
        }
      }
    })
  }, [nombreDoc])

  return aviso
}
