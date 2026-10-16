import { Link, useLocation } from 'react-router-dom'
import { Home, Bus, Calendar, MessageSquare, UserCircle } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/combi', label: 'Combi', icon: Bus },
  { to: '/eventos', label: 'Eventos', icon: Calendar },
  { to: '/reclamos', label: 'Reclamos', icon: MessageSquare },
  { to: '/perfil', label: 'Perfil', icon: UserCircle },
]

// Barra de navegación inferior, estilo app: solo en celular/tablet (en
// pantallas anchas la navegación completa ya está en el Header). Lleva
// las 5 secciones más usadas; Residuos y Puntos Verdes quedan en el
// Inicio y en el menú de arriba.
export default function BottomNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Navegación principal"
      className="xl:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex pb-[env(safe-area-inset-bottom)]"
    >
      {tabs.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center gap-0.5 pt-2 pb-2 text-xs font-semibold border-t-[3px] -mt-px transition-colors ${
              active ? 'text-primario-oscuro border-primario' : 'text-gray-500 border-transparent hover:text-primario-oscuro'
            }`}
          >
            <Icon className="w-[22px] h-[22px]" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
