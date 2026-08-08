import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
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
