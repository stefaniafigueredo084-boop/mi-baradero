// Ubicaciones reales, confirmadas por el municipio (agosto 2026).
// lat/lng: el cruce de las dos calles de la dirección, calculado con los
// datos de OpenStreetMap (octubre 2026). Si una esquina no se pudo
// ubicar, el punto no lleva lat/lng y no aparece en el mapa (sí en la
// lista, con "Cómo llegar" por dirección). Se pueden cargar desde el panel.
const HORARIO_GENERAL = 'Lun a Vie: 8:00 - 20:00'
const MATERIALES_GENERAL = ['Cartón', 'Papel', 'Vidrio', 'Plástico', 'Metales']

export const puntosVerdes = [
  {
    id: 1,
    nombre: 'Punto Verde Plaza Che Guevara',
    direccion: 'Pueyrredón y Pacheco de Melo',
    horario: HORARIO_GENERAL,
    lat: -33.801499,
    lng: -59.510881,
    materiales: MATERIALES_GENERAL,
    activo: true,
    capacidad: 40,
  },
  {
    id: 2,
    nombre: 'Punto Verde Plaza de los Intendentes',
    direccion: 'Malabia y Pringles',
    horario: HORARIO_GENERAL,
    lat: -33.815432,
    lng: -59.489799,
    materiales: MATERIALES_GENERAL,
    activo: true,
    capacidad: 40,
  },
  {
    id: 3,
    nombre: 'Punto Verde Plaza Colón',
    direccion: 'Medrano y Laprida',
    horario: HORARIO_GENERAL,
    lat: -33.812699,
    lng: -59.504429,
    materiales: MATERIALES_GENERAL,
    activo: true,
    capacidad: 40,
  },
  {
    id: 4,
    nombre: 'Punto Verde Plaza Malvinas Argentinas',
    direccion: "Liaudat y O'Roarke",
    horario: HORARIO_GENERAL,
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
