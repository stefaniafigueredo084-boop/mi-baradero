import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Bus, Trash2, Calendar, MapPin, UserCircle } from 'lucide-react'
import LogoMiBaradero from './LogoMiBaradero'

const navLinks = [
  { to: '/', label: 'Inicio', icon: null },
  { to: '/combi', label: 'Combi Municipal', icon: Bus },
  { to: '/residuos', label: 'Recolección', icon: Trash2 },
  { to: '/eventos', label: 'Eventos y Noticias', icon: Calendar },
  { to: '/puntos-verdes', label: 'Puntos Verdes', icon: MapPin },
  { to: '/perfil', label: 'Mi Perfil', icon: UserCircle },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Franja superior de identidad */}
      <div className="bg-gradient-to-r from-verde-oscuro via-verde to-azul h-1" />

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center group shrink-0">
              <div className="transition-transform duration-200 group-hover:scale-105">
                <LogoMiBaradero size="md" theme="color" />
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 font-inter ${
                      active
                        ? 'bg-verde text-white shadow-sm'
                        : 'text-gray-600 hover:bg-verde/8 hover:text-verde'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}
                  </Link>
                )
              })}
            </nav>

            {/* Badge + Mobile button */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 bg-verde/10 text-verde text-xs font-semibold px-3 py-1.5 rounded-full border border-verde/20">
                <span className="w-1.5 h-1.5 rounded-full bg-verde animate-pulse" />
                En línea
              </span>
              <button
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menú"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 animate-fade-in">
            {/* Logo grande en móvil */}
            <div className="px-4 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/60">
              <LogoMiBaradero size="sm" theme="color" />
            </div>
            <nav className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-verde text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-verde'
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {label}
                  </Link>
                )
              })}
            </nav>
            <div className="px-4 pb-4">
              <div className="bg-verde/5 border border-verde/15 rounded-xl p-3 text-xs text-verde-oscuro text-center">
                Baradero, Buenos Aires
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
