import { QRCodeSVG } from 'qrcode.react'

// Dibuja el QR de un pasaje ya confirmado. El QR es directamente el
// código de 4 caracteres (nada de ids largos adentro) — el conductor lo
// busca de la misma forma sea que lo escanee o que se lo dicten de viva
// voz. Es de un solo uso: el conductor lo marca "usado" al confirmar el
// embarque, y ese código deja de servir.
export default function PaseQR({ codigo }) {
  return (
    <div>
      <div className="bg-white border-4 border-verde rounded-2xl p-4 mx-auto w-fit">
        <QRCodeSVG value={codigo || ''} size={180} level="M" />
      </div>

      {/* Mismo código que codifica el QR, bien grande — para dictarle
          al conductor de viva voz si falla la cámara o no hay señal. */}
      {codigo && (
        <div className="mt-3 bg-verde/5 border border-verde/20 rounded-xl py-2.5 text-center">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide">Código para dictar</p>
          <p className="text-2xl font-bold font-poppins text-verde-oscuro tracking-[0.3em]">{codigo}</p>
        </div>
      )}
    </div>
  )
}
