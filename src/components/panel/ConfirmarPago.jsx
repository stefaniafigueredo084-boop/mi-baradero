import { useMemo, useState } from 'react'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Banknote, CheckCircle, Loader2 } from 'lucide-react'
import { db } from '../../firebase'
import { useColeccion } from '../../hooks/useColeccion'
import { registrarHistorial } from '../../utils/historial'
import { categoriaPorId, generarCodigo } from '../../utils/pase'

const formatoPesos = n => `$${Number(n || 0).toLocaleString('es-AR')}`
const formatearFecha = fecha => {
  const [y, m, d] = (fecha || '').split('-')
  return d && m && y ? `${d}/${m}/${y}` : fecha
}

// Cola de pasajes pendientes de pago (un pasaje = un viaje puntual, no
// una persona) — el pago se confirma afuera de la app (transferencia +
// comprobante por WhatsApp, como ya funciona hoy); acá el empleado deja
// constancia de que lo recibió, y recién ahí se genera el QR.
export default function ConfirmarPago() {
  const { items, cargando } = useColeccion('pasajes')
  const pendientes = useMemo(() => items.filter(p => p.estado === 'pendiente'), [items])

  const [procesando, setProcesando] = useState(null)

  const confirmar = async item => {
    setProcesando(item.id)
    try {
      await updateDoc(doc(db, 'pasajes', item.id), {
        estado: 'confirmado',
        codigo: generarCodigo(),
        actualizadoEn: serverTimestamp(),
      })
      registrarHistorial({
        tipo: 'editar',
        seccion: 'combi',
        detalle: `Pago confirmado: ${item.nombre} — ${categoriaPorId(item.categoria).label} ${item.origen}→${item.destino} ${formatearFecha(item.fecha)} ${item.salida}hs (${formatoPesos(item.importe)})`,
      })
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div className="mb-10">
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-1">
        <Banknote className="w-5 h-5 text-verde" /> Confirmar pago de pasajes
      </h3>
      <p className="text-gray-500 text-sm mb-5">
        El pago se recibe como siempre (transferencia + comprobante). Acá confirmás que lo recibiste — recién ahí se le genera el QR al pasajero.
      </p>

      {cargando ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : pendientes.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay pasajes esperando confirmación de pago.</p>
      ) : (
        <div className="space-y-3">
          {pendientes.map(item => (
            <div key={item.id} className="card p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <p className="font-bold text-gray-800">{item.nombre}</p>
                {item.usuario && <p className="text-xs text-gray-400 font-mono">@{item.usuario}</p>}
                <p className="text-sm text-gray-600 mt-1">
                  {categoriaPorId(item.categoria).label} · {item.origen} → {item.destino} · {formatearFecha(item.fecha)} · {item.salida} hs
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-verde-oscuro text-lg">{formatoPesos(item.importe)}</span>
                <button
                  onClick={() => confirmar(item)}
                  disabled={procesando === item.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-verde text-white hover:bg-verde-oscuro font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {procesando === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirmar pago
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
