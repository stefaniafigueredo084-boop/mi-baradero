import { normalizar } from '../utils/voz'

// A qué sección lleva cada cosa que un vecino podría llegar a decir
// cuando el saludo por voz le pregunta "¿a dónde querés ir?" — varias
// palabras por sección porque nadie usa siempre el mismo término
// (algunos dicen "combi", otros "colectivo" o "micro"; algunos
// "basura", otros "residuos" o "recolección").
export const COMANDOS_VOZ = [
  { ruta: '/combi', etiqueta: 'la Combi Municipal', palabras: ['combi', 'colectivo', 'micro', 'bus', 'pasaje', 'pasajes', 'horario', 'horarios'] },
  { ruta: '/residuos', etiqueta: 'Recolección de Residuos', palabras: ['residuo', 'residuos', 'basura', 'camion', 'recoleccion'] },
  { ruta: '/eventos', etiqueta: 'Eventos y Noticias', palabras: ['evento', 'eventos', 'noticia', 'noticias', 'agenda', 'fiesta'] },
  { ruta: '/puntos-verdes', etiqueta: 'Puntos Verdes', palabras: ['punto verde', 'puntos verdes', 'reciclaje', 'reciclar'] },
  { ruta: '/perfil', etiqueta: 'tu Perfil', palabras: ['perfil', 'mis datos', 'mis notificaciones'] },
]

// Busca, entre lo que dijo la persona, alguna palabra clave de algún
// sector — la primera que coincide gana. Devuelve null si no reconoce
// nada: mejor no adivinar que llevar a alguien a la sección equivocada.
export function interpretarComandoVoz(texto) {
  const dicho = normalizar(texto)
  return COMANDOS_VOZ.find(c => c.palabras.some(palabra => dicho.includes(normalizar(palabra)))) || null
}
