import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'

// Reclamos que puede ver el trabajador logueado, en tiempo real, más
// nuevo primero. "departamentos" null = todos (admin y Atención al
// Vecino); una lista = solo los de esos departamentos (un sector como
// Combi o Residuos). Las reglas de Firestore solo dejan listar lo que le
// corresponde a cada uno, por eso la consulta tiene que pedir exactamente
// eso. Se ordena acá y no en la consulta para no necesitar un índice
// compuesto en Firestore.
export function useReclamos(departamentos) {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const clave = departamentos === null ? '*' : departamentos.join(',')

  useEffect(() => {
    if (departamentos !== null && departamentos.length === 0) {
      setItems([])
      setCargando(false)
      return
    }
    setCargando(true)
    const ref = collection(db, 'reclamos')
    const q = departamentos === null ? ref : query(ref, where('departamento', 'in', departamentos))
    return onSnapshot(
      q,
      snap => {
        const fecha = d => d.creadoEn?.toMillis?.() ?? Date.now()
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => fecha(b) - fecha(a)))
        setCargando(false)
      },
      () => setCargando(false)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  return { items, cargando }
}
