import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { db } from '../../firebase'
import { useColeccion } from '../../hooks/useColeccion'
import { registrarHistorial } from '../../utils/historial'
import CampoInput from './CampoInput'

function valoresVacios(campos) {
  const v = {}
  campos.forEach(c => {
    v[c.name] = c.type === 'checkbox' ? false : c.type === 'multiselect' ? [] : c.default ?? ''
  })
  return v
}

// Lista + alta/edición/baja genérica para cualquier colección de Firestore,
// a partir de una definición de "campos" (ver src/data/panelCampos.js).
export default function ColeccionCRUD({ coleccion, seccion, campos, renderTitulo, renderSubtitulo }) {
  const { items, cargando } = useColeccion(coleccion)
  const [editandoId, setEditandoId] = useState(null) // 'nuevo' | id | null
  const [valores, setValores] = useState(() => valoresVacios(campos))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const setCampo = (nombre, valor) => setValores(v => ({ ...v, [nombre]: valor }))

  const empezarNuevo = () => {
    setEditandoId('nuevo')
    setValores(valoresVacios(campos))
    setError('')
  }

  const empezarEdicion = item => {
    setEditandoId(item.id)
    setValores({ ...valoresVacios(campos), ...item })
    setError('')
  }

  const cancelar = () => {
    setEditandoId(null)
    setError('')
  }

  const guardar = async e => {
    e.preventDefault()
    const faltante = campos.find(c => c.required && !String(valores[c.name] ?? '').trim())
    if (faltante) {
      setError(`Completá el campo "${faltante.label}".`)
      return
    }
    setGuardando(true)
    try {
      const datos = {}
      campos.forEach(c => {
        datos[c.name] = c.type === 'number' ? Number(valores[c.name] || 0) : valores[c.name]
      })
      const esNuevo = editandoId === 'nuevo'
      if (esNuevo) {
        await addDoc(collection(db, coleccion), { ...datos, creadoEn: serverTimestamp() })
      } else {
        await updateDoc(doc(db, coleccion, editandoId), datos)
      }
      registrarHistorial({
        tipo: esNuevo ? 'crear' : 'editar',
        seccion,
        detalle: renderTitulo(datos),
      })
      setEditandoId(null)
    } catch {
      setError('No se pudo guardar. Revisá tu conexión e intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async item => {
    if (confirm('¿Seguro que querés eliminar este registro?')) {
      await deleteDoc(doc(db, coleccion, item.id))
      registrarHistorial({ tipo: 'eliminar', seccion, detalle: renderTitulo(item) })
    }
  }

  return (
    <div>
      {editandoId ? (
        <form onSubmit={guardar} className="card p-6 mb-6 space-y-4">
          <h3 className="font-bold font-poppins text-lg text-gray-800">
            {editandoId === 'nuevo' ? 'Nuevo registro' : 'Editar registro'}
          </h3>
          {campos.map(campo => (
            <div key={campo.name}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {campo.label}{campo.required && ' *'}
              </label>
              <CampoInput campo={campo} valor={valores[campo.name]} onChange={v => setCampo(campo.name, v)} />
            </div>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={cancelar} className="btn-secondary">
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button type="submit" disabled={guardando} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </form>
      ) : (
        <button onClick={empezarNuevo} className="btn-primary flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5" /> Agregar nuevo
        </button>
      )}

      {cargando ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-sm">Todavía no hay registros cargados acá.</p>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{renderTitulo(item)}</p>
                {renderSubtitulo && <p className="text-sm text-gray-500 truncate">{renderSubtitulo(item)}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => empezarEdicion(item)}
                  className="p-2.5 rounded-xl bg-azul/10 text-azul hover:bg-azul/20 transition-colors"
                  aria-label="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => eliminar(item)}
                  className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
