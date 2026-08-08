// Wrapper seguro sobre la API de Notification del navegador.
//
// Safari en iPhone/iPad (y algunos navegadores embebidos, como el de
// Instagram o Facebook) no implementan `window.Notification` — acceder
// directo a `Notification.permission` ahí tira un ReferenceError que
// corta en seco cualquier función async que lo llame (por ejemplo,
// "Guardar perfil"), sin mostrar ningún error visible. Estas funciones
// se fijan primero si la API existe, así el resto de la app nunca choca
// contra eso: en esos navegadores simplemente no hay notificaciones,
// pero todo lo demás (guardar datos, etc.) sigue funcionando.

import { nombreVecino } from './perfilLocal'
import { hablar } from './voz'

export const soportaNotificaciones = () => typeof window !== 'undefined' && 'Notification' in window

export async function pedirPermisoNotificacion() {
  if (!soportaNotificaciones()) return 'unsupported'
  if (Notification.permission === 'default') {
    try {
      return await Notification.requestPermission()
    } catch {
      return 'denied'
    }
  }
  return Notification.permission
}

export function permisoConcedido() {
  return soportaNotificaciones() && Notification.permission === 'granted'
}

function lectorActivo() {
  try {
    return JSON.parse(localStorage.getItem('mibaradero_accesibilidad') || 'null')?.lector === true
  } catch {
    return false
  }
}

function notifVozActiva(sector) {
  if (!sector) return false
  try {
    const perfil = JSON.parse(localStorage.getItem('mibaradero_perfil') || 'null')
    return perfil?.notifVoz?.[sector] === true
  } catch {
    return false
  }
}

// Además de la notificación visual del navegador, si la persona tiene
// activado el lector de pantalla Y eligió que este sector le llegue
// hablado, lee el mensaje en voz alta.
export function mostrarNotificacion(titulo, opciones, sector) {
  if (permisoConcedido()) {
    try {
      new Notification(titulo, opciones)
    } catch {
      // Algunos navegadores móviles exponen el permiso pero no soportan
      // instanciar Notification directamente (piden Service Worker).
    }
  }
  if (opciones?.body && lectorActivo() && notifVozActiva(sector)) {
    hablar(opciones.body)
  }
}

// Antepone un saludo con el nombre guardado en el perfil del vecino
// (si cargó uno), para personalizar el cuerpo de las notificaciones.
export function saludar(mensaje) {
  const nombre = nombreVecino()
  return nombre ? `¡Hola ${nombre}! ${mensaje}` : mensaje
}
