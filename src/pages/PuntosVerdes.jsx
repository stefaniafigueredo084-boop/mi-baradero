import { useMemo, useState } from 'react'
import { MapPin, Clock, CheckCircle, XCircle, Recycle, Leaf, BarChart3, Navigation } from 'lucide-react'
import { puntosVerdes as puntosFijos, materialesInfo } from '../data/puntosVerdesData'
import { useColeccion } from '../hooks/useColeccion'
import { posicionDesdeId } from '../utils/posicionHash'
import AcordeonItem, { Acordeon } from '../components/panel/Acordeon'

const instrucciones = [
  {
    icono: '🛍️',
    titulo: 'Bolsas separadas',
    descripcion: 'Llevá los reciclables en una bolsa separada de los residuos orgánicos. No mezcles.',
    color: '#1B8E3E',
  },
  {
    icono: '🧼',
    titulo: 'Envases limpios',
    descripcion: 'Enjuagá botellas, latas y envases antes de llevarlos. No es necesario que estén perfectos.',
    color: '#1D8FE1',
  },
  {
    icono: '📦',
    titulo: 'Aplastar y doblar',
    descripcion: 'Aplastá botellas plásticas y doblá cajas de cartón para ocupar menos espacio.',
    color: '#F5C400',
  },
  {
    icono: '🚫',
    titulo: 'Sin líquidos ni restos',
    descripcion: 'Vaciá completamente los envases. No lleves bolsas con restos de comida adentro.',
    color: '#e65100',
  },
  {
    icono: '🗂️',
    titulo: 'Separar por tipo',
    descripcion: 'Si podés, separar papel, plástico, vidrio y metal facilita mucho el reciclaje.',
    color: '#6a1b9a',
  },
  {
    icono: '🪟',
    titulo: 'Vidrio con cuidado',
    descripcion: 'El vidrio va envuelto o en bolsa resistente para evitar accidentes al depositarlo.',
    color: '#0B6A2E',
  },
]

// Arma el link de Google Maps para llegar al punto: si en algún momento
// se cargan coordenadas (lat/lng) usa eso, que es exacto; si no, busca
// por dirección + "Baradero" para no confundirse con una calle del mismo
// nombre en otra ciudad.
function linkComoLlegar(punto) {
  const destino = punto.lat && punto.lng
    ? `${punto.lat},${punto.lng}`
    : `${punto.direccion}, Baradero, Buenos Aires`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`
}

export default function PuntosVerdes() {
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null)

  // Puntos cargados desde el panel de trabajadores, con una posición en
  // el mapa calculada a partir de su id (el formulario no la pide).
  const { items: puntosLive } = useColeccion('puntosVerdesExtra')
  const puntosVerdes = useMemo(
    () => [
      ...puntosFijos.filter(p => !puntosLive.some(lp => lp.idOriginal === p.id)),
      ...puntosLive.map(p => ({ ...posicionDesdeId(p.id), ...p })),
    ],
    [puntosLive]
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero azul */}
      <div className="bg-gradient-to-br from-azul-oscuro to-azul text-white py-10 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4 flex-wrap sm:flex-nowrap">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <Recycle className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-poppins">Puntos Verdes</h1>
            <p className="text-blue-200 text-sm sm:text-base">Reciclá cerca de vos y cuidá Baradero</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        <Acordeon>
          <AcordeonItem
            icono={Recycle}
            color="verde"
            titulo="¿Cómo llevar los residuos?"
            descripcion="Seguí estos pasos para reciclar correctamente"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {instrucciones.map(inst => (
                <div key={inst.titulo} className="card p-4 text-center group hover:-translate-y-1 transition-all duration-200">
                  <div
                    className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl"
                    style={{ backgroundColor: inst.color + '18' }}
                  >
                    {inst.icono}
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">{inst.titulo}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{inst.descripcion}</p>
                </div>
              ))}
            </div>
          </AcordeonItem>

          <AcordeonItem
            icono={Recycle}
            color="verde"
            titulo="Materiales Aceptados"
            descripcion="Qué podés llevar a los puntos verdes"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(materialesInfo).map(([nombre, info]) => (
                <div key={nombre} className="card p-4 text-center hover:border-verde hover:border-2 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: info.color + '20' }}>
                    <Recycle className="w-5 h-5" style={{ color: info.color }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{nombre}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{info.descripcion}</p>
                </div>
              ))}
            </div>
          </AcordeonItem>
        </Acordeon>

        {/* Mapa + Lista */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mapa simulado */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold font-poppins mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-azul" /> Mapa de Puntos Verdes
            </h2>
            <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border border-gray-200 h-80 overflow-hidden">
              {/* Grid de mapa ficticio */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="absolute border-gray-400 border-t" style={{ top: `${i * 12.5}%`, left: 0, right: 0 }} />
                ))}
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="absolute border-gray-400 border-l" style={{ left: `${i * 12.5}%`, top: 0, bottom: 0 }} />
                ))}
              </div>

              {/* Calles simuladas */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="#e2e8f0" strokeWidth="0.8" />
                <line x1="0" y1="70" x2="100" y2="70" stroke="#e2e8f0" strokeWidth="0.8" />
                <line x1="25" y1="0" x2="25" y2="100" stroke="#e2e8f0" strokeWidth="0.8" />
                <line x1="75" y1="0" x2="75" y2="100" stroke="#e2e8f0" strokeWidth="0.8" />
              </svg>

              {/* Puntos verdes en mapa */}
              {puntosVerdes.map(punto => (
                <button
                  key={punto.id}
                  onClick={() => setPuntoSeleccionado(puntoSeleccionado?.id === punto.id ? null : punto)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                  style={{ left: `${punto.posX}%`, top: `${punto.posY}%` }}
                >
                  <div className={`w-10 h-10 rounded-full border-3 flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110 ${
                    punto.activo
                      ? puntoSeleccionado?.id === punto.id
                        ? 'bg-azul border-azul-oscuro scale-125'
                        : 'bg-verde border-verde-oscuro'
                      : 'bg-gray-400 border-gray-500'
                  }`} style={{ border: '3px solid' }}>
                    <Recycle className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-gray-800 text-xs font-semibold px-2 py-1 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {punto.nombre}
                  </div>
                </button>
              ))}

              {/* Leyenda */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl p-2.5 text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-verde" />
                  <span className="text-gray-600">Activo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-400" />
                  <span className="text-gray-600">Inactivo</span>
                </div>
              </div>

              <div className="absolute top-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-lg">
                Mapa simulado
              </div>
            </div>
          </div>

          {/* Lista de puntos */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold font-poppins mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-verde" /> Lista de Puntos
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide pr-1">
              {puntosVerdes.map(punto => (
                <button
                  key={punto.id}
                  onClick={() => setPuntoSeleccionado(puntoSeleccionado?.id === punto.id ? null : punto)}
                  className={`w-full card p-4 text-left border-2 transition-all ${
                    puntoSeleccionado?.id === punto.id
                      ? 'border-azul ring-2 ring-azul/20'
                      : 'border-transparent'
                  } ${!punto.activo ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-gray-800 truncate">{punto.nombre}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{punto.direccion}</p>
                    </div>
                    {punto.activo
                      ? <CheckCircle className="w-4 h-4 text-verde shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    }
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{punto.horario}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {punto.materiales.slice(0, 3).map(m => (
                      <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-verde/10 text-verde">{m}</span>
                    ))}
                    {punto.materiales.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">+{punto.materiales.length - 3}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detalle del punto seleccionado */}
        {puntoSeleccionado && (
          <div className="card p-6 border-2 border-azul/30 animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold font-poppins text-gray-800">{puntoSeleccionado.nombre}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-azul" />
                  <span className="text-gray-500 text-sm">{puntoSeleccionado.direccion}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`badge text-sm ${puntoSeleccionado.activo ? 'bg-verde/10 text-verde' : 'bg-red-100 text-red-500'}`}>
                  {puntoSeleccionado.activo ? '● Activo' : '● Inactivo'}
                </span>
                <a
                  href={linkComoLlegar(puntoSeleccionado)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-azul text-white text-sm font-semibold px-3.5 py-2 rounded-xl hover:bg-azul-oscuro transition-colors shrink-0"
                >
                  <Navigation className="w-4 h-4" /> Cómo llegar
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-azul" />
                  <span className="font-semibold text-gray-700 text-sm">Horario</span>
                </div>
                <p className="text-gray-600 text-sm">{puntoSeleccionado.horario}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-verde" />
                  <span className="font-semibold text-gray-700 text-sm">Capacidad actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${puntoSeleccionado.capacidad > 80 ? 'bg-red-400' : puntoSeleccionado.capacidad > 50 ? 'bg-amarillo' : 'bg-verde'}`}
                      style={{ width: `${puntoSeleccionado.capacidad}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{puntoSeleccionado.capacidad}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Recycle className="w-4 h-4 text-verde" />
                Materiales aceptados
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {puntoSeleccionado.materiales.map(mat => {
                  const info = materialesInfo[mat]
                  return (
                    <div key={mat} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: info?.color || '#888' }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">{mat}</p>
                        <p className="text-xs text-gray-500 truncate">{info?.descripcion}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
