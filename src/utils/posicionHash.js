// Los puntos verdes cargados desde el panel de trabajadores no traen una
// posición en el mapa (el formulario no la pide). Se les asigna una
// posición pseudo-aleatoria pero estable, derivada del id del documento,
// para que no se mueva en cada recarga.
export function posicionDesdeId(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return { posX: 20 + (hash % 60), posY: 20 + ((hash >> 8) % 60) }
}
