// Filtro de malas palabras para lo que escribe un vecino (reclamos,
// etc.). No pretende ser infalible: corta los insultos comunes del
// español rioplatense y sus disfraces típicos ("p u t a", "put4",
// "putaaaa"), sin frenar palabras normales que los contienen
// ("computadora", "disputa", "ortografía", "cálculo").

// Coincidencia exacta de palabra — para las que, como prefijo, chocarían
// con palabras comunes (put-refacto, orto-grafía, forr-aje, cag-...).
const EXACTAS = new Set([
  'puta', 'puto', 'putas', 'putos', 'putita', 'putito', 'puton', 'putona', 'putazo', 'reputa', 'reputo',
  'putear', 'puteada', 'hijueputa', 'hijaputa', 'hijoputa',
  'hdp', 'hdrmp', 'lpm', 'lptm', 'lpmqtp', 'lcdtm', 'lrcdtm', 'ctm', 'ptm',
  'culo', 'culos', 'orto', 'ortos', 'ojete',
  'pija', 'pijas', 'verga', 'vergas', 'poronga', 'porongas', 'chota', 'choto', 'chotas', 'chotos',
  'forro', 'forros', 'forra', 'forras',
  'cagar', 'cagada', 'cagadas', 'cagon', 'cagona', 'cagones', 'cagaste', 'cagaron', 'cagando',
  'carajo', 'carajos',
  'garca', 'garcas',
  'trolo', 'trola', 'trolos', 'trolas', 'marica', 'maricas', 'maricon', 'maricones',
  'pendejo', 'pendeja', 'pendejos', 'pendejas',
  'zorra', 'zorras', 'petero', 'petera',
  'bastardo', 'bastarda', 'bastardos', 'cornudo', 'cornuda', 'cornudos',
  'subnormal', 'subnormales', 'sidoso', 'sidosa',
  'chupala', 'chupame', 'chupamela', 'chupenla', 'mamala',
  'joder', 'jodete', 'jodanse',
  'reconcha', 'conchetumare', 'conchetumadre',
  'shit', 'bitch', 'asshole', 'motherfucker',
])

// Comienzo de palabra — cubre plurales, femeninos y derivados.
const PREFIJOS = [
  'pelotud', 'bolud', 'mierd', 'conchud', 'culiad', 'culead', 'pajer', 'sorete',
  'tarad', 'imbecil', 'estupid', 'idiot', 'mogolic', 'garch', 'fuck',
]

// Frases: "concha" sola es una palabra normal, el insulto es la frase.
const FRASES = [/\bconcha (de )?(tu|tus|su|sus|la lora)\b/]

const DISFRACES = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' }

function limpiar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // saca acentos
    .replace(/[013457@$]/g, c => DISFRACES[c])
    .replace(/[^a-z]+/g, ' ') // todo lo que no es letra separa palabras
    .replace(/([aeiou])\1+/g, '$1') // "putaaaa" -> "puta"
    .replace(/([^aeiou ])\1{2,}/g, '$1') // "pppputo" -> "puto"
    .trim()
}

// "p u t a" -> "puta": une las letras sueltas seguidas en una palabra.
function unirLetrasSueltas(palabras) {
  const resultado = []
  let suelta = ''
  for (const palabra of palabras) {
    if (palabra.length === 1) {
      suelta += palabra
      continue
    }
    if (suelta) resultado.push(suelta)
    suelta = ''
    resultado.push(palabra)
  }
  if (suelta) resultado.push(suelta)
  return resultado
}

export function tieneMalasPalabras(texto) {
  const limpio = limpiar(texto)
  if (!limpio) return false
  if (FRASES.some(frase => frase.test(limpio))) return true
  const palabras = limpio.split(' ')
  return [...palabras, ...unirLetrasSueltas(palabras)].some(
    palabra => EXACTAS.has(palabra) || PREFIJOS.some(prefijo => palabra.startsWith(prefijo))
  )
}

export const MENSAJE_MALAS_PALABRAS =
  'Tu mensaje tiene palabras ofensivas. Escribilo con respeto para poder enviarlo.'
