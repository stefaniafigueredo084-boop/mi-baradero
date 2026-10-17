import { useState } from 'react'
import { Bus, Trash2, Calendar, MapPin, MessageSquare, UserCircle, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { galeriaEventos, tiposEvento } from '../data/galeriaEventos'
import { nombreVecino } from '../utils/perfilLocal'
import { useTutorial } from '../context/TutorialContext'
import EstadoVacio from '../components/EstadoVacio'

const servicios = [
  { to: '/combi', icon: Bus, titulo: 'Combi Municipal', detalle: 'Pasajes, horarios y recorrido', color: 'bg-primario text-white', claves: 'pasaje colectivo micro pase horarios viaje' },
  { to: '/residuos', icon: Trash2, titulo: 'Residuos', detalle: 'Calendario de recolección', color: 'bg-secundario text-tinta', claves: 'basura camion recoleccion reciclables' },
  { to: '/eventos', icon: Calendar, titulo: 'Eventos y Noticias', detalle: 'Agenda de la ciudad', color: 'bg-primario-oscuro text-white', claves: 'agenda festival feria novedades' },
  { to: '/puntos-verdes', icon: MapPin, titulo: 'Puntos Verdes', detalle: 'Dónde reciclar', color: 'bg-secundario text-tinta', claves: 'reciclaje reciclar mapa' },
  { to: '/reclamos', icon: MessageSquare, titulo: 'Reclamos', detalle: 'Escribile al municipio', color: 'bg-primario-oscuro text-white', claves: 'sugerencias queja reclamo' },
  { to: '/perfil', icon: UserCircle, titulo: 'Mi Perfil', detalle: 'Tus datos y tu pase', color: 'bg-primario text-white', claves: 'cuenta datos usuario' },
]

const atajos = [
  { to: '/combi', label: 'Comprar pasaje' },
  { to: '/residuos', label: '¿Cuándo pasa el camión?' },
  { to: '/reclamos', label: 'Hacer un reclamo' },
  { to: '/eventos', label: 'Agenda' },
]

// Para que "camión" encuentre "camion", "Música" encuentre "musica", etc.
const limpiar = texto => texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function EventoCard({ evento }) {
  return (
    <Link
      to="/eventos"
      className="group block shrink-0 w-[62%] sm:w-auto snap-start bg-white border border-gray-200 rounded overflow-hidden hover:border-primario transition-colors"
    >
      <div className="relative h-[118px] sm:h-36">
        {evento.imagen ? (
          <img src={evento.imagen} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${evento.color1} 0%, ${evento.color2} 100%)` }}
          />
        )}
        <span className="absolute top-2 left-2 bg-white text-primario-oscuro text-xs font-bold font-poppins px-2 py-1 rounded-sm">
          {evento.fecha}
        </span>
        <span className="absolute top-2 right-2 bg-acento text-[#3B2A00] text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-md">
          {evento.tag}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <h3 className="text-sm font-bold font-poppins text-tinta leading-snug">{evento.titulo}</h3>
        <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <MapPin className="w-3.5 h-3.5 text-primario shrink-0" />
          <span className="truncate">{evento.ubicacion}</span>
        </p>
      </div>
    </Link>
  )
}

export default function Home() {
  const [filtroEvento, setFiltroEvento] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const tutorial = useTutorial()
  const nombre = nombreVecino()

  const q = limpiar(busqueda.trim())
  const serviciosVisibles = q
    ? servicios.filter(s => limpiar(`${s.titulo} ${s.detalle} ${s.claves}`).includes(q))
    : servicios
  const eventosVisibles = galeriaEventos
    .filter(e => filtroEvento === 'todos' || e.tipo === filtroEvento)
    .filter(e => !q || limpiar(`${e.titulo} ${e.tag} ${e.categoria}`).includes(q))
  const sinResultados = q && serviciosVisibles.length === 0 && eventosVisibles.length === 0

  return (
    <div className="min-h-screen bg-fondo-app">

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="hero-portada">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 lg:pt-14 lg:pb-16 grid lg:grid-cols-[1.45fr_1fr] gap-8 lg:gap-12 items-center">
          <div>
            <span className="inline-block bg-acento text-tinta text-xs font-bold uppercase tracking-[0.12em] px-3.5 py-1.5 rounded-full">
              Baradero, Buenos Aires
            </span>
            <h1 className="mt-4 text-[34px] sm:text-5xl lg:text-[58px] font-extrabold font-poppins text-tinta leading-[1.05] tracking-tight">
              Todo Baradero en tus manos
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
              {nombre ? `Hola, ${nombre}. ` : ''}Los servicios, eventos y avisos de tu ciudad en un solo lugar.
              Simple, rápido y para todos los vecinos.
            </p>

            <form
              onSubmit={e => { e.preventDefault(); document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="mt-6 flex items-center gap-2 bg-white border-2 border-primario rounded-xl p-1.5 pl-4 max-w-xl shadow-sm focus-within:ring-4 focus-within:ring-primario/15"
            >
              <input
                type="search"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="¿Qué necesitás hacer hoy?"
                aria-label="¿Qué necesitás hacer hoy?"
                className="flex-1 min-w-0 bg-transparent text-base text-gray-800 placeholder-gray-500 outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {busqueda && (
                <button type="button" onClick={() => setBusqueda('')} aria-label="Borrar búsqueda" className="text-gray-400 hover:text-gray-600">
                  <X className="w-[18px] h-[18px]" />
                </button>
              )}
              <button type="submit" className="flex items-center gap-2 bg-primario hover:bg-primario-oscuro text-white font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg transition-colors">
                <Search className="w-[18px] h-[18px]" /> <span className="hidden sm:inline">Buscar</span>
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {atajos.map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  className="inline-flex items-center min-h-[44px] bg-white border border-gray-200 text-primario-oscuro text-sm font-semibold px-4 py-2 rounded-full hover:border-primario transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] lg:aspect-[4/3.1]">
            <img src="/eventos/festival-baradero.jpg" alt="Festival de Baradero" className="absolute inset-0 w-full h-full object-cover" />
            <Link
              to="/combi"
              className="absolute left-3 right-3 sm:left-4 sm:right-auto bottom-3 sm:bottom-4 flex items-center gap-2 min-h-[44px] bg-white rounded-full px-4 py-2 text-sm font-semibold text-tinta shadow-md hover:text-primario-oscuro"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-secundario shrink-0" />
              Combi municipal · horarios y recorrido
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">

        {sinResultados && (
          <EstadoVacio
            titulo={`No encontramos nada con “${busqueda.trim()}”`}
            texto="Probá con otra palabra, como “pasaje”, “basura” o “reclamo”."
          />
        )}

        {/* ── SERVICIOS ────────────────────────────────────────────── */}
        {serviciosVisibles.length > 0 && (
          <section id="servicios" className="pt-6 scroll-mt-32">
            <span className="block w-12 h-1.5 rounded-full bg-acento mb-3" />
            <h2 className="text-base sm:text-lg font-bold font-poppins text-tinta mb-2.5">Servicios</h2>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
              {serviciosVisibles.map(({ to, icon: Icon, titulo, detalle, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="bg-white border border-gray-200 rounded px-1.5 pt-2.5 pb-2 flex flex-col items-center gap-1.5 text-center hover:border-primario transition-colors"
                >
                  <span className={`w-[42px] h-[42px] rounded-xl ${color} flex items-center justify-center`}>
                    <Icon className="w-[21px] h-[21px]" />
                  </span>
                  <span className="text-sm font-semibold text-tinta leading-tight">{titulo}</span>
                  <span className="hidden sm:block text-sm text-gray-500 leading-tight">{detalle}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── EVENTOS Y NOTICIAS ───────────────────────────────────── */}
        {!sinResultados && (
          <section id="eventos-baradero" className="pt-5">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-base sm:text-lg font-bold font-poppins text-tinta">Eventos y noticias</h2>
              <Link to="/eventos" className="inline-flex items-center min-h-[44px] text-sm font-semibold text-primario-oscuro hover:underline">Ver todo</Link>
            </div>

            <div className="flex gap-1.5 overflow-x-auto mb-3">
              {tiposEvento.map(tipo => (
                <button
                  key={tipo.id}
                  onClick={() => setFiltroEvento(tipo.id)}
                  className={`shrink-0 px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${
                    filtroEvento === tipo.id
                      ? 'bg-primario-oscuro border-primario-oscuro text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-primario'
                  }`}
                >
                  {tipo.label}
                </button>
              ))}
            </div>

            {/* En celular se deslizan de costado; en pantallas más anchas, grilla */}
            <div className="flex gap-3 overflow-x-auto snap-x -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-visible">
              {eventosVisibles.map(evento => <EventoCard key={evento.id} evento={evento} />)}
            </div>

            {eventosVisibles.length === 0 && (
              <EstadoVacio compacto texto="No hay eventos en esta categoría por ahora." />
            )}
          </section>
        )}

        {/* ── AYUDA (TACHÍN) ───────────────────────────────────────── */}
        {!q && (
          <section className="mt-5 bg-secundario-suave rounded flex items-center gap-3 px-3 py-2.5">
            <img src="/tachin.png" alt="" className="h-12 w-12 object-contain shrink-0" />
            <p className="flex-1 min-w-0 text-sm text-secundario-oscuro leading-snug">
              <b className="font-poppins">¿Primera vez acá?</b> Tachín te muestra cómo se usa la app.
            </p>
            <button
              onClick={tutorial?.abrirManualmente}
              className="shrink-0 bg-secundario hover:brightness-95 text-tinta text-sm font-bold px-4 min-h-[44px] rounded-[10px] transition-colors"
            >
              Ver recorrido
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
