import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Bus, Trash2, Calendar, MapPin, MessageSquare, UserCircle, HelpCircle, Home } from 'lucide-react'
import { useTutorial } from '../context/TutorialContext'

const navLinks = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/combi', label: 'Combi', icon: Bus },
  { to: '/residuos', label: 'Residuos', icon: Trash2 },
  { to: '/eventos', label: 'Eventos', icon: Calendar },
  { to: '/puntos-verdes', label: 'Puntos Verdes', icon: MapPin },
  { to: '/reclamos', label: 'Reclamos', icon: MessageSquare },
]

// Logo del header: el pin solo + nombre y bajada, sin la caja blanca del
// LogoMiBaradero (acá el fondo ya es blanco).
function MarcaHeader() {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/favicon.png" alt="" className="h-9 w-9 sm:h-10 sm:w-10 object-contain" />
      <span className="flex flex-col leading-none">
        <span className="font-poppins font-bold text-tinta text-lg sm:text-xl tracking-tight">Mi Baradero</span>
        <span className="font-poppins text-[11px] sm:text-xs text-gray-500 mt-0.5">Servicios de tu ciudad</span>
      </span>
    </span>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const tutorial = useTutorial()

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">

      {/* Franja institucional */}
      <div className="bg-primario-oscuro text-white text-[12.5px] sm:text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-8 sm:h-9">
          <span className="truncate">Sitio oficial · Municipalidad de Baradero</span>
          <div className="hidden md:flex items-center gap-6 shrink-0">
            <Link to="/perfil#accesibilidad" className="hover:underline">Accesibilidad</Link>
            <span>Atención: 147</span>
            <Link to="/panel-trabajadores" className="hover:underline">Panel de trabajadores</Link>
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-16 sm:h-[72px]">
        <Link
          to="/"
          onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }) }}
          className="shrink-0"
          aria-label="Mi Baradero — ir al inicio"
        >
          <MarcaHeader />
        </Link>

        <nav className="hidden xl:flex items-center gap-1 h-full">
          {navLinks.map(({ to, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`h-full flex items-center px-3 text-[15px] font-semibold whitespace-nowrap border-b-[3px] transition-colors ${
                  active
                    ? 'text-primario border-primario'
                    : 'text-tinta border-transparent hover:text-primario'
                }`}
              >
                {label}
              </Link>
            )
          })}
          <button
            onClick={tutorial?.abrirManualmente}
            className="h-full flex items-center gap-1 px-3 text-[15px] font-semibold text-tinta hover:text-primario border-b-[3px] border-transparent"
          >
            <HelpCircle className="w-4 h-4" /> Ayuda
          </button>
          <Link
            to="/perfil"
            className={`ml-3 px-4 py-2.5 rounded-lg text-[15px] font-semibold text-white transition-colors ${
              location.pathname === '/perfil' ? 'bg-primario-oscuro' : 'bg-primario hover:bg-primario-oscuro'
            }`}
          >
            Mi perfil
          </Link>
        </nav>

        <button
          className="xl:hidden p-2 rounded-lg text-tinta hover:bg-primario-suave transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú en celular/tablet */}
      {menuOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 animate-fade-in">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {[...navLinks, { to: '/perfil', label: 'Mi perfil', icon: UserCircle }].map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    active ? 'bg-primario text-white' : 'text-tinta hover:bg-primario-suave'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              )
            })}
            <button
              onClick={() => { setMenuOpen(false); tutorial?.abrirManualmente() }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-tinta hover:bg-primario-suave"
            >
              <HelpCircle className="w-5 h-5" /> Ayuda
            </button>
          </nav>
          <div className="px-4 pb-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
            <Link to="/perfil#accesibilidad" onClick={() => setMenuOpen(false)} className="hover:underline">Accesibilidad</Link>
            <span>Atención: 147</span>
            <Link to="/panel-trabajadores" onClick={() => setMenuOpen(false)} className="hover:underline">Panel de trabajadores</Link>
          </div>
        </div>
      )}
    </header>
  )
}
