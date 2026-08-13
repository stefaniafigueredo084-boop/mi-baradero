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

// Voz de Tachín (mascota): la mayoría de los navegadores no ofrecen
// voces infantiles reales en español, así que además de tratar de
// encontrar una que sí lo aclare en el nombre, el efecto "más
// infantil, tierna y amigable" se logra sobre todo con el pitch/rate
// más altos con los que se la hace hablar (ver hablarTachin más abajo).
let vozTachinCache = null
async function elegirVozTachin() {
  if (vozTachinCache !== null) return vozTachinCache
  const voces = await obtenerVoces()
  const esEspanol = voces.filter(v => v.lang?.toLowerCase().startsWith('es'))
  const preferida =
    esEspanol.find(v => /(infantil|child|kids|junior)/i.test(v.name)) ||
    esEspanol.find(v => /google/i.test(v.name)) ||
    esEspanol.find(v => /(mujer|female|paulina|mónica|monica|helena|elvira|sabina|lucia|luciana|camila|valentina)/i.test(v.name)) ||
    esEspanol[0] ||
    null
  vozTachinCache = preferida
  return preferida
}

// Corta el texto en oraciones (por ".", "!", "?" o "…") para poder
// hablarlas una por una con una pausa real entre medio — el navegador
// no soporta pausas tipo SSML dentro de una sola frase, así que la
// forma de lograr un ritmo pausado es literalmente hablar de a partes.
function dividirEnFrases(texto) {
  return texto
    .split(/(?<=[.!?…])\s+/)
    .map(f => f.trim())
    .filter(Boolean)
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function hablarFrase(frase, voz, rate, pitch) {
  return new Promise(resolve => {
    const utterance = new SpeechSynthesisUtterance(frase)
    utterance.lang = 'es-AR'
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = 1
    if (voz) utterance.voice = voz
    utterance.onend = resolve
    utterance.onerror = resolve
    window.speechSynthesis.speak(utterance)
  })
}

// Se usa para poder cortar una lectura larga a la mitad (botón "detener")
// sin que el resto de las frases pendientes se sigan escuchando.
let generacionActual = 0

// Dice un texto en voz alta, de a una oración por vez con una pequeña
// pausa entre cada una, y resuelve cuando termina (o cuando se cancela).
// "opciones" permite pedir otra voz/tono — lo usa hablarTachin() para
// sonar distinto (más infantil) del narrador general de la app.
export async function hablar(texto, opciones = {}) {
  if (!soportaSintesisVoz()) return
  const {
    elegirVoz = elegirVozCalida,
    rate = 0.9, // pausada, sin apurarse
    pitch = 1.02, // casi natural, apenas suavizada (evita sonar "artificial")
  } = opciones
  const miGeneracion = ++generacionActual
  window.speechSynthesis.cancel()
  const voz = await elegirVoz()
  const frases = dividirEnFrases(texto)

  for (let i = 0; i < frases.length; i++) {
    if (miGeneracion !== generacionActual) return // se canceló o se pidió hablar otra cosa
    await hablarFrase(frases[i], voz, rate, pitch)
    if (miGeneracion !== generacionActual) return
    if (i < frases.length - 1) await esperar(180) // pausa breve entre oraciones
  }
}

// Tachín habla con un tono más agudo y un pelín más rápido que el
// narrador general de la app — es la mascota, no un aviso formal — así
// que suena más infantil, tierna y amigable.
export function hablarTachin(texto) {
  return hablar(texto, { elegirVoz: elegirVozTachin, rate: 1.05, pitch: 1.45 })
}

export function detenerVoz() {
  generacionActual++
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

export function normalizar(texto) {
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
