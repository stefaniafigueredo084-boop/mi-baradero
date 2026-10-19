import { useMemo } from 'react'
import { useColeccion } from './useColeccion'
import { useDocConfig } from './useDocConfig'
import { calendario as calendarioFijo, zonas as zonasFijas } from '../data/residuosData'

// Calendario semanal de recolección (el del panel, o el fijo).
export function useCalendarioResiduos() {
  return useDocConfig('calendarioResiduos', calendarioFijo, d => d.dias)
}

// Zonas de recolección: las fijas de residuosData.js, reemplazadas por
// su versión editada desde el panel si ya se cargó una.
export function useZonasResiduos() {
  const { items: zonasLive } = useColeccion('zonasResiduos')
  return useMemo(() => [
    ...zonasFijas.filter(z => !zonasLive.some(lz => lz.idOriginal === z.id)),
    ...zonasLive,
  ], [zonasLive])
}
