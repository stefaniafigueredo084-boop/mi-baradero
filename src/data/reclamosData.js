// Opciones compartidas entre el formulario público de reclamos
// (pages/Reclamos.jsx) y la bandeja del panel de trabajadores
// (components/panel/ReclamosPanel.jsx) — así los dos lados usan siempre
// los mismos ids y etiquetas.
import { Lightbulb, ThumbsDown, ThumbsUp, Wrench } from 'lucide-react'

export const TIPOS_RECLAMO = [
  { id: 'queja', label: 'Queja', icono: ThumbsDown, color: 'bg-red-50 text-red-500', desc: 'Algo te molestó o no funcionó bien' },
  { id: 'reclamo', label: 'Reclamo', icono: Wrench, color: 'bg-amber-100 text-amber-900', desc: 'Algo que hay que arreglar o resolver' },
  { id: 'sugerencia', label: 'Sugerencia', icono: Lightbulb, color: 'bg-secundario/10 text-secundario', desc: 'Una idea para mejorar' },
  { id: 'felicitacion', label: 'Felicitación', icono: ThumbsUp, color: 'bg-primario/10 text-primario', desc: 'Algo que salió bien' },
]

// Departamento municipal que se encarga de cada reclamo. "sector" es el
// sector del panel de trabajadores que lo recibe en su pestaña; los
// departamentos sin sector propio en el panel los recibe Atención al
// Vecino (sector "reclamos"), que los gestiona con esa área.
//
// OJO: si cambia qué departamento va a qué sector, actualizar también
// deptosDelSector() en firestore.rules.
export const DEPARTAMENTOS = [
  { id: 'atencionVecino', label: 'Atención al Vecino', sector: 'reclamos' },
  { id: 'transporte', label: 'Transporte (Combi Municipal)', sector: 'combi' },
  { id: 'higieneUrbana', label: 'Higiene Urbana (Residuos)', sector: 'residuos' },
  { id: 'ambiente', label: 'Ambiente (Puntos Verdes)', sector: 'puntosVerdes' },
  { id: 'cultura', label: 'Cultura y Eventos', sector: 'eventos' },
  { id: 'obrasPublicas', label: 'Obras Públicas', sector: 'reclamos' },
  { id: 'alumbrado', label: 'Alumbrado Público', sector: 'reclamos' },
  { id: 'espaciosVerdes', label: 'Espacios Verdes', sector: 'reclamos' },
  { id: 'sistemas', label: 'Sistemas (Mi Baradero)', sector: 'reclamos' },
]

// El tema que elige el vecino define a qué departamento llega.
export const AREAS_RECLAMO = [
  { id: 'combi', label: 'Combi Municipal', departamento: 'transporte' },
  { id: 'residuos', label: 'Recolección de Residuos', departamento: 'higieneUrbana' },
  { id: 'puntosVerdes', label: 'Puntos Verdes', departamento: 'ambiente' },
  { id: 'eventos', label: 'Eventos', departamento: 'cultura' },
  { id: 'calles', label: 'Calles y veredas', departamento: 'obrasPublicas' },
  { id: 'alumbrado', label: 'Alumbrado público', departamento: 'alumbrado' },
  { id: 'espaciosVerdes', label: 'Plazas y espacios verdes', departamento: 'espaciosVerdes' },
  { id: 'app', label: 'La aplicación', departamento: 'sistemas' },
  { id: 'otro', label: 'Otro', departamento: 'atencionVecino' },
]

// "nuevo" lo pone siempre el vecino al enviar; los otros dos solo los
// puede poner un trabajador desde el panel (ver firestore.rules).
export const ESTADOS_RECLAMO = [
  { id: 'nuevo', label: 'Recibido', color: 'bg-amber-100 text-amber-900' },
  { id: 'en_proceso', label: 'En proceso', color: 'bg-secundario/10 text-secundario' },
  { id: 'resuelto', label: 'Resuelto', color: 'bg-primario/10 text-primario' },
]

export const tipoReclamoPorId = id => TIPOS_RECLAMO.find(t => t.id === id) || TIPOS_RECLAMO[1]
export const areaReclamoPorId = id => AREAS_RECLAMO.find(a => a.id === id) || AREAS_RECLAMO[AREAS_RECLAMO.length - 1]
export const estadoReclamoPorId = id => ESTADOS_RECLAMO.find(e => e.id === id) || ESTADOS_RECLAMO[0]
export const departamentoPorId = id => DEPARTAMENTOS.find(d => d.id === id) || DEPARTAMENTOS[0]

// Departamento actual del reclamo: el que tiene guardado (puede haber
// sido derivado desde el panel) o, si no tiene, el que corresponde a su tema.
export const departamentoDeReclamo = reclamo =>
  departamentoPorId(reclamo.departamento || areaReclamoPorId(reclamo.area).departamento)

export const departamentosDelSector = sector => DEPARTAMENTOS.filter(d => d.sector === sector).map(d => d.id)

// Código corto para que el vecino y el empleado puedan referirse al
// mismo reclamo sin dictar el id completo de Firestore.
export const codigoReclamo = id => `#${String(id).slice(-6).toUpperCase()}`

// "#abc123", "abc 123", "ABC123" → "ABC123" (o '' si no tiene 6 letras/números).
export const normalizarCodigo = texto => {
  const limpio = String(texto || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  return limpio.length === 6 ? limpio : ''
}

export function fechaReclamo(marca) {
  const fecha = marca?.toDate?.()
  if (!fecha) return ''
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' · ' + fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}
