// Genera un "usuario" legible por vecino (ej: "stefania.figueredo"), a
// partir de su nombre y apellido, en vez de mostrar solo el nombre —
// que se repite fácil entre vecinos distintos y hace imposible
// distinguirlos en el panel de empleados. Se genera una sola vez por
// dispositivo y queda fijo (aunque la persona edite su nombre después).
//
// Para garantizar que nunca se repita de verdad entre dos dispositivos
// (no alcanza con "es poco probable"), se reserva en Firestore
// (colección "usuarios", id = el propio usuario) con una transacción:
// si "stefania.figueredo" ya está tomado, prueba "stefania.figueredo.2",
// ".3", etc. hasta encontrar uno libre.
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { idVecino } from './perfilLocal'

const CLAVE_USUARIO = 'mibaradero_usuario'
const MAX_INTENTOS = 40

// Mismo truco que en utils/voz.js para no depender de tipear caracteres
// unicode combinados literales en el código fuente.
const RANGO_ACENTOS = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g')

function normalizarParte(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(RANGO_ACENTOS, '') // saca acentos (é -> e)
    .replace(/[^a-z0-9]+/g, '') // deja solo letras y números
}

// Si este dispositivo ya tiene un usuario reservado, lo devuelve sin
// tocar la red.
export function usuarioVecinoLocal() {
  return localStorage.getItem(CLAVE_USUARIO) || ''
}

// Reserva (o recupera) el usuario de este dispositivo. Requiere nombre;
// el apellido es opcional.
export async function usuarioVecino(nombre, apellido) {
  const existente = usuarioVecinoLocal()
  if (existente) return existente

  const base = [normalizarParte(nombre), normalizarParte(apellido)].filter(Boolean).join('.') || 'vecino'

  for (let intento = 0; intento < MAX_INTENTOS; intento++) {
    const candidato = intento === 0 ? base : `${base}.${intento + 1}`
    try {
      await runTransaction(db, async tx => {
        const ref = doc(db, 'usuarios', candidato)
        const snap = await tx.get(ref)
        if (snap.exists()) throw new Error('ocupado')
        tx.set(ref, { id: idVecino(), creadoEn: serverTimestamp() })
      })
      localStorage.setItem(CLAVE_USUARIO, candidato)
      return candidato
    } catch {
      // Ocupado (o error de red) — probamos el siguiente candidato.
    }
  }

  // No se pudo reservar ninguno (ej: sin conexión). No bloqueamos el
  // guardado del perfil por esto — devolvemos uno igual con un sufijo
  // al azar, aunque no haya quedado reservado en Firestore.
  const usuario = `${base}.${Math.floor(1000 + Math.random() * 9000)}`
  localStorage.setItem(CLAVE_USUARIO, usuario)
  return usuario
}
