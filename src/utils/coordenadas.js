// [lat, lng] de un punto, o null si no tiene coordenadas válidas (pueden
// venir como texto desde el formulario del panel).
export const coordenadasDe = punto => {
  const lat = parseFloat(punto?.lat)
  const lng = parseFloat(punto?.lng)
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null
}
