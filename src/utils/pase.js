import { puntosPagoEfectivo } from '../data/combiData'

// Reglas de negocio del módulo de pasajes de la combi, compartidas
// entre la pantalla del pasajero (Mi Pase / lugares disponibles) y el
// panel del conductor (escáner de embarque) — para no duplicar la
// lógica de categorías, tarifas, cupos de asientos y precios en dos
// lugares.
//
// Modelo: un "pasaje" es un ticket puntual para un viaje específico
// (fecha + horario), no un abono general. Se paga, un empleado confirma
// el pago, y recién ahí existe el QR — de un solo uso, se marca
// "usado" al escanearlo y no sirve más (a diferencia de la categoría
// verificada del pasajero, que sí es permanente: eso se sigue
// verificando una sola vez en pasajeros/{id}).

export const CATEGORIAS = [
  {
    id: 'comun',
    label: 'Común',
    tarifa: 'completa',
    requiereDocumento: false,
    prioridadAsiento: false,
    descripcion: 'Tarifa completa. No requiere verificación.',
  },
  {
    id: 'estudiante',
    label: 'Estudiante',
    tarifa: 'reducida',
    requiereDocumento: true,
    prioridadAsiento: false,
    descripcion: '50% de descuento, con constancia de alumno regular.',
    descripcionDocumento: 'Constancia de alumno regular',
    color: 'azul',
  },
  {
    id: 'jubilado',
    label: 'Jubilado',
    tarifa: 'reducida',
    requiereDocumento: true,
    prioridadAsiento: true,
    descripcion: '50% de descuento y prioridad de asiento, con carnet de jubilación.',
    descripcionDocumento: 'Carnet de jubilación',
    color: 'amber',
  },
  {
    id: 'discapacidad',
    label: 'Discapacidad',
    tarifa: 'gratis',
    requiereDocumento: true,
    prioridadAsiento: true,
    descripcion: 'Viaje sin cargo y prioridad de asiento, con carnet de discapacidad (CUD).',
    descripcionDocumento: 'Certificado Único de Discapacidad (CUD)',
    color: 'teal',
  },
]

export const categoriaPorId = id => CATEGORIAS.find(c => c.id === id) || CATEGORIAS[0]

export const LABEL_TARIFA = { completa: 'Tarifa completa', reducida: '50% de descuento', gratis: 'Sin cargo' }

// Qué contador de viaje corresponde incrementar cuando alguien de esa
// categoría ocupa su cupo prioritario (fuera de ahí, siempre suma al
// contador general).
const CONTADOR_PRIORITARIO = { discapacidad: 'embarcadosDiscapacidad', jubilado: 'embarcadosJubilado' }

// --- Categoría verificada del pasajero (permanente) ---------------------

// ¿Tiene esta persona la categoría X verificada y aprobada por un
// empleado? Solo así se le puede ofrecer esa tarifa al comprar un
// pasaje — mientras está pendiente o fue rechazada, solo puede comprar
// pasajes "Común".
export function categoriaVerificada(pasajero, categoriaId) {
  return pasajero?.estadoVerificacion === 'aprobada' && pasajero.categoriaSolicitada === categoriaId
}

// --- Tarifas por ruta ----------------------------------------------------

// Tarifas reales de la Combi Municipal (mismo precio en cualquiera de
// los dos sentidos del recorrido). Estudiante y jubilado pagan la
// mitad; discapacidad viaja siempre sin cargo.
const TARIFAS_RUTA = [
  { paradas: ['Alsina', 'Baradero'], comun: 2000 },
  { paradas: ['Portela', 'Baradero'], comun: 2600 },
]

export function tarifaBase(origen, destino) {
  const ruta = TARIFAS_RUTA.find(r => r.paradas.includes(origen) && r.paradas.includes(destino))
  // Combinación de paradas que no reconocemos (no debería pasar con los
  // horarios cargados hoy): usamos la tarifa más alta como resguardo,
  // nunca cobrar de menos por una ruta no contemplada.
  return ruta?.comun ?? Math.max(...TARIFAS_RUTA.map(r => r.comun))
}

export function calcularImporte(categoriaId, origen, destino) {
  const base = tarifaBase(origen, destino)
  if (categoriaId === 'discapacidad') return 0
  if (categoriaId === 'estudiante' || categoriaId === 'jubilado') return Math.round(base / 2)
  return base
}

// --- Identificadores determinísticos -------------------------------------

export function fechaHoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function idViaje(horarioId, fecha = fechaHoy()) {
  return `${horarioId}_${fecha}`
}

// Un pasaje por persona, por horario, por fecha — el mismo id determina
// si ya existe una compra (pendiente o confirmada) para ese viaje
// puntual, así nadie termina con dos pasajes para el mismo viaje.
export function idPasaje(pasajeroId, horarioId, fecha) {
  return `${pasajeroId}_${horarioId}_${fecha}`
}

// Alfabeto sin 0/O ni 1/I/l — letras y números que se pueden confundir
// entre sí al escucharlos o decirlos en voz alta.
const ALFABETO_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

// Código corto del pasaje (va adentro del QR, y además es lo que el
// pasajero puede dictarle de viva voz al conductor si falla la cámara
// o el celular — por eso 4 caracteres, no un id largo tipo UUID).
export function generarCodigo() {
  return Array.from({ length: 4 }, () => ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)]).join('')
}

// Cuánto antes de la salida se deja de poder comprar/elegir un horario
// — evita que alguien saque un pasaje para una combi que ya está por
// irse (o que ya se fue). Es una regla de uso, no de seguridad: se
// aplica en la pantalla de compra, no en las reglas de Firestore.
export const MINUTOS_CORTE_VENTA = 10

// Convierte "HH:MM" + "YYYY-MM-DD" en la fecha/hora real de salida de
// hoy, para poder calcular cuándo se liberan los asientos reservados.
export function salidaTimestamp(fecha, horaSalida) {
  const [h, m] = (horaSalida || '00:00').split(':').map(Number)
  const [y, mo, d] = fecha.split('-').map(Number)
  return new Date(y, (mo || 1) - 1, d || 1, h || 0, m || 0, 0, 0)
}

// Punto de pago en efectivo relevante para ESTE viaje puntual: el
// general de Baradero (toda ruta pasa por ahí) más la delegación de la
// otra punta del recorrido — a alguien que viaja Portela → Baradero le
// mostramos la Delegación de Portela, no la de Alsina.
export function puntosPagoParaRuta(origen, destino) {
  return puntosPagoEfectivo.puntos.filter(p => !p.localidad || p.localidad === origen || p.localidad === destino)
}

// Un campo de fecha/hora guardado en Firestore puede volver como
// Timestamp (leído recién de un doc existente), Date o milisegundos
// (recién calculado en el momento) — normaliza los tres casos a
// milisegundos para poder compararlos.
export function aMilisegundos(valor) {
  if (!valor) return null
  return typeof valor.toMillis === 'function' ? valor.toMillis() : new Date(valor).getTime()
}

// Plantilla por defecto para un horario que todavía no tiene los campos
// nuevos cargados (horarios ya existentes en Firestore, o los fijos de
// combiData.js).
export const PLANTILLA_VIAJE_DEFAULT = {
  capacidadTotal: 19,
  asientosReservadosDiscapacidad: 2,
  asientosReservadosJubilados: 2,
  minutosLiberacionReserva: 15,
}

// --- Cupos de asientos ---------------------------------------------------

// contadores: { embarcadosGeneral, embarcadosDiscapacidad, embarcadosJubilado }
export function calcularAsientos(viajeConfig, contadores, ahora = Date.now()) {
  const cfg = { ...PLANTILLA_VIAJE_DEFAULT, ...viajeConfig }
  const cont = { embarcadosGeneral: 0, embarcadosDiscapacidad: 0, embarcadosJubilado: 0, ...contadores }

  const totalEmbarcados = cont.embarcadosGeneral + cont.embarcadosDiscapacidad + cont.embarcadosJubilado
  const libres = Math.max(0, cfg.capacidadTotal - totalEmbarcados)

  // horarioSalidaTs puede llegar como Timestamp de Firestore (recién
  // leído de un doc "viajes" existente), como Date, o como milisegundos
  // (recién calculado con salidaTimestamp()) — lo normalizamos acá, en
  // un solo lugar, para que a quien llama no le importe cuál de los tres
  // le tocó.
  const salidaMs = cfg.horarioSalidaTs
    ? (typeof cfg.horarioSalidaTs.toMillis === 'function' ? cfg.horarioSalidaTs.toMillis() : new Date(cfg.horarioSalidaTs).getTime())
    : null
  const liberado = salidaMs != null ? ahora >= salidaMs - cfg.minutosLiberacionReserva * 60_000 : false

  const discapacidadLibres = Math.max(0, cfg.asientosReservadosDiscapacidad - cont.embarcadosDiscapacidad)
  const jubiladoLibres = Math.max(0, cfg.asientosReservadosJubilados - cont.embarcadosJubilado)
  const reservadosSinReclamar = liberado ? 0 : discapacidadLibres + jubiladoLibres
  const libresGeneral = Math.max(0, libres - reservadosSinReclamar)

  return {
    capacidadTotal: cfg.capacidadTotal,
    libres,
    libresGeneral,
    liberado,
    prioritarios: {
      discapacidad: { libres: discapacidadLibres, reservados: cfg.asientosReservadosDiscapacidad },
      jubilado: { libres: jubiladoLibres, reservados: cfg.asientosReservadosJubilados },
    },
  }
}

// Decide si un embarque de esta categoría entra en el viaje, y si ocupa
// un asiento prioritario o uno general. No escribe nada — el llamador
// (la transacción del escáner) usa esto para decidir qué guardar.
export function evaluarEmbarque(categoria, viajeConfig, contadores, ahora = Date.now()) {
  const asientos = calcularAsientos(viajeConfig, contadores, ahora)
  const tarifaAplicada = categoriaPorId(categoria).tarifa

  if (categoria === 'discapacidad' || categoria === 'jubilado') {
    if (asientos.libres <= 0) return { ok: false, motivo: 'sin_lugar' }
    const usaPrioritario = asientos.prioritarios[categoria].libres > 0
    return {
      ok: true,
      asientoTipo: usaPrioritario ? `prioritario_${categoria}` : 'general',
      tarifaAplicada,
      contador: usaPrioritario ? CONTADOR_PRIORITARIO[categoria] : 'embarcadosGeneral',
    }
  }

  // "comun" y "estudiante" no tienen cupo propio: compiten por los
  // asientos que no están reservados (o que ya se liberaron).
  if (asientos.libresGeneral <= 0) return { ok: false, motivo: 'sin_lugar_general' }
  return { ok: true, asientoTipo: 'general', tarifaAplicada, contador: 'embarcadosGeneral' }
}
