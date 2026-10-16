import { idVecino } from '../utils/perfilLocal'
import { idPasaje } from '../utils/pase'
import { useDocPropio } from './useDocPropio'

// Escucha en vivo el pasaje de este dispositivo para un horario y fecha
// puntuales (id determinístico: pasajeroId_horarioId_fecha). null si
// todavía no se compró ningún pasaje para ese viaje.
export function usePasaje(horarioId, fecha) {
  const id = horarioId && fecha ? idPasaje(idVecino(), horarioId, fecha) : null
  const pasaje = useDocPropio('pasajes', id)
  return { id, pasaje, cargando: pasaje === undefined }
}
