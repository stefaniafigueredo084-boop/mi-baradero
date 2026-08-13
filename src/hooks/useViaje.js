import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { idViaje, fechaHoy, salidaTimestamp, calcularAsientos, PLANTILLA_VIAJE_DEFAULT } from '../utils/pase'

const CONTADORES_VACIOS = { embarcadosGeneral: 0, embarcadosDiscapacidad: 0, embarcadosJubilado: 0 }

// Estado en vivo de "hoy" para un horario de combi. Mientras nadie
// escaneó todavía, no existe el documento viajes/{...} (se crea recién
// con el primer embarque, dentro de la transacción del escáner) — en
// ese caso mostramos capacidad completa libre, calculada a partir de la
// plantilla del horario.
export function useViaje(horario) {
  const fecha = fechaHoy()
  const id = horario ? idViaje(horario.id, fecha) : null
  const [viajeDoc, setViajeDoc] = useState(undefined)

  useEffect(() => {
    if (!id) return
    setViajeDoc(undefined)
    return onSnapshot(
      doc(db, 'viajes', id),
      snap => setViajeDoc(snap.exists() ? snap.data() : null),
      () => setViajeDoc(null)
    )
  }, [id])

  if (!horario) return null

  const config = {
    capacidadTotal: horario.capacidadTotal ?? PLANTILLA_VIAJE_DEFAULT.capacidadTotal,
    asientosReservadosDiscapacidad: horario.asientosReservadosDiscapacidad ?? PLANTILLA_VIAJE_DEFAULT.asientosReservadosDiscapacidad,
    asientosReservadosJubilados: horario.asientosReservadosJubilados ?? PLANTILLA_VIAJE_DEFAULT.asientosReservadosJubilados,
    minutosLiberacionReserva: horario.minutosLiberacionReserva ?? PLANTILLA_VIAJE_DEFAULT.minutosLiberacionReserva,
    horarioSalidaTs: viajeDoc?.horarioSalidaTs
      ? (typeof viajeDoc.horarioSalidaTs.toMillis === 'function' ? viajeDoc.horarioSalidaTs.toMillis() : viajeDoc.horarioSalidaTs)
      : salidaTimestamp(fecha, horario.salida),
  }

  return {
    id,
    fecha,
    config,
    cargando: viajeDoc === undefined,
    asientos: calcularAsientos(config, viajeDoc || CONTADORES_VACIOS),
  }
}
