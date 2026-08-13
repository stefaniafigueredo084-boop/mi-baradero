const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const { logger } = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()
const db = admin.firestore()

const MP_API = 'https://api.mercadopago.com'
const SITIO = 'https://mi-baradero.web.app'

// El Access Token de Mercado Pago NUNCA viaja al navegador — vive solo
// acá, como secreto de Firebase (ver README de este proyecto: "Cómo
// activar el cobro con Mercado Pago").
const mpAccessToken = defineSecret('MERCADOPAGO_ACCESS_TOKEN')

// Mismo alfabeto/formato que utils/pase.js del sitio (no se puede
// importar ese archivo del frontend acá sin duplicar el bundle, así
// que se repite esta función chica en vez de complicar el build).
function generarCodigo() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join('')
}

// Callable desde el sitio: el pasajero ya generó su pasaje (pendiente)
// en Firestore como siempre — esto solo le pide a Mercado Pago un link
// de pago (Checkout Pro) para ESE pasaje puntual. El id del pasaje
// queda como "external_reference", así el webhook de abajo sabe
// exactamente cuál marcar como pagado cuando llegue la confirmación.
exports.crearPreferenciaMercadoPago = onCall({ secrets: [mpAccessToken] }, async request => {
  const pasajeId = request.data?.pasajeId
  if (!pasajeId) throw new HttpsError('invalid-argument', 'Falta el pasaje.')

  const snap = await db.collection('pasajes').doc(pasajeId).get()
  if (!snap.exists) throw new HttpsError('not-found', 'Ese pasaje no existe.')
  const pasaje = snap.data()
  if (pasaje.estado !== 'pendiente') {
    throw new HttpsError('failed-precondition', 'Ese pasaje ya no está pendiente de pago.')
  }
  if (!pasaje.importe || pasaje.importe <= 0) {
    throw new HttpsError('failed-precondition', 'Este pasaje no tiene un importe para cobrar.')
  }

  const preferencia = {
    items: [{
      title: `Pasaje combi ${pasaje.origen} → ${pasaje.destino} — ${pasaje.salida} hs`,
      quantity: 1,
      unit_price: Number(pasaje.importe),
      currency_id: 'ARS',
    }],
    external_reference: pasajeId,
    back_urls: {
      success: `${SITIO}/combi#mi-pase`,
      pending: `${SITIO}/combi#mi-pase`,
      failure: `${SITIO}/combi#mi-pase`,
    },
    auto_return: 'approved',
    notification_url: `${SITIO}/mp-webhook`,
  }

  const resp = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${mpAccessToken.value()}`,
    },
    body: JSON.stringify(preferencia),
  })
  const json = await resp.json()
  if (!resp.ok) {
    logger.error('Error creando preferencia de Mercado Pago', json)
    throw new HttpsError('internal', 'No se pudo generar el link de pago.')
  }

  return { initPoint: json.init_point }
})

// HTTP público: a este endpoint lo llama Mercado Pago solo, nunca el
// pasajero (queda mapeado a /mp-webhook por un rewrite de Hosting, ver
// firebase.json). Nunca hay que confiar ciegamente en el aviso: acá se
// vuelve a consultar el pago real contra la API de Mercado Pago antes
// de dar por bueno nada.
exports.webhookMercadoPago = onRequest({ secrets: [mpAccessToken] }, async (req, res) => {
  try {
    const paymentId = req.query['data.id'] || req.body?.data?.id || req.query.id
    const tipo = req.query.type || req.query.topic
    if (!paymentId || (tipo && tipo !== 'payment')) {
      res.status(200).send('ignorado')
      return
    }

    const resp = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpAccessToken.value()}` },
    })
    const pago = await resp.json()
    if (!resp.ok) {
      logger.error('No se pudo leer el pago desde Mercado Pago', pago)
      res.status(200).send('error leyendo pago')
      return
    }

    const pasajeId = pago.external_reference
    if (pago.status === 'approved' && pasajeId) {
      const ref = db.collection('pasajes').doc(pasajeId)
      await db.runTransaction(async tx => {
        const doc = await tx.get(ref)
        // Ya confirmado (una segunda notificación del mismo pago, MP
        // reintenta) o el pasaje ya no existe — no hay nada que hacer.
        if (!doc.exists || doc.data().estado !== 'pendiente') return
        tx.update(ref, {
          estado: 'confirmado',
          codigo: generarCodigo(),
          mercadoPagoPaymentId: String(paymentId),
          actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
        })
      })
      logger.info(`Pago aprobado y pasaje confirmado: ${pasajeId}`)
    }

    res.status(200).send('ok')
  } catch (err) {
    logger.error('Error en webhook de Mercado Pago', err)
    // Respondemos 200 igual: si devolvemos error, Mercado Pago
    // reintenta sin parar en vez de solo loguear el problema.
    res.status(200).send('error')
  }
})
