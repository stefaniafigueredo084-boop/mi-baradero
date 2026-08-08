// Sectores en los que se puede dividir el acceso al panel de trabajadores.
// Un trabajador tiene rol "admin" (accede a todo + historial) o rol
// "sector" con exactamente uno de estos ids asignado en trabajadores/{uid}.
export const SECTORES = [
  { id: 'eventos', label: 'Eventos' },
  { id: 'combi', label: 'Combi Municipal' },
  { id: 'residuos', label: 'Residuos' },
  { id: 'puntosVerdes', label: 'Puntos Verdes' },
]

export const labelSector = id => SECTORES.find(s => s.id === id)?.label || id
