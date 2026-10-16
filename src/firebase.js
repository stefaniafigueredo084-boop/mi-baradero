import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuración del proyecto Firebase "Mi Baradero".
// El apiKey de Firebase es público por diseño (identifica el proyecto,
// no autoriza nada por sí solo) — el acceso real lo controlan las
// Reglas de Seguridad configuradas en Firebase Console.
const firebaseConfig = {
  apiKey: 'AIzaSyDNWL7TQUbIkLPIHTuz547PnH-GqiZsKAY',
  authDomain: 'mi-baradero.firebaseapp.com',
  projectId: 'mi-baradero',
  storageBucket: 'mi-baradero.firebasestorage.app',
  messagingSenderId: '4041145290',
  appId: '1:4041145290:web:5576905759f638cf80ad33',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

// Cada visitante tiene un uid real de Firebase Auth: si no inició sesión
// (Google o email), entra como anónimo. Ese uid es el que las Reglas de
// Firestore usan para saber de quién es cada perfil, pase, pasaje o
// reclamo. Devuelve el usuario actual (anónimo o no), creando la sesión
// anónima si todavía no hay ninguna.
let sesionEnCurso = null
export function asegurarSesion() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser)
  if (!sesionEnCurso) {
    sesionEnCurso = auth.authStateReady()
      .then(() => auth.currentUser || signInAnonymously(auth).then(c => c.user))
      .finally(() => { sesionEnCurso = null })
  }
  return sesionEnCurso
}
