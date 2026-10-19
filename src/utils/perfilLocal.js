// Helpers para leer el perfil que cada vecino guarda en su propio
// navegador (localStorage). El id se genera una sola vez por dispositivo
// y se reutiliza para actualizar siempre el mismo documento en Firestore
// (colección "vecinos"), en vez de crear uno nuevo cada vez que guarda.

const CLAVE_PERFIL = 'mibaradero_perfil'
const CLAVE_ID = 'mibaradero_vecino_id'
const CLAVE_CREADO = 'mibaradero_vecino_creado'

export function leerPerfilLocal() {
  try {
    const guardado = localStorage.getItem(CLAVE_PERFIL)
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

// Zona de recolección del vecino (nombre de una zona de Residuos). Se
// guarda en el mismo perfil local; el evento avisa a las otras
// pantallas abiertas (la portada y Residuos la muestran).
export const EVENTO_PERFIL = 'mibaradero-perfil'

export function zonaVecino() {
  return leerPerfilLocal()?.zona || ''
}

export function guardarZonaVecino(zona) {
  const perfil = { ...(leerPerfilLocal() || {}), zona }
  try {
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil))
  } catch {
    // Sin localStorage: la zona vale solo mientras está abierta la página.
  }
  window.dispatchEvent(new Event(EVENTO_PERFIL))
}

export function nombreVecino() {
  return leerPerfilLocal()?.nombre?.trim() || ''
}

export function idVecino() {
  let id = localStorage.getItem(CLAVE_ID)
  if (!id) {
    id = (crypto.randomUUID?.() || `v_${Date.now()}_${Math.random().toString(36).slice(2)}`)
    localStorage.setItem(CLAVE_ID, id)
  }
  return id
}

// Los vecinos no pueden leer su propio documento en Firestore (solo el
// admin puede leer la colección "vecinos"), así que no se puede
// consultar si ya existe antes de guardar. Se recuerda localmente si
// esta es la primera vez, para mandar "creadoEn" una sola vez.
export function esPrimerGuardadoVecino() {
  return localStorage.getItem(CLAVE_CREADO) !== '1'
}

export function marcarVecinoGuardado() {
  localStorage.setItem(CLAVE_CREADO, '1')
}

export function olvidarVecino() {
  localStorage.removeItem(CLAVE_ID)
  localStorage.removeItem(CLAVE_CREADO)
}
