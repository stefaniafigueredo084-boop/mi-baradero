import { useMemo, useState } from 'react'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Check, Clock3, Loader2, ShieldQuestion, X } from 'lucide-react'
import { db } from '../../firebase'
import { useColeccion } from '../../hooks/useColeccion'
import { registrarHistorial } from '../../utils/historial'
import { categoriaPorId } from '../../utils/pase'

// Cola de solicitudes de categoría (estudiante/jubilado/discapacidad)
// pendientes de revisión, cargadas desde "Mi Pase". Aprobar/rechazar
// actualiza directo el documento del pasajero.
export default function SolicitudesCategoria() {
  const { items, cargando } = useColeccion('pasajeros')
  const pendientes = useMemo(() => items.filter(p => p.estadoVerificacion === 'pendiente'), [items])

  const [procesando, setProcesando] = useState(null) // id en curso
  const [rechazando, setRechazando] = useState(null) // id con el textarea de motivo abierto
  const [motivo, setMotivo] = useState('')

  const aprobar = async item => {
    setProcesando(item.id)
    try {
      await updateDoc(doc(db, 'pasajeros', item.id), {
        estadoVerificacion: 'aprobada',
        motivoRechazo: '',
        actualizadoEn: serverTimestamp(),
      })
      registrarHistorial({
        tipo: 'editar',
        seccion: 'combi',
        detalle: `Categoría "${categoriaPorId(item.categoriaSolicitada).label}" aprobada para ${item.nombre}`,
      })
    } finally {
      setProcesando(null)
    }
  }

  const confirmarRechazo = async item => {
    setProcesando(item.id)
    try {
      await updateDoc(doc(db, 'pasajeros', item.id), {
        estadoVerificacion: 'rechazada',
        motivoRechazo: motivo.trim(),
        actualizadoEn: serverTimestamp(),
      })
      registrarHistorial({
        tipo: 'editar',
        seccion: 'combi',
        detalle: `Categoría "${categoriaPorId(item.categoriaSolicitada).label}" rechazada para ${item.nombre}`,
      })
      setRechazando(null)
      setMotivo('')
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div className="mb-10">
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-1">
        <ShieldQuestion className="w-5 h-5 text-verde" /> Solicitudes de categoría
      </h3>
      <p className="text-gray-500 text-sm mb-5">
        Estudiante, jubilado o discapacidad: revisá el documento y aprobá o rechazá el pase con beneficio.
      </p>

      {cargando ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : pendientes.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay solicitudes pendientes.</p>
      ) : (
        <div className="space-y-4">
          {pendientes.map(item => {
            const cat = categoriaPorId(item.categoriaSolicitada)
            return (
              <div key={item.id} className="card p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800">{item.nombre}</p>
                    <span className="badge bg-amber-100 text-amber-700 text-xs font-semibold mt-1 inline-flex items-center gap-1">
                      <Clock3 className="w-3 h-3" /> Pide: {cat.label}
                    </span>
                  </div>

                  {item.documentoUrl && (
                    <img
                      src={item.documentoUrl}
                      alt={`Documento de ${item.nombre}`}
                      className="w-28 h-20 object-cover rounded-xl border border-gray-200 shrink-0"
                    />
                  )}
                </div>

                {rechazando === item.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      className="input-field resize-none"
                      rows={2}
                      placeholder="Motivo del rechazo (ej: la foto no se ve bien)"
                      value={motivo}
                      onChange={e => setMotivo(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setRechazando(null); setMotivo('') }}
                        className="btn-secondary !text-sm !py-2"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => confirmarRechazo(item)}
                        disabled={procesando === item.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-2 rounded-2xl transition-colors disabled:opacity-60"
                      >
                        {procesando === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        Confirmar rechazo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setRechazando(item.id)}
                      disabled={procesando === item.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 font-semibold text-sm transition-colors disabled:opacity-60"
                    >
                      <X className="w-4 h-4" /> Rechazar
                    </button>
                    <button
                      onClick={() => aprobar(item)}
                      disabled={procesando === item.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-verde text-white hover:bg-verde-oscuro font-semibold text-sm transition-colors disabled:opacity-60"
                    >
                      {procesando === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Aprobar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
