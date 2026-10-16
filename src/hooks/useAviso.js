import { useEffect, useRef, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { mostrarNotificacion } from '../utils/notificaciones'
import { sinEmojis } from '../utils/texto'

// Un aviso guardado antes de sacar los emojis del sitio puede traer
// alguno en el texto: se limpia al leerlo.
const limpiarAviso = datos =>
  Object.fromEntries(Object.entries(datos).map(([clave, valor]) => [clave, typeof valor === 'string' ? sinEmojis(valor) : valor]))

// Escucha el documento config/{nombreDoc} donde el panel de trabajadores
// publica avisos puntuales (EnviarAviso). Devuelve el último aviso, y si
// "activo" es true dispara una notificación del navegador cada vez que
// llega uno nuevo (comparando por su timestamp "enviadoEn").
export function useAviso(nombreDoc, activo, formatear, sector) {
  const [aviso, setAviso] = useState(null)
  const activoRef = useRef(activo)
  activoRef.current = activo
  // formatear suele ser una función nueva en cada render: va por ref para
  // no reabrir la escucha de Firestore cada vez.
  const formatearRef = useRef(formatear)
  formatearRef.current = formatear
  const sectorRef = useRef(sector)
  sectorRef.current = sector
  const ultimoEnviadoEn = useRef(undefined)

  useEffect(() => {
    return onSnapshot(doc(db, 'config', nombreDoc), snap => {
      const datos = snap.exists() ? limpiarAviso(snap.data()) : null
      setAviso(datos)
      if (ultimoEnviadoEn.current === undefined) {
        ultimoEnviadoEn.current = datos?.enviadoEn ?? null
        return
      }
      if (datos && datos.enviadoEn !== ultimoEnviadoEn.current) {
        ultimoEnviadoEn.current = datos.enviadoEn
        if (activoRef.current) {
          const { title, body } = formatearRef.current(datos)
          mostrarNotificacion(title, { body, icon: '/logo-mibaradero.png' }, sectorRef.current)
        }
      }
    }, () => setAviso(null))
  }, [nombreDoc])

  return aviso
}
