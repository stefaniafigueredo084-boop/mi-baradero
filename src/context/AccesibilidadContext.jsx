import { createContext, useContext, useEffect, useState } from 'react'

const CLAVE = 'mibaradero_accesibilidad'

export const TAMANOS_FUENTE = [
  { id: 'pequena', label: 'A', escala: '87.5%', descripcion: 'Chica' },
  { id: 'normal', label: 'A', escala: '100%', descripcion: 'Normal' },
  { id: 'grande', label: 'A', escala: '112.5%', descripcion: 'Grande' },
  { id: 'muy-grande', label: 'A', escala: '125%', descripcion: 'Muy grande' },
]

function valoresIniciales() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || 'null')
    if (guardado) return guardado
  } catch {
    /* usar default */
  }
  const prefiereOscuro = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return { tema: prefiereOscuro ? 'oscuro' : 'claro', tamanoFuente: 'normal', lector: false }
}

const AccesibilidadContext = createContext(null)

export function AccesibilidadProvider({ children }) {
  const [config, setConfig] = useState(valoresIniciales)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', config.tema === 'oscuro')
    const tamano = TAMANOS_FUENTE.find(t => t.id === config.tamanoFuente) || TAMANOS_FUENTE[1]
    document.documentElement.style.fontSize = tamano.escala
    localStorage.setItem(CLAVE, JSON.stringify(config))
  }, [config])

  const setTema = tema => setConfig(c => ({ ...c, tema }))
  const setTamanoFuente = tamanoFuente => setConfig(c => ({ ...c, tamanoFuente }))
  const setLector = lector => setConfig(c => ({ ...c, lector }))

  return (
    <AccesibilidadContext.Provider value={{ ...config, setTema, setTamanoFuente, setLector }}>
      {children}
    </AccesibilidadContext.Provider>
  )
}

export function useAccesibilidad() {
  return useContext(AccesibilidadContext)
}
