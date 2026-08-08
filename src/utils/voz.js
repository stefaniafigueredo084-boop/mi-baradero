// Utilidades de voz para el asistente de registro (Web Speech API
// nativa del navegador — sin servicios externos ni costo).
//
// Reconocimiento de voz (SpeechRecognition) solo está bien soportado en
// navegadores basados en Chromium (Chrome, Edge, Chrome Android). En
// Firefox y en la mayoría de Safari/iPhone no existe — soportaReconocimientoVoz()
// permite avisarle al usuario en vez de que la función falle en silencio.

export function soportaReconocimientoVoz() {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function soportaSintesisVoz() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// El navegador tarda en cargar la lista de voces instaladas (a veces es
// asincrónico, vía el evento "voiceschanged"). La cacheamos una sola vez.
let vocesCache = null

function obtenerVoces() {
  return new Promise(resolve => {
    if (!soportaSintesisVoz()) return resolve([])
    const voces = window.speechSynthesis.getVoices()
    if (voces.length > 0) return resolve(voces)
    window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices())
    // Si el navegador nunca dispara el evento, no nos quedamos esperando.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500)
  })
}

// Entre las voces en español disponibles, prioriza las que suelen sonar
// más naturales/cálidas (voces "Google" en Chrome, o nombres de voces
// femeninas que suelen tener una entonación más suave), en vez de la
// primera voz robótica que encuentre el navegador.
async function elegirVozCalida() {
  if (vocesCache !== null) return vocesCache
  const voces = await obtenerVoces()
  const esEspanol = voces.filter(v => v.lang?.toLowerCase().startsWith('es'))
  const preferida =
    esEspanol.find(v => /google/i.test(v.name)) ||
    esEspanol.find(v => /(mujer|female|paulina|mónica|monica|helena|elvira|sabina|lucia|luciana|camila|valentina)/i.test(v.name)) ||
    esEspanol[0] ||
    null
  vocesCache = preferida
  return preferida
}

// Arma (sin hablar todavía) una frase configurada con una voz cálida y
// un tono/velocidad más suaves que el default robótico del navegador.
export async function crearVoz(texto) {
  const utterance = new SpeechSynthesisUtterance(texto)
  utterance.lang = 'es-AR'
  utterance.rate = 0.95 // un poco más lenta, se entiende mejor y suena más calma
  utterance.pitch = 1.08 // un poco más aguda, suaviza el tono
  utterance.volume = 1
  const voz = await elegirVozCalida()
  if (voz) utterance.voice = voz
  return utterance
}

// Dice un texto en voz alta y resuelve cuando termina de hablar.
export async function hablar(texto) {
  if (!soportaSintesisVoz()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = await crearVoz(texto)
  return new Promise(resolve => {
    utterance.onend = resolve
    utterance.onerror = resolve
    synth.speak(utterance)
  })
}

export function detenerVoz() {
  window.speechSynthesis?.cancel()
}

// Escucha una frase del micrófono y resuelve con el texto reconocido.
// Rechaza si no hay soporte, si hubo un error, o si pasó el timeout sin
// detectar habla.
export function escuchar({ timeoutMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return reject(new Error('no-soportado'))

    const reconocimiento = new SR()
    reconocimiento.lang = 'es-AR'
    reconocimiento.interimResults = false
    reconocimiento.maxAlternatives = 1

    let terminado = false
    const finalizar = (fn, valor) => {
      if (terminado) return
      terminado = true
      clearTimeout(temporizador)
      try { reconocimiento.stop() } catch { /* ya estaba detenido */ }
      fn(valor)
    }

    const temporizador = setTimeout(() => finalizar(reject, new Error('timeout')), timeoutMs)

    reconocimiento.onresult = e => finalizar(resolve, e.results[0][0].transcript.trim())
    reconocimiento.onerror = e => finalizar(reject, new Error(e.error || 'error-reconocimiento'))
    reconocimiento.onend = () => finalizar(reject, new Error('sin-habla'))

    try {
      reconocimiento.start()
    } catch (err) {
      finalizar(reject, err)
    }
  })
}

const RANGO_ACENTOS = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g')

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(RANGO_ACENTOS, '') // saca acentos (á -> a, é -> e, etc.)
    .replace(/[^\w\s]/g, '') // saca puntuación
    .trim()
}

const PALABRAS_SI = ['si', 'sii', 'siii', 'dale', 'correcto', 'exacto', 'afirmativo', 'claro', 'obvio', 'ok', 'okay']
const PALABRAS_NO = ['no', 'nop', 'nope', 'negativo', 'incorrecto', 'para nada', 'nunca']

export function esAfirmativo(texto) {
  const palabras = normalizar(texto).split(/\s+/)
  return palabras.some(p => PALABRAS_SI.includes(p))
}

export function esNegativo(texto) {
  const palabras = normalizar(texto).split(/\s+/)
  return palabras.some(p => PALABRAS_NO.includes(p))
}
