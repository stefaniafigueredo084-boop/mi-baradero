import { useState } from 'react'
import { Bus, Trash2, Calendar, MapPin, ChevronRight, ArrowRight, Play, Star, Send, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ServiceCard from '../components/ServiceCard'
import LogoMiBaradero from '../components/LogoMiBaradero'
import { galeriaEventos, tiposEvento } from '../data/galeriaEventos'


/* Tarjeta ilustrada de evento para la galería */
function EventoCard({ evento, destacado }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-400 hover:-translate-y-1 cursor-pointer ${
        destacado ? 'row-span-2' : ''
      }`}
      style={{ minHeight: destacado ? 380 : 200 }}
    >
      {evento.imagen ? (
        <img
          src={evento.imagen}
          alt={evento.titulo}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${evento.color1} 0%, ${evento.color2} 100%)` }}
        />
      )}

      {/* Overlay gradiente bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Badge tag */}
      <div className="absolute top-3 left-3">
        <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {evento.tag}
        </span>
      </div>

      {/* Contenido inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white/70 text-xs font-medium mb-1">{evento.categoria}</p>
        <h3 className={`text-white font-bold font-poppins leading-tight mb-1 ${destacado ? 'text-xl' : 'text-sm'}`}>
          {evento.titulo}
        </h3>
        {destacado && (
          <p className="text-white/75 text-sm mb-3 leading-relaxed line-clamp-2">
            {evento.descripcion}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/80 text-xs">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{evento.ubicacion}</span>
          </div>
          <span className="text-white/70 text-xs bg-white/15 px-2 py-0.5 rounded-full">{evento.fecha}</span>
        </div>
        {destacado && (
          <button className="mt-3 flex items-center gap-1.5 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg">
            <Play className="w-3 h-3 fill-white" />
            Ver evento
          </button>
        )}
      </div>
    </div>
  )
}

const ETIQUETAS = { 1: 'Muy mala', 2: 'Podría mejorar', 3: 'Está bien', 4: 'Muy buena', 5: '¡Excelente!' }
const CATEGORIAS = ['Diseño', 'Facilidad de uso', 'Información', 'Velocidad', 'Otro']

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform duration-150 hover:scale-125 focus:outline-none"
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
        >
          <Star className={`w-10 h-10 transition-colors duration-150 ${n <= (hovered || value) ? 'fill-amarillo text-amarillo' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  )
}

export default function Home() {
  const [filtroEvento, setFiltroEvento] = useState('todos')
  const [puntuacion, setPuntuacion] = useState(0)
  const [categoria, setCategoria] = useState('')
  const [sugerencia, setSugerencia] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [errorFeedback, setErrorFeedback] = useState('')

  function handleFeedback(e) {
    e.preventDefault()
    if (puntuacion === 0) { setErrorFeedback('Por favor seleccioná una puntuación.'); return }
    setErrorFeedback('')

    const estrellas = '⭐'.repeat(puntuacion)
    const lineas = [
      `*Valoración Mi Baradero*`,
      `Puntuación: ${estrellas} (${puntuacion}/5) — ${ETIQUETAS[puntuacion]}`,
      categoria ? `Aspecto destacado: ${categoria}` : null,
      sugerencia ? `Sugerencia: ${sugerencia}` : null,
    ].filter(Boolean).join('\n')

    const url = `https://wa.me/5493329383105?text=${encodeURIComponent(lineas)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setEnviado(true)
  }

  const eventosFiltrados = filtroEvento === 'todos'
    ? galeriaEventos
    : galeriaEventos.filter(e => e.tipo === filtroEvento)

  return (
    <div className="min-h-screen">

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-verde-oscuro via-verde to-[#25c05a] py-20 px-4">
        {/* Burbujas decorativas */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amarillo/10 blur-xl" />
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-azul/10 blur-lg" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo en el hero */}
          <div className="flex justify-center mb-8">
            <LogoMiBaradero size="lg" theme="white" />
          </div>

          <p className="text-2xl sm:text-3xl text-white/90 font-light mb-3 font-poppins">
            Todo Baradero en tu mano
          </p>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-10 font-inter">
            La plataforma digital que reúne los servicios, eventos y noticias de tu ciudad en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#servicios"
              className="inline-flex items-center gap-2 bg-white text-verde-oscuro font-bold px-8 py-3.5 rounded-2xl hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-poppins"
            >
              Explorar servicios
              <ChevronRight className="w-5 h-5" />
            </a>
            <a
              href="#eventos-baradero"
              className="inline-flex items-center gap-2 bg-amarillo/90 hover:bg-amarillo text-gray-900 font-bold px-8 py-3.5 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-poppins"
            >
              Ver Eventos
              <Calendar className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 64" fill="none">
            <path d="M0 64L80 56C160 48 320 32 480 24C640 16 800 16 960 24C1120 32 1280 48 1360 56L1440 64V64H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>


      {/* ── SERVICIOS ──────────────────────────────────────────────── */}
      <section id="servicios" className="py-16 px-4 bg-pattern">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-verde/10 text-verde text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              Ciudad de Baradero
            </span>
            <h2 className="section-title text-gray-800">Nuestros Servicios</h2>
            <p className="section-subtitle">Accedé rápidamente a todos los servicios de Baradero</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-10">
            <ServiceCard
              to="/combi"
              icon={Bus}
              title="Combi Municipal"
              description="Comprá pasajes online y seguí la combi en tiempo real por Alsina, Portela y Baradero."
              gradient="bg-gradient-to-br from-verde to-verde-oscuro"
            />
            <ServiceCard
              to="/residuos"
              icon={Trash2}
              title="Recolección de Residuos"
              description="Consultá el calendario de recolección y recibí alertas para tu zona."
              gradient="bg-amarillo"
            />
            <ServiceCard
              to="/eventos"
              icon={Calendar}
              title="Eventos y Noticias"
              description="Enterate de todos los eventos, festivales y noticias de Baradero."
              gradient="bg-gradient-to-br from-azul to-azul-oscuro"
            />
            <ServiceCard
              to="/puntos-verdes"
              icon={MapPin}
              title="Puntos Verdes"
              description="Encontrá los puntos de reciclaje más cercanos y cuidá el medioambiente."
              gradient="bg-gradient-to-br from-[#0B6A2E] to-[#064020]"
            />
          </div>
        </div>
      </section>

      {/* ── GALERÍA DE EVENTOS BARADERO ────────────────────────────── */}
      <section id="eventos-baradero" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">

          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-block bg-azul/10 text-azul text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
                Galería
              </span>
              <h2 className="section-title text-gray-800 mb-1">Eventos en Baradero</h2>
              <p className="text-gray-500 text-base font-inter">
                Marchas, festividades, cultura y vida comunitaria de nuestra ciudad
              </p>
            </div>
            <Link
              to="/eventos"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-verde hover:text-verde-oscuro transition-colors group"
            >
              Ver todos los eventos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tiposEvento.map(tipo => (
              <button
                key={tipo.id}
                onClick={() => setFiltroEvento(tipo.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filtroEvento === tipo.id
                    ? 'bg-verde text-white shadow-md shadow-verde/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tipo.label}
              </button>
            ))}
          </div>

          {/* Grid galería */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 auto-rows-[160px]">
            {eventosFiltrados.map((evento, idx) => (
              <div
                key={evento.id}
                className={`${
                  idx === 0 ? 'col-span-2 row-span-2' :
                  idx === 3 ? 'col-span-2' :
                  idx === 6 ? 'col-span-2 row-span-2' : ''
                }`}
              >
                <EventoCard
                  evento={evento}
                  destacado={idx === 0 || idx === 6}
                />
              </div>
            ))}
          </div>

          {eventosFiltrados.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="w-14 h-14 mx-auto mb-4 opacity-25" />
              <p className="text-lg font-medium">No hay eventos en esta categoría</p>
              <button onClick={() => setFiltroEvento('todos')} className="mt-3 text-verde font-semibold text-sm hover:underline">
                Ver todos
              </button>
            </div>
          )}

          {/* CTA ir a eventos */}
          <div className="mt-10 bg-gradient-to-r from-verde-oscuro to-verde rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div>
              <h3 className="text-xl font-bold font-poppins">¿Querés estar al día con Baradero?</h3>
              <p className="text-white/75 text-sm mt-1">Seguí la agenda completa de eventos y noticias de Baradero.</p>
            </div>
            <Link
              to="/eventos"
              className="shrink-0 bg-white text-verde-oscuro font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              Agenda completa
            </Link>
          </div>
        </div>
      </section>

      {/* ── VALORACIÓN ─────────────────────────────────────────────── */}
      <section id="valoracion" className="py-16 px-4 bg-pattern">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block bg-amarillo/15 text-yellow-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              Tu opinión importa
            </span>
            <h2 className="section-title text-gray-800">Valorá la aplicación</h2>
            <p className="section-subtitle">Contanos cómo fue tu experiencia y qué mejorarías</p>
          </div>

          {enviado ? (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-verde/10 rounded-full p-5">
                  <CheckCircle className="w-14 h-14 text-verde" />
                </div>
              </div>
              <h3 className="text-2xl font-bold font-poppins text-gray-800 mb-2">¡Gracias por tu opinión!</h3>
              <p className="text-gray-500 mb-4">Tu valoración nos ayuda a mejorar Mi Baradero para todos los vecinos.</p>
              <div className="flex justify-center gap-1 mb-3">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`w-7 h-7 ${n <= puntuacion ? 'fill-amarillo text-amarillo' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-verde font-semibold text-lg mb-6">{ETIQUETAS[puntuacion]}</p>
              <button onClick={() => { setPuntuacion(0); setCategoria(''); setSugerencia(''); setEnviado(false) }} className="btn-primary">
                Enviar otra valoración
              </button>
            </div>
          ) : (
            <form onSubmit={handleFeedback} className="bg-white rounded-3xl shadow-xl overflow-hidden">

              {/* Estrellas */}
              <div className="p-8 border-b border-gray-100">
                <h3 className="font-bold font-poppins text-gray-800 mb-5 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amarillo fill-amarillo" /> Puntuación general
                </h3>
                <div className="flex flex-col items-center gap-3">
                  <StarRating value={puntuacion} onChange={setPuntuacion} />
                  {puntuacion > 0 && <span className="text-verde font-semibold">{ETIQUETAS[puntuacion]}</span>}
                  {errorFeedback && <p className="text-red-500 text-sm">{errorFeedback}</p>}
                </div>
              </div>

              {/* Categoría */}
              <div className="p-8 border-b border-gray-100">
                <h3 className="font-bold font-poppins text-gray-800 mb-4">
                  ¿Qué aspecto querés destacar?{' '}
                  <span className="text-gray-400 font-normal text-sm">(opcional)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoria(categoria === cat ? '' : cat)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                        categoria === cat
                          ? 'bg-verde text-white border-verde shadow-md shadow-verde/20'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-verde hover:text-verde'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sugerencia */}
              <div className="p-8 border-b border-gray-100">
                <h3 className="font-bold font-poppins text-gray-800 mb-4">
                  ¿Qué mejorarías?{' '}
                  <span className="text-gray-400 font-normal text-sm">(opcional)</span>
                </h3>
                <textarea
                  value={sugerencia}
                  onChange={e => setSugerencia(e.target.value)}
                  placeholder="Contanos qué le agregarías, qué cambiarías o qué no te gustó..."
                  maxLength={500}
                  rows={4}
                  className="input-field resize-none text-sm leading-relaxed"
                />
                <p className="text-gray-400 text-xs text-right mt-1">{sugerencia.length}/500</p>
              </div>

              {/* Enviar */}
              <div className="p-8 bg-gray-50">
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-base">
                  <Send className="w-5 h-5" /> Enviar valoración
                </button>
                <p className="text-gray-400 text-xs text-center mt-3">Tu opinión es anónima y nos ayuda a mejorar la plataforma.</p>
              </div>

            </form>
          )}
        </div>
      </section>

      {/* ── BANNER IDENTIDAD ───────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gradient-to-br from-azul-oscuro via-azul to-[#2196f3]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="mb-6 flex justify-center">
            <LogoMiBaradero size="md" theme="white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-poppins mb-4">
            Baradero conectada, Baradero que crece
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto font-inter leading-relaxed">
            Mi Baradero reúne toda la información de la ciudad en un solo lugar, acercando los servicios a cada vecino de forma simple y accesible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#servicios"
              className="inline-flex items-center gap-2 bg-white text-azul-oscuro font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Explorar servicios
              <ChevronRight className="w-5 h-5" />
            </a>
            <a
              href="#eventos-baradero"
              className="inline-flex items-center gap-2 bg-amarillo text-gray-900 font-bold px-8 py-3.5 rounded-2xl hover:bg-yellow-400 transition-colors shadow-lg"
            >
              Ver eventos
              <Calendar className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
