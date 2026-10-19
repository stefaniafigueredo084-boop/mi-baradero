import { Suspense, lazy, useMemo, useState } from 'react'
import { MapPin, Clock, CheckCircle, XCircle, Recycle, Leaf, BarChart3, Navigation, ShoppingBag, Droplets, Package, Ban, Layers, GlassWater } from 'lucide-react'
import { puntosVerdes as puntosFijos, materialesInfo } from '../data/puntosVerdesData'
import { useColeccion } from '../hooks/useColeccion'
import Esqueleto from '../components/Esqueleto'
import { coordenadasDe } from '../utils/coordenadas'

// El mapa (Leaflet) se carga aparte, solo al abrir esta página.
const MapaPuntosVerdes = lazy(() => import('../components/MapaPuntosVerdes'))
import AcordeonItem, { Acordeon } from '../components/panel/Acordeon'

const instrucciones = [
  {
    icono: ShoppingBag,
    titulo: 'Bolsas separadas',
    descripcion: 'Llevá los reciclables en una bolsa separada de los residuos orgánicos. No mezcles.',
    color: '#3D8B68',
  },
  {
    icono: Droplets,
    titulo: 'Envases limpios',
    descripcion: 'Enjuagá botellas, latas y envases antes de llevarlos. No es necesario que estén perfectos.',
    color: '#17A673',
  },
  {
    icono: Package,
    titulo: 'Aplastar y doblar',
    descripcion: 'Aplastá botellas plásticas y doblá cajas de cartón para ocupar menos espacio.',
    color: '#FF6B4A',
  },
  {
    icono: Ban,
    titulo: 'Sin líquidos ni restos',
    descripcion: 'Vaciá completamente los envases. No lleves bolsas con restos de comida adentro.',
    color: '#e65100',
  },
  {
    icono: Layers,
    titulo: 'Separar por tipo',
    descripcion: 'Si podés, separar papel, plástico, vidrio y metal facilita mucho el reciclaje.',
    color: '#6a1b9a',
  },
  {
    icono: GlassWater,
    titulo: 'Vidrio con cuidado',
    descripcion: 'El vidrio va envuelto o en bolsa resistente para evitar accidentes al depositarlo.',
    color: '#285E47',
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

  // Puntos fijos del sitio + los cargados desde el panel de trabajadores.
  const { items: puntosLive } = useColeccion('puntosVerdesExtra')
  const puntosVerdes = useMemo(
    () => [
      ...puntosFijos.filter(p => !puntosLive.some(lp => lp.idOriginal === p.id)),
      ...puntosLive,
    ],
    [puntosLive]
  )
  const sinUbicacion = puntosVerdes.filter(p => !coordenadasDe(p))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero azul */}
      <div className="bg-primario text-white py-5 sm:py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-secundario text-tinta flex items-center justify-center shrink-0">
            <Recycle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-poppins">Puntos Verdes</h1>
            <p className="text-white/80 text-sm sm:text-base">Reciclá cerca de vos y cuidá Baradero</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-6">

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
                    className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: inst.color + '18', color: inst.color }}
                  >
                    <inst.icono className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">{inst.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{inst.descripcion}</p>
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
                <div key={nombre} className="card p-4 text-center hover:border-primario hover:border-2 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: info.color + '20' }}>
                    <Recycle className="w-5 h-5" style={{ color: info.color }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{nombre}</p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{info.descripcion}</p>
                </div>
              ))}
            </div>
          </AcordeonItem>
        </Acordeon>

        {/* Mapa + Lista */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mapa real (OpenStreetMap) */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold font-poppins mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secundario" /> Mapa de Puntos Verdes
            </h2>
            <Suspense fallback={<Esqueleto filas={1} alto="h-80" />}>
              <MapaPuntosVerdes
                puntos={puntosVerdes}
                elegidoId={puntoSeleccionado?.id}
                onElegir={punto => setPuntoSeleccionado(puntoSeleccionado?.id === punto.id ? null : punto)}
              />
            </Suspense>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="marcador-punto activo !w-3.5 !h-3.5 !border-2" /> Activo</span>
              <span className="flex items-center gap-1.5"><span className="marcador-punto inactivo !w-3.5 !h-3.5 !border-2" /> Inactivo</span>
            </div>
            {sinUbicacion.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Sin ubicación en el mapa todavía: {sinUbicacion.map(p => p.nombre).join(', ')}. Están en la lista, con "Cómo llegar" por dirección.
              </p>
            )}
          </div>

          {/* Lista de puntos */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold font-poppins mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primario" /> Lista de Puntos
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide pr-1">
              {puntosVerdes.map(punto => (
                <button
                  key={punto.id}
                  onClick={() => setPuntoSeleccionado(puntoSeleccionado?.id === punto.id ? null : punto)}
                  className={`w-full card p-4 text-left border-2 transition-all ${
                    puntoSeleccionado?.id === punto.id
                      ? 'border-secundario ring-2 ring-secundario/20'
                      : 'border-transparent'
                  } ${!punto.activo ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-gray-800 truncate">{punto.nombre}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{punto.direccion}</p>
                    </div>
                    {punto.activo
                      ? <CheckCircle className="w-4 h-4 text-secundario shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    }
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{punto.horario}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {punto.materiales.slice(0, 3).map(m => (
                      <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-primario/10 text-primario">{m}</span>
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
          <div className="card p-4 border-2 border-secundario/30 animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold font-poppins text-gray-800">{puntoSeleccionado.nombre}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-secundario" />
                  <span className="text-gray-500 text-sm">{puntoSeleccionado.direccion}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`badge text-sm ${puntoSeleccionado.activo ? 'bg-primario/10 text-primario' : 'bg-red-100 text-red-500'}`}>
                  {puntoSeleccionado.activo ? '● Activo' : '● Inactivo'}
                </span>
                <a
                  href={linkComoLlegar(puntoSeleccionado)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-secundario text-tinta text-sm font-semibold px-3.5 py-2 rounded-xl hover:brightness-95 transition-colors shrink-0"
                >
                  <Navigation className="w-4 h-4" /> Cómo llegar
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-50 rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-secundario" />
                  <span className="font-semibold text-gray-700 text-sm">Horario</span>
                </div>
                <p className="text-gray-600 text-sm">{puntoSeleccionado.horario}</p>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-primario" />
                  <span className="font-semibold text-gray-700 text-sm">Capacidad actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${puntoSeleccionado.capacidad > 80 ? 'bg-red-400' : puntoSeleccionado.capacidad > 50 ? 'bg-acento' : 'bg-primario'}`}
                      style={{ width: `${puntoSeleccionado.capacidad}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{puntoSeleccionado.capacidad}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Recycle className="w-4 h-4 text-primario" />
                Materiales aceptados
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {puntoSeleccionado.materiales.map(mat => {
                  const info = materialesInfo[mat]
                  return (
                    <div key={mat} className="flex items-center gap-2 p-2.5 rounded bg-gray-50 border border-gray-100">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: info?.color || '#888' }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">{mat}</p>
                        <p className="text-sm text-gray-500 truncate">{info?.descripcion}</p>
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
