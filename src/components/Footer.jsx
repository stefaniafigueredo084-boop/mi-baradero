import { Instagram, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import LogoMiBaradero from './LogoMiBaradero'

const INSTAGRAM_URL = 'https://www.instagram.com/mi.baradero?igsh=cGh2bzJvZGhxZGt1&utm_source=qr'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#073318] via-verde-oscuro to-[#0a3d1f] text-white">

      {/* Franja de identidad */}
      <div className="bg-gradient-to-r from-verde via-azul to-amarillo h-1" />

      {/* Logo central grande */}
      <div className="border-b border-white/10 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-center">
          <LogoMiBaradero size="lg" theme="white" />
          <p className="text-green-200 text-sm max-w-md leading-relaxed mt-2">
            La plataforma digital que conecta a los vecinos de Baradero con los servicios, eventos y noticias de su ciudad — todo en un solo lugar.
          </p>
          {/* Redes */}
          <div className="flex gap-3 mt-2">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              <Instagram className="w-4 h-4" />
              <span>@mi.baradero</span>
            </a>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Servicios */}
          <div>
            <h3 className="font-bold font-poppins mb-4 text-amarillo text-sm uppercase tracking-wider">
              Servicios
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/combi', label: 'Combi Municipal' },
                { to: '/residuos', label: 'Recolección de Residuos' },
                { to: '/eventos', label: 'Eventos y Noticias' },
                { to: '/puntos-verdes', label: 'Puntos Verdes' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-green-200 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-verde group-hover:bg-amarillo transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Integrantes */}
          <div>
            <h3 className="font-bold font-poppins mb-4 text-amarillo text-sm uppercase tracking-wider">
              Integrantes del Proyecto
            </h3>
            <ul className="space-y-2.5 text-sm text-green-200">
              {[
                'Stefania Figueredo',
                'Celeste Weiss',
                'Roman Van Loo',
                'Wanda Garcia',
              ].map(nombre => (
                <li key={nombre} className="flex items-center gap-2.5">
                  <Users className="w-3.5 h-3.5 shrink-0 text-verde" />
                  <span>{nombre}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="font-bold font-poppins mb-4 text-amarillo text-sm uppercase tracking-wider">
              Horarios
            </h3>
            <div className="space-y-3 text-sm text-green-200">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-white font-semibold mb-1">Atención al Público</p>
                <p>Lunes a Viernes</p>
                <p className="text-white font-medium">08:00 - 14:00 hs</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-white font-semibold mb-1">Emergencias</p>
                <p className="text-amarillo font-bold text-base">100 · 101 · 107</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Base */}
      <div className="border-t border-white/10 px-4 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-green-400">
          <div className="flex items-center gap-2">
            <LogoMiBaradero size="sm" theme="white" />
          </div>
          <span>© 2026 Mi Baradero · Todos los derechos reservados</span>
        </div>
      </div>
    </footer>
  )
}
