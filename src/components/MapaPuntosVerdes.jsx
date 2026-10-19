import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { coordenadasDe } from '../utils/coordenadas'

// Centro de Baradero (Plaza Mitre, según OpenStreetMap).
const CENTRO_BARADERO = [-33.8070, -59.5022]


// Marcador propio (un círculo con el color del estado) en vez del ícono
// por defecto de Leaflet, que con Vite pierde las imágenes.
const icono = (activo, elegido) => L.divIcon({
  className: '',
  html: `<span class="marcador-punto ${activo ? 'activo' : 'inactivo'} ${elegido ? 'elegido' : ''}"></span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

// Encuadra el mapa para que entren todos los puntos (solo cuando cambian
// los puntos, no cada vez que se elige uno).
function Encuadre({ coords }) {
  const map = useMap()
  const clave = coords.map(c => c.join(',')).join(';')
  useEffect(() => {
    if (coords.length > 1) map.fitBounds(coords, { padding: [30, 30], maxZoom: 16 })
    else if (coords.length === 1) map.setView(coords[0], 16)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, clave])
  return null
}

// Mapa real (OpenStreetMap) de los puntos verdes que tienen coordenadas.
export default function MapaPuntosVerdes({ puntos, elegidoId, onElegir }) {
  const conCoords = puntos.map(p => ({ punto: p, coords: coordenadasDe(p) })).filter(x => x.coords)
  return (
    <MapContainer center={CENTRO_BARADERO} zoom={14} scrollWheelZoom={false} className="h-80 w-full rounded border border-gray-200 z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Encuadre coords={conCoords.map(x => x.coords)} />
      {conCoords.map(({ punto, coords }) => (
        <Marker
          key={punto.id}
          position={coords}
          icon={icono(punto.activo !== false, elegidoId === punto.id)}
          eventHandlers={{ click: () => onElegir(punto) }}
          title={punto.nombre}
          alt={punto.nombre}
        >
          <Tooltip direction="top" offset={[0, -12]}>{punto.nombre}</Tooltip>
        </Marker>
      ))}
    </MapContainer>
  )
}
