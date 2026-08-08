import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import CombiMunicipal from './pages/CombiMunicipal'
import Residuos from './pages/Residuos'
import Eventos from './pages/Eventos'
import PuntosVerdes from './pages/PuntosVerdes'
import Perfil from './pages/Perfil'
import PanelTrabajadores from './pages/PanelTrabajadores'

function Layout() {
  // El panel de trabajadores tiene su propio header (login/logout) y no
  // debe mostrar la navegación pública.
  const esPanelTrabajadores = useLocation().pathname === '/panel-trabajadores'

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
          <Route path="/panel-trabajadores" element={<PanelTrabajadores />} />
        </Routes>
      </main>
      {!esPanelTrabajadores && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
