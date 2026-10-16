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

// Cambios de letra que suenan igual ("kagada", "volud", "sorra",
// "ijo de..."): se aplican tanto a lo que escribe el vecino como a las
// listas, así una sola entrada cubre todas las variantes.
function fonetica(palabra) {
  return palabra
    .replace(/k/g, 'c')
    .replace(/v/g, 'b')
    .replace(/z/g, 's')
    .replace(/^h(?=[aeiou])/, '')
}

const EXACTAS_F = new Set([...EXACTAS].map(fonetica))
const PREFIJOS_F = PREFIJOS.map(fonetica)

function limpiar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // saca acentos
    .replace(/[013457@$]/g, c => DISFRACES[c])
    .replace(/[^a-z*]+/g, ' ') // todo lo que no es letra (ni *) separa palabras
    .replace(/([aeiou])\1+/g, '$1') // "putaaaa" -> "puta"
    .replace(/([^aeiou* ])\1{2,}/g, '$1') // "pppputo" -> "puto"
    .trim()
}

// "p*ta", "m**rda": cada asterisco puede tapar cualquier vocal. Se
// prueban todas las combinaciones (hasta 2 asteriscos por palabra).
function variantesAsterisco(palabra) {
  if (!palabra.includes('*')) return [palabra]
  if ((palabra.match(/\*/g) || []).length > 2) return [palabra.replace(/\*/g, '')]
  let variantes = ['']
  for (const letra of palabra) {
    variantes = letra === '*'
      ? variantes.flatMap(v => [...'aeiou'].map(vocal => v + vocal))
      : variantes.map(v => v + letra)
  }
  return variantes
}

// "p u t a" -> "puta" y "pu.ta" / "mi-er-da" -> "puta" / "mierda": une
// pedazos cortos seguidos (de hasta 3 letras, de a 2 a 4 pedazos). Solo
// pedazos cortos, para no armar insultos juntando palabras normales.
function unirPedazos(palabras) {
  const resultado = []
  for (let i = 0; i < palabras.length; i++) {
    let unida = palabras[i]
    if (unida.length > 3) continue
    for (let j = i + 1; j < Math.min(palabras.length, i + 4); j++) {
      if (palabras[j].length > 3) break
      unida += palabras[j]
      resultado.push(unida)
    }
  }
  return resultado
}

function esInsulto(palabra) {
  const f = fonetica(palabra)
  return EXACTAS_F.has(f) || PREFIJOS_F.some(prefijo => f.startsWith(prefijo))
}

export function tieneMalasPalabras(texto) {
  const limpio = limpiar(texto)
  if (!limpio) return false
  if (FRASES.some(frase => frase.test(limpio.replace(/\*/g, '')))) return true
  const palabras = limpio.split(' ').flatMap(variantesAsterisco)
  return [...palabras, ...unirPedazos(palabras)].some(esInsulto)
}

export const MENSAJE_MALAS_PALABRAS =
  'Tu mensaje tiene palabras ofensivas. Escribilo con respeto para poder enviarlo.'
