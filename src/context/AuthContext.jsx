import { createContext, useContext, useEffect, useState } from 'react'
import { onIdTokenChanged } from 'firebase/auth'
import { auth, asegurarSesion } from '../firebase'

// Sesión de vecino para la web pública (Google o email/contraseña).
// Es independiente del panel de trabajadores en el sentido de "para qué
// se usa", pero comparte la misma instancia de Firebase Auth — por eso
// useTrabajador.js nunca le da acceso de admin a una cuenta sin
// documento en "trabajadores" (ver ese archivo).
//
// Quien no inició sesión entra igual con una sesión anónima, para tener
// un uid propio (las Reglas de Firestore lo usan para saber de quién es
// cada dato). Por eso hay dos valores:
//   usuario: la cuenta "de verdad" (Google/email), o null si es anónimo
//   uid:     el uid de la sesión actual, anónima o no
// Se escucha onIdTokenChanged (no onAuthStateChanged) porque al vincular
// la sesión anónima con Google o email el usuario es el mismo objeto y
// onAuthStateChanged no avisa — el token sí cambia.
const AuthContext = createContext({ usuario: undefined, uid: undefined })

export function AuthProvider({ children }) {
  const [estado, setEstado] = useState({ usuario: undefined, uid: undefined }) // undefined = cargando

  useEffect(() => onIdTokenChanged(auth, u => {
    if (!u) {
      // Sin sesión (recién abierta la app, o cerró sesión): se crea una
      // anónima. Si falla (ej: Anonymous Auth desactivado en Firebase),
      // la app sigue andando para leer; solo fallan las escrituras.
      setEstado({ usuario: null, uid: undefined })
      asegurarSesion().catch(() => setEstado({ usuario: null, uid: null }))
      return
    }
    setEstado({ usuario: u.isAnonymous ? null : u, uid: u.uid })
  }), [])

  return <AuthContext.Provider value={estado}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
