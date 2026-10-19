import { useEffect, useState } from 'react'
import { EVENTO_PERFIL, guardarZonaVecino, zonaVecino } from '../utils/perfilLocal'

// Zona elegida por el vecino, sincronizada entre pantallas y pestañas.
export function useZonaVecino() {
  const [zona, setZona] = useState(zonaVecino)
  useEffect(() => {
    const actualizar = () => setZona(zonaVecino())
    window.addEventListener(EVENTO_PERFIL, actualizar)
    window.addEventListener('storage', actualizar)
    return () => {
      window.removeEventListener(EVENTO_PERFIL, actualizar)
      window.removeEventListener('storage', actualizar)
    }
  }, [])
  return [zona, guardarZonaVecino]
}
