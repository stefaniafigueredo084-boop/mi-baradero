import { useMemo, useState } from 'react'
import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Building2, Check, Loader2, MapPin, MessageSquare, Trash2, User } from 'lucide-react'
import { auth, db } from '../../firebase'
import { registrarHistorial } from '../../utils/historial'
import {
  DEPARTAMENTOS,
  ESTADOS_RECLAMO,
  TIPOS_RECLAMO,
  areaReclamoPorId,
  codigoReclamo,
  departamentoDeReclamo,
  departamentoPorId,
  estadoReclamoPorId,
  fechaReclamo,
  tipoReclamoPorId,
} from '../../data/reclamosData'
import EstadoVacio from '../EstadoVacio'
import Esqueleto from '../Esqueleto'

// Bandeja de quejas, reclamos, sugerencias y felicitaciones que mandan
// los vecinos desde /reclamos. El empleado cambia el estado, puede
// dejar una respuesta (que el vecino ve en "Mis reclamos") y derivarlo a
// otro departamento.
//
// "completa" = vista de Atención al Vecino / admin: todos los
// departamentos, con filtro por departamento y opción de eliminar. Sin
// "completa" es la vista de un sector (solo sus reclamos).
export default function ReclamosPanel({ items, cargando, error = '', hayMas = false, onCargarMas, completa = false }) {
  const [filtroEstado, setFiltroEstado] = useState('nuevo')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroDepto, setFiltroDepto] = useState('')
  const [procesando, setProcesando] = useState(null) // id en curso
  const [respuestas, setRespuestas] = useState({}) // borradores por id
  const [errorAccion, setErrorAccion] = useState('')
  const [fotoAbierta, setFotoAbierta] = useState(null)

  const cantidadPorEstado = useMemo(
    () => Object.fromEntries(ESTADOS_RECLAMO.map(e => [e.id, items.filter(i => (i.estado || 'nuevo') === e.id).length])),
    [items]
  )

  const visibles = useMemo(
    () => items.filter(i =>
      (!filtroEstado || (i.estado || 'nuevo') === filtroEstado) &&
      (!filtroTipo || i.tipo === filtroTipo) &&
      (!filtroDepto || departamentoDeReclamo(i).id === filtroDepto)
    ),
    [items, filtroEstado, filtroTipo, filtroDepto]
  )

  const avisarError = (accion, item) =>
    setErrorAccion(`No se pudo ${accion} ${codigoReclamo(item.id)}. Revisá tu conexión y probá de nuevo.`)

  const cambiarEstado = async (item, estado) => {
    if ((item.estado || 'nuevo') === estado) return
    setProcesando(item.id)
    setErrorAccion('')
    try {
      await updateDoc(doc(db, 'reclamos', item.id), { estado, actualizadoEn: serverTimestamp() })
      registrarHistorial({
        tipo: 'editar',
        seccion: 'reclamos',
        detalle: `${tipoReclamoPorId(item.tipo).label} ${codigoReclamo(item.id)} → ${estadoReclamoPorId(estado).label}`,
      })
    } catch {
      avisarError('cambiar el estado de', item)
    } finally {
      setProcesando(null)
    }
  }

  const derivar = async (item, departamento) => {
    if (departamentoDeReclamo(item).id === departamento) return
    setProcesando(item.id)
    setErrorAccion('')
    try {
      await updateDoc(doc(db, 'reclamos', item.id), { departamento, actualizadoEn: serverTimestamp() })
      registrarHistorial({
        tipo: 'editar',
        seccion: 'reclamos',
        detalle: `${tipoReclamoPorId(item.tipo).label} ${codigoReclamo(item.id)} derivado a ${departamentoPorId(departamento).label}`,
      })
    } catch {
      avisarError('derivar', item)
    } finally {
      setProcesando(null)
    }
  }

  const guardarRespuesta = async item => {
    const respuesta = (respuestas[item.id] ?? item.respuesta ?? '').trim()
    setProcesando(item.id)
    setErrorAccion('')
    try {
      await updateDoc(doc(db, 'reclamos', item.id), {
        respuesta,
        respondidoPor: auth.currentUser?.email || '',
        respondidoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      })
      registrarHistorial({
        tipo: 'editar',
        seccion: 'reclamos',
        detalle: `Respuesta a ${tipoReclamoPorId(item.tipo).label.toLowerCase()} ${codigoReclamo(item.id)}`,
      })
      setRespuestas(previo => {
        const { [item.id]: _, ...resto } = previo
        return resto
      })
    } catch {
      avisarError('guardar la respuesta de', item)
    } finally {
      setProcesando(null)
    }
  }

  const eliminar = async item => {
    if (!confirm('¿Seguro que querés eliminar este mensaje? El vecino también deja de verlo.')) return
    setProcesando(item.id)
    setErrorAccion('')
    try {
      await deleteDoc(doc(db, 'reclamos', item.id))
      registrarHistorial({
        tipo: 'eliminar',
        seccion: 'reclamos',
        detalle: `${tipoReclamoPorId(item.tipo).label} ${codigoReclamo(item.id)}`,
      })
    } catch {
      avisarError('eliminar', item)
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div>
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-1">
        <MessageSquare className="w-5 h-5 text-primario" /> Reclamos y sugerencias
      </h3>
      <p className="text-gray-500 text-sm mb-5">
        {completa
          ? 'Todo lo que mandan los vecinos desde la app, de todos los departamentos. Cambiá el estado a medida que se atiende y dejá una respuesta: el vecino la ve desde su teléfono.'
          : 'Lo que los vecinos mandan sobre tu área. Cambiá el estado a medida que se atiende y dejá una respuesta: el vecino la ve desde su teléfono. Si no le corresponde a tu área, derivalo a otro departamento.'}
      </p>

      {/* Filtro por estado, con cuántos hay en cada uno */}
      <div className="flex flex-wrap gap-2 mb-3">
        {ESTADOS_RECLAMO.map(e => (
          <button
            key={e.id}
            onClick={() => setFiltroEstado(e.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filtroEstado === e.id ? 'bg-primario text-white shadow-md' : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-primario'
            }`}
          >
            {e.label}
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${filtroEstado === e.id ? 'bg-white/25' : 'bg-gray-100'}`}>
              {cargando ? '—' : cantidadPorEstado[e.id]}
            </span>
          </button>
        ))}
        <button
          onClick={() => setFiltroEstado('')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            filtroEstado === '' ? 'bg-primario text-white shadow-md' : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-primario'
          }`}
        >
          Todos
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <select
          className="select-field !w-auto text-sm"
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          {TIPOS_RECLAMO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        {completa && (
          <select
            className="select-field !w-auto text-sm"
            value={filtroDepto}
            onChange={e => setFiltroDepto(e.target.value)}
            aria-label="Filtrar por departamento"
          >
            <option value="">Todos los departamentos</option>
            {DEPARTAMENTOS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        )}
      </div>

      {(error || errorAccion) && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-3 mb-3">{error || errorAccion}</p>
      )}
      {cargando ? (
        <Esqueleto filas={3} />
      ) : visibles.length === 0 ? (
        <EstadoVacio compacto texto="No hay mensajes en esta vista." />
      ) : (
        <div className="space-y-4">
          {visibles.map(item => {
            const tipo = tipoReclamoPorId(item.tipo)
            const depto = departamentoDeReclamo(item)
            const estadoActual = item.estado || 'nuevo'
            const borrador = respuestas[item.id] ?? item.respuesta ?? ''
            const sinCambios = borrador.trim() === (item.respuesta || '')
            return (
              <div key={item.id} className="bg-white rounded shadow-md p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge text-xs font-semibold ${tipo.color}`}><tipo.icono className="w-3.5 h-3.5" /> {tipo.label}</span>
                    <span className="badge text-xs font-semibold bg-gray-100 text-gray-600">{areaReclamoPorId(item.area).label}</span>
                    <span className="badge text-xs font-semibold bg-secundario/10 text-secundario"><Building2 className="w-3.5 h-3.5" /> {depto.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">{codigoReclamo(item.id)} · {fechaReclamo(item.creadoEn)}</span>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line break-words">{item.mensaje}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {item.nombre || 'Anónimo'}</span>
                      {item.ubicacion && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.ubicacion}</span>}
                    </div>
                  </div>
                  {item.fotoUrl && (
                    <button
                      type="button"
                      onClick={() => setFotoAbierta(item.fotoUrl)}
                      className="shrink-0"
                      aria-label="Ver la foto en grande"
                    >
                      <img src={item.fotoUrl} alt="Foto adjunta" className="w-24 h-20 object-cover rounded-xl border border-gray-200" />
                    </button>
                  )}
                </div>

                {/* Estado */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-xs font-semibold text-gray-500">Estado:</span>
                  {ESTADOS_RECLAMO.map(e => (
                    <button
                      key={e.id}
                      onClick={() => cambiarEstado(item, e.id)}
                      disabled={procesando === item.id}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-60 ${
                        estadoActual === e.id ? e.color + ' ring-2 ring-current' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>

                {/* Departamento: derivar si no corresponde */}
                <label className="flex flex-wrap items-center gap-2 mt-3 text-xs font-semibold text-gray-500">
                  Departamento:
                  <select
                    className="select-field !w-auto !py-1.5 !px-3 !text-xs"
                    value={depto.id}
                    onChange={e => derivar(item, e.target.value)}
                    disabled={procesando === item.id}
                  >
                    {DEPARTAMENTOS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </label>

                {/* Respuesta */}
                <div className="mt-4">
                  <textarea
                    className="input-field resize-none text-sm"
                    rows={2}
                    maxLength={1000}
                    placeholder="Respuesta para el vecino (opcional)"
                    value={borrador}
                    onChange={e => setRespuestas(previo => ({ ...previo, [item.id]: e.target.value }))}
                  />
                  <div className={`flex items-center gap-2 mt-2 flex-wrap ${completa ? 'justify-between' : 'justify-end'}`}>
                    {completa && (
                      <button
                        onClick={() => eliminar(item)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 font-semibold text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    )}
                    <button
                      onClick={() => guardarRespuesta(item)}
                      disabled={procesando === item.id || sinCambios}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primario text-white hover:bg-primario-oscuro font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      {procesando === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {item.respuesta ? 'Actualizar respuesta' : 'Guardar respuesta'}
                    </button>
                  </div>
                  {item.respondidoPor && (
                    <p className="text-xs text-gray-400 mt-2">Última respuesta: {item.respondidoPor} · {fechaReclamo(item.respondidoEn)}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!cargando && hayMas && onCargarMas && (
        <button
          type="button"
          onClick={onCargarMas}
          className="mt-4 w-full py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-primario-oscuro hover:border-primario transition-colors"
        >
          Ver más reclamos
        </button>
      )}

      {fotoAbierta && (
        <button
          type="button"
          onClick={() => setFotoAbierta(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          aria-label="Cerrar la foto"
        >
          <img src={fotoAbierta} alt="Foto adjunta al reclamo" className="max-w-full max-h-full rounded" />
        </button>
      )}
    </div>
  )
}
