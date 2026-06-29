import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import CombiMunicipal from './pages/CombiMunicipal'
import Residuos from './pages/Residuos'
import Eventos from './pages/Eventos'
import PuntosVerdes from './pages/PuntosVerdes'
import Perfil from './pages/Perfil'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/combi" element={<CombiMunicipal />} />
            <Route path="/residuos" element={<Residuos />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/puntos-verdes" element={<PuntosVerdes />} />
            <Route path="/perfil" element={<Perfil />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
