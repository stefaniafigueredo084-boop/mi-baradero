import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import { hablar, soportaSintesisVoz } from './utils/voz'
import { useAccesibilidad } from './context/AccesibilidadContext'

function Layout() {
  // El panel de trabajadores tiene su propio header (login/logout) y no
  // debe mostrar la navegación pública.
  const esPanelTrabajadores = useLocation().pathname === '/panel-trabajadores'
  const { lector } = useAccesibilidad()

  // Saluda por voz al abrir la app, si el vecino ya se registró antes
  // (nombre guardado en este dispositivo) Y tiene activado "Lector de
  // pantalla" — si no lo activó, hablarle de la nada sin haberlo pedido
  // es más un susto que una ayuda. Se dispara una sola vez, al montar
  // la app (no en cada cambio de página dentro del sitio).
  const yaSaludo = useRef(false)
  useEffect(() => {
    if (yaSaludo.current) return
    yaSaludo.current = true
    if (esPanelTrabajadores || !soportaSintesisVoz() || !lector) return
    const nombre = nombreVecino()
    if (!nombre) return
    const temporizador = setTimeout(() => {
      hablar(`Hola de nuevo, ${nombre}. Qué bueno tenerte otra vez en Mi Baradero.`)
    }, 800)
    return () => clearTimeout(temporizador)
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
