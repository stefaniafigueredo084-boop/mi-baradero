import { useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { comprimirImagen } from '../../utils/imagen'

export default function ImagenInput({ valor, onChange }) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const manejarArchivo = async e => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setError('')
    setSubiendo(true)
    try {
      onChange(await comprimirImagen(archivo))
    } catch {
      setError('No se pudo procesar la imagen. Probá con otra.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div>
      {valor && (
        <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-3 border-2 border-gray-200">
          <img src={valor} alt="Vista previa" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-colors"
            aria-label="Quitar imagen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer w-fit !text-base">
        {subiendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {valor ? 'Cambiar imagen' : 'Subir imagen'}
        <input type="file" accept="image/*" className="hidden" onChange={manejarArchivo} disabled={subiendo} />
      </label>
      {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
    </div>
  )
}
