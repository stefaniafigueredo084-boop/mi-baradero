import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Deja constancia en Firestore (colección "historial") de lo que hace
// cada trabajador: entradas/salidas del panel y altas/ediciones/bajas de
// contenido. El admin lo revisa desde la pestaña "Historial".
export async function registrarHistorial({ tipo, seccion, detalle }) {
  const usuario = auth.currentUser
  if (!usuario) return
  try {
    await addDoc(collection(db, 'historial'), {
      uid: usuario.uid,
      email: usuario.email,
      tipo, // 'login' | 'logout' | 'crear' | 'editar' | 'eliminar'
      seccion, // 'eventos' | 'combi' | 'residuos' | 'puntosVerdes' | 'usuarios'
      detalle: detalle || '',
      creadoEn: serverTimestamp(),
    })
  } catch {
    // Si falla el registro de historial no queremos romper la acción
    // real del usuario (guardar, borrar, etc.).
  }
}
