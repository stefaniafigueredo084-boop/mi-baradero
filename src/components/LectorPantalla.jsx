import { useEffect, useState } from 'react'
import { Mic, Volume2, VolumeX } from 'lucide-react'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import AsistenteVoz from './AsistenteVoz'

// Botones flotantes de accesibilidad: lector de página (voz → texto de
// la pantalla) y asistente de registro por voz (texto/voz → perfil).
// Ambos usan la síntesis/reconocimiento de voz nativos del navegador.
export default function LectorPantalla() {
  const { lector } = useAccesibilidad()
  const [leyendo, setLeyendo] = useState(false)
  const [asistenteAbierto, setAsistenteAbierto] = useState(false)

  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  if (!lector) return null

  const soportado = typeof window !== 'undefined' && 'speechSynthesis' in window

  const alternarLectura = () => {
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
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3 items-end">
        <button
          onClick={() => setAsistenteAbierto(true)}
          aria-label="Registrarme por voz"
          title="Registrarme por voz"
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 bg-azul text-white"
        >
          <Mic className="w-6 h-6" />
        </button>
        <button
          onClick={alternarLectura}
          disabled={!soportado}
          aria-label={leyendo ? 'Detener lectura de la página' : 'Leer esta página en voz alta'}
          title={soportado ? (leyendo ? 'Detener lectura' : 'Leer esta página en voz alta') : 'Tu navegador no soporta lectura de voz'}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:hover:scale-100 ${
            leyendo ? 'bg-red-500 text-white animate-pulse' : 'bg-verde text-white'
          }`}
        >
          {leyendo ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {asistenteAbierto && <AsistenteVoz onClose={() => setAsistenteAbierto(false)} />}
    </>
  )
}
