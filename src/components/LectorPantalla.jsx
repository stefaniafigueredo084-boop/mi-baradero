import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useAccesibilidad } from '../context/AccesibilidadContext'

// Botón flotante para no videntes / baja visión: lee en voz alta el
// contenido principal de la página actual, usando la síntesis de voz
// nativa del navegador (no necesita ningún servicio externo).
export default function LectorPantalla() {
  const { lector } = useAccesibilidad()
  const [leyendo, setLeyendo] = useState(false)

  useEffect(() => {
    // Si se desactiva la función o se cambia de página, cortar cualquier
    // lectura en curso.
    return () => window.speechSynthesis?.cancel()
  }, [])

  if (!lector) return null

  const soportado = typeof window !== 'undefined' && 'speechSynthesis' in window

  const alternar = () => {
    if (!soportado) return
    const synth = window.speechSynthesis
    if (leyendo) {
      synth.cancel()
      setLeyendo(false)
      return
    }
    const contenido = document.querySelector('main')?.innerText || document.body.innerText
    const utterance = new SpeechSynthesisUtterance(contenido)
    utterance.lang = 'es-AR'
    utterance.onend = () => setLeyendo(false)
    utterance.onerror = () => setLeyendo(false)
    synth.cancel()
    synth.speak(utterance)
    setLeyendo(true)
  }

  return (
    <button
      onClick={alternar}
      disabled={!soportado}
      aria-label={leyendo ? 'Detener lectura de la página' : 'Leer esta página en voz alta'}
      title={soportado ? (leyendo ? 'Detener lectura' : 'Leer esta página en voz alta') : 'Tu navegador no soporta lectura de voz'}
      className={`fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:hover:scale-100 ${
        leyendo ? 'bg-red-500 text-white animate-pulse' : 'bg-verde text-white'
      }`}
    >
      {leyendo ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
    </button>
  )
}
