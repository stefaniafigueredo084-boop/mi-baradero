import { useMemo } from 'react'
import { useColeccion } from './useColeccion'
import { horarios as horariosFijos } from '../data/combiData'

// Horarios de la combi: los fijos de combiData.js, reemplazados por su
// versión editada desde el panel de trabajadores si ya se cargó una.
// Compartido entre la página pública, "Mi Pase" y el escáner del
// conductor — antes esta misma lista se armaba por separado en cada uno.
export function useHorariosCombi() {
  const { items: horariosLive } = useColeccion('horariosCombi')
  return useMemo(() => [
    ...horariosFijos.filter(h => !horariosLive.some(lh => lh.idOriginal === h.id)),
    ...horariosLive,
  ], [horariosLive])
}
