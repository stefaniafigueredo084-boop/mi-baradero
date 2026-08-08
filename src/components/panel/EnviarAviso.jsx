import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { Loader2, Megaphone, Send } from 'lucide-react'
import { db } from '../../firebase'
import { registrarHistorial } from '../../utils/historial'

// Escribe un aviso puntual en config/{nombreDoc}. Las páginas públicas
// que escuchan ese documento lo muestran como notificación/banner.
export default function EnviarAviso({ nombreDoc, seccion, presets, placeholder }) {
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const enviar = async texto => {
    if (!texto.trim()) return
    setEnviando(true)
    await setDoc(doc(db, 'config', nombreDoc), { mensaje: texto.trim(), enviadoEn: Date.now() })
    registrarHistorial({ tipo: 'crear', seccion, detalle: `Aviso: ${texto.trim()}` })
    setEnviando(false)
    setEnviado(true)
    setMensaje('')
    setTimeout(() => setEnviado(false), 2500)
  }

  return (
    <div className="card p-6 mb-8">
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-1">
        <Megaphone className="w-5 h-5 text-amarillo" /> Enviar aviso
      </h3>
      <p className="text-gray-500 text-sm mb-4">
        Le llega como notificación a los vecinos que tengan activados los avisos de esta sección.
      </p>
      {presets && (
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map(p => (
            <button
              key={p}
              type="button"
              disabled={enviando}
              onClick={() => enviar(p)}
              className="btn-secondary !text-sm !py-2.5 !px-4 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="input-field"
          placeholder={placeholder}
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
        />
        <button
          type="button"
          disabled={enviando || !mensaje.trim()}
          onClick={() => enviar(mensaje)}
          className="btn-primary shrink-0 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Enviar
        </button>
      </div>
      {enviado && <p className="text-verde text-sm font-semibold mt-3">Aviso enviado ✓</p>}
    </div>
  )
}
