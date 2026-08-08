import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Import, Loader2 } from 'lucide-react'
import { db } from '../../firebase'
import { registrarHistorial } from '../../utils/historial'

// Pasa el contenido "de fábrica" (el que vivía hardcodeado en el código,
// antes de que existiera este panel) a Firestore, para que se pueda
// editar o borrar como cualquier otro registro. Cada item importado
// lleva un campo "idOriginal" — las páginas públicas lo usan para no
// mostrar el mismo contenido duplicado (una vez como original y otra
// vez importado).
export default function ImportarDatosFijos({ coleccion, seccion, datos, mapear, etiqueta }) {
  const [importando, setImportando] = useState(false)
  const [hecho, setHecho] = useState(false)

  const importar = async () => {
    if (!confirm(`¿Importar los ${datos.length} registros originales de "${etiqueta}"? Después de importarlos vas a poder editarlos o borrarlos desde acá. Hacelo una sola vez — si lo tocás de nuevo se van a duplicar.`)) return
    setImportando(true)
    try {
      for (const item of datos) {
        await addDoc(collection(db, coleccion), { ...mapear(item), creadoEn: serverTimestamp() })
      }
      await registrarHistorial({ tipo: 'crear', seccion, detalle: `Importó ${datos.length} registros originales de "${etiqueta}"` })
      setHecho(true)
    } finally {
      setImportando(false)
    }
  }

  if (hecho) return null

  return (
    <div className="bg-azul/5 border border-azul/20 rounded-xl p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
      <p className="text-sm text-gray-600">
        Los <strong>{etiqueta}</strong> que ya estaban en el sitio antes del panel todavía no están acá para poder editarlos o borrarlos.
      </p>
      <button
        onClick={importar}
        disabled={importando}
        className="btn-secondary shrink-0 flex items-center gap-2 disabled:opacity-50 !text-sm !py-2.5"
      >
        {importando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Import className="w-4 h-4" />}
        Importar {datos.length} registros
      </button>
    </div>
  )
}
