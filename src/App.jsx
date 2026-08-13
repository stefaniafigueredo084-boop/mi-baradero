import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Mic } from 'lucide-react'
import Header from './components/Header'
import Footer from './components/Footer'
import LectorPantalla from './components/LectorPantalla'
import Tachin from './components/tachin/Tachin'
import { TutorialProvider } from './context/TutorialContext'
import Home from './pages/Home'
import CombiMunicipal from './pages/CombiMunicipal'
import Residuos from './pages/Residuos'
import Eventos from './pages/Eventos'
import PuntosVerdes from './pages/PuntosVerdes'
import Perfil from './pages/Perfil'
import PanelTrabajadores from './pages/PanelTrabajadores'
import { nombreVecino } from './utils/perfilLocal'
import { hablar, escuchar, soportaSintesisVoz, soportaReconocimientoVoz } from './utils/voz'
import { interpretarComandoVoz } from './data/comandosVoz'
import { useAccesibilidad } from './context/AccesibilidadContext'

// El navegador, por su cuenta, intenta "recordar" el scroll de cada
// página y restaurarlo solo — eso compite con el scroll-to-top manual
// de Tachín (a veces gana el navegador y la página queda a mitad de
// camino en vez de arriba de todo). Lo desactivamos una sola vez acá:
// de ahora en más, el scroll de cada página lo maneja únicamente
// nuestro propio código.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  // El panel de trabajadores tiene su propio header (login/logout) y no
  // debe mostrar la navegación pública.
  const esPanelTrabajadores = location.pathname === '/panel-trabajadores'
  const { lector } = useAccesibilidad()
  const [escuchandoSaludo, setEscuchandoSaludo] = useState(false)

  // React Router (a diferencia de una página tradicional) NO resetea el
  // scroll al cambiar de ruta: si entrabas a una página nueva estando
  // scrolleado abajo del todo en la anterior, la página nueva arrancaba
  // ahí mismo, a mitad de camino. Esto corre para cualquier cambio de
  // ruta (menú, footer, Tachín, etc.), no solo dentro del recorrido
  // guiado. "instant" a propósito: si fuera "smooth" respetaría el
  // scroll-behavior global del sitio y podría cortarse a mitad de
  // camino si la página nueva todavía está acomodando su altura.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  // Saluda por voz al abrir la app, si el vecino ya se registró antes
  // (nombre guardado en este dispositivo) Y tiene activado "Lector de
  // pantalla" — si no lo activó, hablarle de la nada sin haberlo pedido
  // es más un susto que una ayuda. Se dispara una sola vez, al montar
  // la app (no en cada cambio de página dentro del sitio).
  //
  // Después del saludo, si el navegador soporta reconocimiento de voz,
  // le pregunta a dónde quiere ir y escucha la respuesta — así alguien
  // que no ve bien la pantalla puede llegar directo a la sección que
  // busca sin tener que tocar nada. Si no entiende lo que dijo, o si la
  // persona no contesta nada, no insiste: se queda en la página de
  // siempre, sin trabar el resto del uso normal de la app.
  const yaSaludo = useRef(false)
  useEffect(() => {
    if (yaSaludo.current) return
    yaSaludo.current = true
    if (esPanelTrabajadores || !soportaSintesisVoz() || !lector) return
    const nombre = nombreVecino()
    if (!nombre) return

    let cancelado = false
    const temporizador = setTimeout(async () => {
      await hablar(`Hola de nuevo, ${nombre}. Qué bueno tenerte otra vez en Mi Baradero.`)
      if (cancelado || !soportaReconocimientoVoz()) return

      await hablar('¿Qué querés hacer? Podés decirme, por ejemplo: combi, residuos, eventos, puntos verdes, o tu perfil.')
      if (cancelado) return
      setEscuchandoSaludo(true)
      try {
        const dicho = await escuchar()
        if (cancelado) return
        const comando = interpretarComandoVoz(dicho)
        if (comando) {
          await hablar(`Dale, te llevo a ${comando.etiqueta}.`)
          if (!cancelado) navigate(comando.ruta)
        } else {
          await hablar('No te puedo ayudar con esta pregunta. Capaz que Tachín, que te muestra cómo funciona la app, te puede ayudar.')
        }
      } catch {
        // No dijo nada, no dio permiso de micrófono, o hubo un error —
        // no insiste ni interrumpe: contestar esto es opcional.
      } finally {
        if (!cancelado) setEscuchandoSaludo(false)
      }
    }, 800)
    return () => { cancelado = true; clearTimeout(temporizador) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {!esPanelTrabajadores && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/combi" element={<CombiMunicipal />} />
          <Route path="/residuos" element={<Residuos />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/puntos-verdes" element={<PuntosVerdes />} />
          <Route path="/perfil" element={<Perfil />} />
          {/* Mi Pase pasó a ser una sección dentro de /combi — se deja
              este redirect para que un link o marcador viejo no rompa. */}
          <Route path="/mi-pase" element={<Navigate to="/combi" replace />} />
          <Route path="/panel-trabajadores" element={<PanelTrabajadores />} />
        </Routes>
      </main>
      {!esPanelTrabajadores && <Footer />}
      {!esPanelTrabajadores && <LectorPantalla />}
      {!esPanelTrabajadores && <Tachin />}

      {escuchandoSaludo && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-verde text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-xl animate-fade-in">
          <Mic className="w-4 h-4 animate-pulse" /> Escuchando… decime a dónde querés ir
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <TutorialProvider>
        <Layout />
      </TutorialProvider>
    </BrowserRouter>
  )
}
