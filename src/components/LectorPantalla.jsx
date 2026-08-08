import { useEffect, useRef, useState } from 'react'
import { Mic, Volume2, VolumeX } from 'lucide-react'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { soportaReconocimientoVoz, hablar, detenerVoz } from '../utils/voz'
import AsistenteVoz from './AsistenteVoz'

const PALABRAS_ACTIVACION = ['asistente', 'mi baradero']

// Botones flotantes de accesibilidad: lector de página (voz → texto de
// la pantalla) y asistente de registro por voz (texto/voz → perfil).
//
// Para que un vecino no vidente no tenga que estar tocando la pantalla
// cada vez, mientras "Lector de pantalla" está activo el sitio queda
// escuchando en segundo plano una palabra de activación ("asistente" o
// "Mi Baradero"): al detectarla, abre el asistente solo, sin clics. El
// único click imprescindible es el de conceder permiso de micrófono la
// primera vez — eso lo exige el navegador por seguridad y no se puede
// evitar en ningún sitio web.
export default function LectorPantalla() {
  const { lector } = useAccesibilidad()
  const [leyendo, setLeyendo] = useState(false)
  const [asistenteAbierto, setAsistenteAbierto] = useState(false)
  const [escuchandoActivacion, setEscuchandoActivacion] = useState(false)
  const asistenteAbiertoRef = useRef(asistenteAbierto)
  asistenteAbiertoRef.current = asistenteAbierto

  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  // Escucha continua de la palabra de activación.
  useEffect(() => {
    if (!lector || asistenteAbierto || leyendo || !soportaReconocimientoVoz()) {
      setEscuchandoActivacion(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const reconocimiento = new SR()
    reconocimiento.lang = 'es-AR'
    reconocimiento.continuous = true
    reconocimiento.interimResults = true

    let activo = true
    let temporizadorReinicio

    const detecto = texto => PALABRAS_ACTIVACION.some(palabra => texto.toLowerCase().includes(palabra))

    reconocimiento.onresult = e => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (detecto(e.results[i][0].transcript)) {
          activo = false
          try { reconocimiento.stop() } catch { /* ya detenido */ }
          setAsistenteAbierto(true)
          return
        }
      }
    }

    reconocimiento.onerror = e => {
      // "no-speech" pasa todo el tiempo (silencio normal) — se reinicia solo.
      // Si el permiso fue rechazado no tiene sentido seguir reintentando.
      if (e.error === 'not-allowed' || e.error === 'audio-capture') {
        activo = false
      }
    }

    reconocimiento.onend = () => {
      if (activo && !asistenteAbiertoRef.current) {
        temporizadorReinicio = setTimeout(() => {
          try { reconocimiento.start() } catch { /* el navegador puede tardar en soltar el micrófono */ }
        }, 300)
      }
    }

    try {
      reconocimiento.start()
      setEscuchandoActivacion(true)
    } catch {
      setEscuchandoActivacion(false)
    }

    return () => {
      activo = false
      clearTimeout(temporizadorReinicio)
      setEscuchandoActivacion(false)
      try { reconocimiento.stop() } catch { /* ya detenido */ }
    }
  }, [lector, asistenteAbierto, leyendo])

  if (!lector) return null

  const soportado = typeof window !== 'undefined' && 'speechSynthesis' in window

  const alternarLectura = async () => {
    if (!soportado) return
    if (leyendo) {
      detenerVoz()
      setLeyendo(false)
      return
    }
    const contenido = document.querySelector('main')?.innerText || document.body.innerText
    setLeyendo(true)
    await hablar(contenido)
    setLeyendo(false)
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3 items-end">
        <button
          onClick={() => setAsistenteAbierto(true)}
          aria-label="Registrarme por voz"
          title={escuchandoActivacion ? 'Escuchando… decí "asistente" para activarme, o tocá acá' : 'Registrarme por voz'}
          className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 bg-azul text-white`}
        >
          <Mic className="w-6 h-6" />
          {escuchandoActivacion && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-verde border-2 border-white animate-pulse" />
          )}
        </button>
        <button
          onClick={alternarLectura}
          disabled={!soportado}
          aria-label={leyendo ? 'Detener lectura de la página' : 'Leer esta página en voz alta'}
          title={soportado ? (leyendo ? 'Detener lectura' : 'Leer esta página en voz alta') : 'Tu navegador no soporta lectura de voz'}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:hover:scale-100 ${
            leyendo ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-300'
          }`}
        >
          {leyendo ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {asistenteAbierto && <AsistenteVoz onClose={() => setAsistenteAbierto(false)} />}
    </>
  )
}
