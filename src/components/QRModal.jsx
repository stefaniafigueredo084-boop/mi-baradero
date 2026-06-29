import { X, Download, Share2 } from 'lucide-react'

export default function QRModal({ datos, onClose }) {
  if (!datos) return null

  const qrCells = Array.from({ length: 25 }, (_, i) => {
    const row = Math.floor(i / 5)
    const col = i % 5
    const isCorner = (row < 2 && col < 2) || (row < 2 && col > 2) || (row > 2 && col < 2)
    return { isCorner, filled: isCorner || Math.random() > 0.4 }
  })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-poppins text-gray-800">Pasaje Generado</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* QR simulado */}
        <div className="bg-white border-4 border-verde rounded-2xl p-4 mx-auto w-fit mb-4 relative overflow-hidden">
          <div className="grid grid-cols-7 gap-1 w-36 h-36">
            {Array.from({ length: 49 }, (_, i) => {
              const row = Math.floor(i / 7)
              const col = i % 7
              const isTopLeft = row < 3 && col < 3
              const isTopRight = row < 3 && col > 3
              const isBottomLeft = row > 3 && col < 3
              const filled = isTopLeft || isTopRight || isBottomLeft || (Math.sin(i * 1.3) > 0)
              return (
                <div
                  key={i}
                  className={`rounded-sm ${filled ? 'bg-gray-900' : 'bg-white'}`}
                />
              )
            })}
          </div>
          {/* Línea de escaneo */}
          <div className="absolute left-4 right-4 h-0.5 bg-verde/60 qr-scan-line" style={{ top: 0 }} />
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Pasajero</span>
            <span className="font-semibold text-gray-800">{datos.nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">DNI</span>
            <span className="font-semibold text-gray-800">{datos.dni}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Destino</span>
            <span className="font-semibold text-gray-800">{datos.destino}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha</span>
            <span className="font-semibold text-gray-800">{datos.fecha}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Horario</span>
            <span className="font-semibold text-verde">{datos.horario}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">N° Pasaje</span>
            <span className="font-semibold text-azul">#MB-{Math.floor(Math.random() * 90000) + 10000}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 flex items-center justify-center gap-2 btn-primary">
            <Download className="w-4 h-4" />
            Guardar
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 btn-secondary">
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
        </div>
      </div>
    </div>
  )
}
