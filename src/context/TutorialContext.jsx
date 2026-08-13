import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SECTORES_TOUR } from '../data/tutorialContenido'

const CLAVE_VISTO = 'mibaradero_tutorial_visto'

const yaLoVio = () => localStorage.getItem(CLAVE_VISTO) === 'true'
const marcarVisto = () => localStorage.setItem(CLAVE_VISTO, 'true')

const ESTADO_INICIAL = {
  paso: 'oculto', // oculto | saludo | elegirModo | menuSectores | explicando | preguntarOtro
  modo: null, // 'todo' | 'uno' | null
  indice: 0, // posición dentro de SECTORES_TOUR cuando modo === 'todo'
  sectorId: null,
  pasoSector: 0, // posición dentro de los "pasos" del sector actual
}

const TutorialContext = createContext(null)

export function TutorialProvider({ children }) {
  const [estado, setEstado] = useState(ESTADO_INICIAL)
  const navigate = useNavigate()
  const yaOfrecido = useRef(false)

  // Se ofrece solo, una única vez, la primera vez que alguien entra al
  // sitio y todavía no vio el tutorial (ni lo cerró antes). No compite
  // con el saludo por voz de App.jsx: ese solo habla si ya hay un
  // nombre guardado, y quien nunca vio este tutorial normalmente
  // todavía no se registró.
  useEffect(() => {
    if (yaOfrecido.current || yaLoVio()) return
    yaOfrecido.current = true
    const temporizador = setTimeout(() => setEstado(e => ({ ...e, paso: 'saludo' })), 1200)
    return () => clearTimeout(temporizador)
  }, [])

  const ocultar = () => setEstado(ESTADO_INICIAL)

  const parar = () => {
    marcarVisto()
    ocultar()
  }

  const irASector = (sectorId, modo, indice = 0) => {
    const sector = SECTORES_TOUR.find(s => s.id === sectorId)
    if (!sector) return
    navigate(sector.ruta)
    setEstado({ paso: 'explicando', modo, indice, sectorId, pasoSector: 0 })
  }

  const acciones = {
    // Botón de ayuda del Header: si ya lo vio antes, no hace falta
    // volver a preguntar "¿querés que te explique?" — ir directo a
    // elegir qué quiere ver.
    abrirManualmente: () => setEstado(e => ({ ...e, paso: yaLoVio() ? 'elegirModo' : 'saludo' })),
    decirNo: parar,
    decirSi: () => setEstado(e => ({ ...e, paso: 'elegirModo' })),
    elegirTodoElRecorrido: () => irASector(SECTORES_TOUR[0].id, 'todo', 0),
    elegirUnSector: () => setEstado(e => ({ ...e, paso: 'menuSectores' })),
    elegirSector: sectorId => irASector(sectorId, 'uno'),
    siguiente: () => {
      setEstado(e => {
        const sectorActual = SECTORES_TOUR.find(s => s.id === e.sectorId)
        // Primero se agotan los pasos DENTRO del sector actual (ej: los
        // 4 pasos de "cómo comprar el pasaje") antes de pasar al
        // siguiente sector o preguntar si quiere ver otro.
        if (sectorActual && e.pasoSector + 1 < sectorActual.pasos.length) {
          return { ...e, pasoSector: e.pasoSector + 1 }
        }
        if (e.modo === 'todo') {
          const siguienteIndice = e.indice + 1
          if (siguienteIndice < SECTORES_TOUR.length) {
            const siguienteSector = SECTORES_TOUR[siguienteIndice]
            navigate(siguienteSector.ruta)
            return { ...e, indice: siguienteIndice, sectorId: siguienteSector.id, pasoSector: 0 }
          }
          marcarVisto()
          return ESTADO_INICIAL
        }
        return { ...e, paso: 'preguntarOtro' }
      })
    },
    quiereOtroSi: () => setEstado(e => ({ ...e, paso: 'menuSectores' })),
    quiereOtroNo: parar,
    parar,
  }

  return (
    <TutorialContext.Provider value={{ ...estado, ...acciones }}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  return useContext(TutorialContext)
}
