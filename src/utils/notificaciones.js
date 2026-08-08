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

export function mostrarNotificacion(titulo, opciones) {
  if (!permisoConcedido()) return
  try {
    new Notification(titulo, opciones)
  } catch {
    // Algunos navegadores móviles exponen el permiso pero no soportan
    // instanciar Notification directamente (piden Service Worker).
  }
}
