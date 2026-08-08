import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export default function CopiarCampo({ label, valor }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    await navigator.clipboard.writeText(valor)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{label}</p>
        <p className="font-semibold text-gray-800 truncate">{valor}</p>
      </div>
      <button
        type="button"
        onClick={copiar}
        className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-verde hover:text-verde-oscuro bg-verde/10 hover:bg-verde/20 px-3 py-2 rounded-lg transition-colors"
      >
        {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}
