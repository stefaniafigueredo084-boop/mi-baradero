// Ubicaciones reales, confirmadas por el municipio (agosto 2026).
// posX/posY son solo la posición dentro del mapa simulado (no son
// coordenadas reales) — "Cómo llegar" en cambio usa la dirección real.
const HORARIO_GENERAL = 'Lun a Vie: 8:00 - 20:00'
const MATERIALES_GENERAL = ['Cartón', 'Papel', 'Vidrio', 'Plástico', 'Metales']

export const puntosVerdes = [
  {
    id: 1,
    nombre: 'Punto Verde Plaza Che Guevara',
    direccion: 'Pueyrredón y Pacheco de Melo',
    horario: HORARIO_GENERAL,
    posX: 40,
    posY: 35,
    materiales: MATERIALES_GENERAL,
    activo: true,
    capacidad: 40,
  },
  {
    id: 2,
    nombre: 'Punto Verde Plaza de los Intendentes',
    direccion: 'Malabia y Pringles',
    horario: HORARIO_GENERAL,
    posX: 65,
    posY: 40,
    materiales: MATERIALES_GENERAL,
    activo: true,
    capacidad: 40,
  },
  {
    id: 3,
    nombre: 'Punto Verde Plaza Colón',
    direccion: 'Medrano y Laprida',
    horario: HORARIO_GENERAL,
    posX: 45,
    posY: 65,
    materiales: MATERIALES_GENERAL,
    activo: true,
    capacidad: 40,
  },
  {
    id: 4,
    nombre: 'Punto Verde Plaza Malvinas Argentinas',
    direccion: "Liaudat y O'Roarke",
    horario: HORARIO_GENERAL,
    posX: 70,
    posY: 65,
    materiales: MATERIALES_GENERAL,
    activo: true,
    capacidad: 40,
  },
]

export const materialesInfo = {
  'Cartón': { color: '#8B4513', descripcion: 'Cajas y cartón limpio y seco' },
  'Papel': { color: '#4A90D9', descripcion: 'Diarios, revistas y papel de oficina' },
  'Vidrio': { color: '#2ECC71', descripcion: 'Botellas y frascos limpios sin tapa' },
  'Plástico': { color: '#E74C3C', descripcion: 'PET, PEAD y otros envases plásticos' },
  'Metales': { color: '#95A5A6', descripcion: 'Latas de aluminio y hojalata' },
  'Residuos orgánicos': { color: '#27AE60', descripcion: 'Restos de frutas, verduras y jardín' },
}

export const estadisticas = {
  totalPuntos: 4,
  puntosActivos: 4,
  toneladasMes: 12.4,
  familiasBeneficiadas: 3200,
}
