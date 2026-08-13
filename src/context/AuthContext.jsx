import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

// Sesión de vecino para la web pública (Google o email/contraseña).
// Es independiente del panel de trabajadores en el sentido de "para qué
// se usa", pero comparte la misma instancia de Firebase Auth — por eso
// useTrabajador.js nunca le da acceso de admin a una cuenta sin
// documento en "trabajadores" (ver ese archivo).
const AuthContext = createContext({ usuario: undefined })

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(undefined) // undefined = cargando, null = sin sesión

  useEffect(() => onAuthStateChanged(auth, setUsuario), [])

  return <AuthContext.Provider value={{ usuario }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
