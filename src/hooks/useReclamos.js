import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'

// De a cuántos reclamos se cargan en el panel (botón "Ver más" para
// traer otra tanda) — así el panel no baja la colección entera, fotos
// incluidas, cada vez que se abre.
export const TANDA_RECLAMOS = 30

// Reclamos que puede ver el trabajador logueado, en tiempo real, más
// nuevo primero. "departamentos" null = todos (admin y Atención al
// Vecino); una lista = solo los de esos departamentos (un sector como
// Combi o Residuos). Las reglas de Firestore solo dejan listar lo que le
// corresponde a cada uno, por eso la consulta tiene que pedir exactamente
// eso.
//
// Filtrar por departamento Y ordenar por fecha necesita un índice
// compuesto (está en firestore.indexes.json). Si todavía no se creó en
// Firebase, la consulta falla con "failed-precondition": en ese caso se
// pide sin ordenar (sigue limitada) y se ordena acá.
export function useReclamos(departamentos) {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [cantidad, setCantidad] = useState(TANDA_RECLAMOS)
  const clave = departamentos === null ? '*' : departamentos.join(',')

  useEffect(() => { setCantidad(TANDA_RECLAMOS) }, [clave])

  useEffect(() => {
    if (departamentos !== null && departamentos.length === 0) {
      setItems([])
      setCargando(false)
      return
    }
    setCargando(true)
    setError('')
    const ref = collection(db, 'reclamos')
    const filtro = departamentos === null ? [] : [where('departamento', 'in', departamentos)]
    const fecha = d => d.creadoEn?.toMillis?.() ?? Date.now()
    let desuscribir = () => {}

    const escuchar = ordenado => {
      const q = query(ref, ...filtro, ...(ordenado ? [orderBy('creadoEn', 'desc')] : []), limit(cantidad))
      desuscribir = onSnapshot(
        q,
        snap => {
          setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => fecha(b) - fecha(a)))
          setCargando(false)
        },
        err => {
          if (ordenado && err.code === 'failed-precondition') { escuchar(false); return }
          setError('No se pudieron cargar los reclamos. Revisá tu conexión y recargá la página.')
          setCargando(false)
        }
      )
    }
    escuchar(true)
    return () => desuscribir()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, cantidad])

  return {
    items,
    cargando,
    error,
    hayMas: items.length >= cantidad,
    cargarMas: () => setCantidad(c => c + TANDA_RECLAMOS),
  }
}
