import { useEffect, useRef, useState } from 'react'
import { collection, doc, getDocs, limit, query, runTransaction, serverTimestamp, where } from 'firebase/firestore'
import { AlertTriangle, Camera, CameraOff, CheckCircle2, ClipboardCheck, Loader2, ScanLine, Ticket, Users } from 'lucide-react'
import { auth, db } from '../../firebase'
import { useViaje } from '../../hooks/useViaje'
import { useHorariosCombi } from '../../hooks/useHorariosCombi'
import { usePasajesVendidos } from '../../hooks/usePasajesVendidos'
import { registrarHistorial } from '../../utils/historial'
import {
  CATEGORIAS,
  categoriaPorId,
  evaluarEmbarque,
  fechaHoy,
  idViaje,
  LABEL_TARIFA,
  PLANTILLA_VIAJE_DEFAULT,
  salidaTimestamp,
} from '../../utils/pase'

// Contador de embarques escaneados por este conductor, hoy. Se guarda
// en localStorage (por uid + fecha) para que sobreviva una recarga de
// página durante el mismo turno, sin necesitar una consulta nueva a
// Firestore (los embarques no guardan el conductor como algo
// consultable masivamente, solo como dato de auditoría en cada doc).
function claveContador(uid) {
  return `mibaradero_embarques_${uid || 'anon'}_${fechaHoy()}`
}
function leerContador(uid) {
  return Number(localStorage.getItem(claveContador(uid)) || '0')
}
function incrementarContador(uid) {
  const nuevo = leerContador(uid) + 1
  localStorage.setItem(claveContador(uid), String(nuevo))
  return nuevo
}

const MOTIVO_RECHAZO = {
  no_encontrado: 'Ese pasaje no existe.',
  no_pagado: 'El pago de este pasaje todavía no fue confirmado.',
  ya_usado: 'Este pasaje ya fue utilizado.',
  codigo_invalido: 'Ese código no es válido.',
  otro_viaje: 'Este pasaje es para otro horario o fecha — no corresponde a este viaje.',
  sin_lugar: 'No quedan lugares en este viaje.',
  sin_lugar_general: 'No quedan lugares generales — solo quedan asientos prioritarios sin reclamar.',
  error: 'No se pudo procesar el escaneo. Probá de nuevo.',
}

export default function EmbarqueScanner({ soloHorarios } = {}) {
  const todosLosHorarios = useHorariosCombi()
  // Un chofer solo ve (y puede escanear) los horarios que le asignó el
  // admin. Distinguimos "no me pasaron la prop" (admin/combi mirando
  // esto, sin restricción) de "me pasaron una lista vacía" (chofer sin
  // ningún horario asignado todavía — no debe ver ninguno, no todos).
  const horarios = soloHorarios
    ? todosLosHorarios.filter(h => soloHorarios.includes(h.id))
    : todosLosHorarios

  const [horarioId, setHorarioId] = useState('')
  const horario = horarios.find(h => String(h.id) === String(horarioId)) || null
  const viaje = useViaje(horario)
  const { items: vendidos, cargando: cargandoVendidos } = usePasajesVendidos(horario?.id, fechaHoy())

  const [escaneando, setEscaneando] = useState(false)
  const [errorCamara, setErrorCamara] = useState('')
  const [codigoManual, setCodigoManual] = useState('')
  const [resultado, setResultado] = useState(null) // { ok, mensaje, detalle }
  const [procesando, setProcesando] = useState(false)
  const [contador, setContador] = useState(() => leerContador(auth.currentUser?.uid))

  const scannerRef = useRef(null)

  // Punto común: confirma el embarque de un pasaje puntual (ya
  // identificado, sea por cámara o por código dictado) y actualiza
  // contador/historial si salió bien. No maneja "procesando" — eso
  // queda a cargo de quien llama, junto con el resto de su propio
  // trabajo (parsear el QR, o antes buscar el pasaje por código).
  const confirmarYRegistrar = async (pasajeId, codigo) => {
    const conductor = auth.currentUser
    const resultadoTx = await confirmarEmbarque(horario, pasajeId, codigo, conductor)
    setResultado(resultadoTx)
    if (resultadoTx.ok) {
      setContador(incrementarContador(conductor?.uid))
      registrarHistorial({
        tipo: 'crear',
        seccion: 'combi',
        detalle: `Embarque confirmado: ${resultadoTx.detalle.nombre} (${resultadoTx.detalle.categoria}, ${horario.salida} hs)`,
      })
    }
  }

  // El QR ahora ES directamente el código de 4 caracteres (nada de ids
  // largos adentro) — así que escanearlo con cámara o que te lo dicten
  // de viva voz terminan en exactamente la misma búsqueda: encontrar,
  // entre los pasajes de este horario y esta fecha, el que tenga ese
  // código.
  const procesarCodigo = async codigoCrudo => {
    if (!horario) {
      setResultado({ ok: false, mensaje: 'Elegí primero el horario del viaje.' })
      return
    }
    const codigo = (codigoCrudo || '').trim().toUpperCase()
    if (codigo.length !== 4) {
      setResultado({ ok: false, mensaje: 'Ese código no es un pasaje válido de Mi Baradero.' })
      return
    }
    setProcesando(true)
    try {
      const q = query(
        collection(db, 'pasajes'),
        where('horarioId', '==', horario.id),
        where('fecha', '==', fechaHoy()),
        where('codigo', '==', codigo),
        limit(1)
      )
      const snap = await getDocs(q)
      if (snap.empty) {
        setResultado({ ok: false, mensaje: 'No se encontró ningún pasaje con ese código para este viaje.' })
        return
      }
      await confirmarYRegistrar(snap.docs[0].id, codigo)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al procesar código de embarque:', err)
      setResultado({ ok: false, mensaje: MOTIVO_RECHAZO.error })
    } finally {
      setProcesando(false)
    }
  }

  const iniciarCamara = async () => {
    setErrorCamara('')
    setResultado(null)
    // Mostramos el contenedor ANTES de arrancar la cámara: html5-qrcode
    // necesita que el div ya tenga tamaño real en pantalla para poder
    // calcular y dibujar el video adentro — con el contenedor todavía
    // oculto (display:none), arranca "bien" (no tira error) pero nunca
    // se ve nada, y queda pegado en el botón de activar/desactivar.
    setEscaneando(true)
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      // "useBarCodeDetectorIfSupported" va acá, en el constructor (no en
      // las opciones de start(), que es un config distinto sin este
      // campo). Ya es el default de la librería, pero lo dejamos
      // explícito: usa el lector de QR nativo del celular cuando está
      // disponible (Chrome/Android) en vez del propio en JavaScript.
      const scanner = new Html5Qrcode('lector-qr-embarque', {
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        verbose: false,
      })
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        // Sin "qrbox": versiones anteriores recortaban el centro de la
        // imagen calculando el tamaño a partir del viewfinder, pero eso
        // nunca llegó a detectar nada en la práctica (probable
        // desalineación entre ese recorte y lo que la cámara entrega
        // de verdad en el celular). Sin recorte, se analiza el cuadro
        // completo de la cámara — más simple y es el modo que la
        // propia librería recomienda como default más confiable.
        { fps: 10 },
        texto => {
          // Un escaneo por vez: pausamos mientras se procesa/muestra el resultado.
          scanner.pause(true)
          procesarCodigo(texto).finally(() => {
            setTimeout(() => scannerRef.current?.resume(), 1500)
          })
        },
        () => {} // errores de "no se detectó nada todavía" — se ignoran, son constantes
      )
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al iniciar la cámara:', err)
      setEscaneando(false)
      setErrorCamara('No se pudo acceder a la cámara. Podés pegar el código manualmente más abajo.')
    }
  }

  const detenerCamara = async () => {
    try {
      await scannerRef.current?.stop()
      await scannerRef.current?.clear()
    } catch {
      // ya estaba detenida
    }
    scannerRef.current = null
    setEscaneando(false)
  }

  useEffect(() => () => { scannerRef.current?.stop().catch(() => {}) }, [])

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-verde" /> Embarque — escanear pasajes
        </h3>
        <span className="flex items-center gap-1.5 bg-verde/10 text-verde text-xs font-bold px-3 py-1.5 rounded-full">
          <ClipboardCheck className="w-3.5 h-3.5" /> {contador} escaneados hoy
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-5">
        {soloHorarios?.length
          ? 'Elegí tu horario y escaneá el QR de cada pasajero al subir.'
          : 'Elegí el viaje y escaneá el QR de cada pasajero al subir.'}
      </p>

      <div className="card p-5 mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {soloHorarios?.length ? 'Tu horario (hoy)' : 'Horario del viaje (hoy)'}
        </label>
        {soloHorarios?.length === 0 && (
          <p className="text-xs text-amber-600 mb-2">Todavía no tenés horarios asignados — pedile a un administrador que te asigne alguno.</p>
        )}
        <select className="select-field" value={horarioId} onChange={e => { setHorarioId(e.target.value); setResultado(null) }}>
          <option value="">Seleccioná un horario...</option>
          {horarios.map(h => (
            <option key={h.id} value={h.id}>{h.salida} — {h.origen} → {h.destino}</option>
          ))}
        </select>

        {horario && viaje && !viaje.cargando && (
          <div className="mt-4 bg-verde/5 border border-verde/20 rounded-xl p-4 flex items-center gap-4 flex-wrap">
            <Users className="w-5 h-5 text-verde shrink-0" />
            <div>
              <p className="font-bold text-verde-oscuro text-lg">{viaje.asientos.libres} libres</p>
              <p className="text-xs text-gray-500">de {viaje.asientos.capacidadTotal} totales</p>
            </div>
            <div className="text-xs text-gray-500 flex flex-col gap-0.5">
              <span>♿ Discapacidad: {viaje.asientos.prioritarios.discapacidad.libres}/{viaje.asientos.prioritarios.discapacidad.reservados} reservados libres</span>
              <span>👴 Jubilados: {viaje.asientos.prioritarios.jubilado.libres}/{viaje.asientos.prioritarios.jubilado.reservados} reservados libres</span>
            </div>
            {viaje.asientos.liberado && (
              <span className="badge bg-amber-100 text-amber-700 text-xs ml-auto">Reservas ya liberadas</span>
            )}
          </div>
        )}

        {horario && !cargandoVendidos && (
          <div className="mt-3 bg-azul/5 border border-azul/20 rounded-xl p-4 flex items-center gap-4 flex-wrap">
            <Ticket className="w-5 h-5 text-azul shrink-0" />
            <div>
              <p className="font-bold text-azul-oscuro text-lg">{vendidos.length} pasajes vendidos</p>
              <p className="text-xs text-gray-500">{vendidos.filter(p => p.usado).length} ya embarcaron</p>
            </div>
            {vendidos.length > 0 && (
              <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5">
                {CATEGORIAS.map(cat => {
                  const cantidad = vendidos.filter(p => p.categoria === cat.id).length
                  return cantidad > 0 ? <span key={cat.id}>{cat.label}: {cantidad}</span> : null
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card p-5 mb-5">
        {!escaneando ? (
          <button
            onClick={iniciarCamara}
            disabled={!horario}
            className="btn-primary flex items-center justify-center gap-2 w-full disabled:opacity-50"
          >
            <Camera className="w-5 h-5" /> Activar cámara
          </button>
        ) : (
          <button onClick={detenerCamara} className="btn-secondary flex items-center justify-center gap-2 w-full mb-3">
            <CameraOff className="w-5 h-5" /> Apagar cámara
          </button>
        )}
        {errorCamara && <p className="text-red-500 text-sm mt-2">{errorCamara}</p>}
        <div className={escaneando ? 'relative mt-4' : 'hidden'}>
          <div id="lector-qr-embarque" className="rounded-xl overflow-hidden min-h-[240px]" />
          {/* Cartel superpuesto a la cámara con el resultado del último
              escaneo — para que se vea de una sin tener que mirar más
              abajo de la pantalla mientras se sigue escaneando. */}
          {resultado && (
            <div className={`absolute inset-x-2 top-2 rounded-xl p-3 shadow-lg flex items-center gap-2 animate-fade-in ${resultado.ok ? 'bg-verde text-white' : 'bg-red-500 text-white'}`}>
              {resultado.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
              <div className="min-w-0">
                <p className="font-bold text-sm leading-tight">{resultado.ok ? '¡Válido!' : 'Rechazado'}</p>
                <p className="text-xs opacity-90 truncate">
                  {resultado.ok && resultado.detalle
                    ? `${resultado.detalle.nombre} · ${resultado.detalle.categoria}`
                    : resultado.mensaje}
                </p>
              </div>
            </div>
          )}
        </div>

        <details className="mt-4">
          <summary className="text-xs text-gray-400 cursor-pointer select-none">Sin cámara a mano — pedile el código de 4 letras y buscalo acá</summary>
          <div className="flex gap-2 mt-2">
            <input
              className="input-field !py-2 !text-sm !text-center !text-lg !font-bold tracking-[0.3em] uppercase"
              placeholder="K3M9"
              maxLength={4}
              value={codigoManual}
              onChange={e => setCodigoManual(e.target.value.toUpperCase())}
            />
            <button
              onClick={() => procesarCodigo(codigoManual)}
              disabled={procesando || codigoManual.length !== 4}
              className="btn-secondary !text-sm !py-2 shrink-0 disabled:opacity-50"
            >
              {procesando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
            </button>
          </div>
        </details>
      </div>

      {resultado && (
        <div className={`card p-5 flex items-start gap-3 ${resultado.ok ? 'border-2 border-verde/30 bg-verde/5' : 'border-2 border-red-200 bg-red-50'}`}>
          {resultado.ok
            ? <CheckCircle2 className="w-6 h-6 text-verde shrink-0" />
            : <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />}
          <div>
            <p className={`font-bold ${resultado.ok ? 'text-verde-oscuro' : 'text-red-600'}`}>{resultado.mensaje}</p>
            {resultado.ok && resultado.detalle && (
              <p className="text-sm text-gray-600 mt-0.5">
                {resultado.detalle.nombre} · {resultado.detalle.categoria} · {resultado.detalle.tarifa}
                {resultado.detalle.prioritario && ' · asiento prioritario'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Transacción atómica: valida el pasaje (pagado, no usado, del viaje
// correcto), calcula si entra (y en qué tipo de asiento) y confirma el
// embarque. Si dos conductores escanean casi al mismo tiempo, Firestore
// serializa las transacciones — nunca se pasa de la capacidad del viaje.
async function confirmarEmbarque(horario, pasajeId, codigo, conductor) {
  const fecha = fechaHoy()
  const viajeId = idViaje(horario.id, fecha)
  const pasajeRef = doc(db, 'pasajes', pasajeId)
  const viajeRef = doc(db, 'viajes', viajeId)
  const embarqueRef = doc(db, 'viajes', viajeId, 'embarques', pasajeId)

  return runTransaction(db, async tx => {
    const [pasajeSnap, viajeSnap] = await Promise.all([
      tx.get(pasajeRef),
      tx.get(viajeRef),
    ])

    if (!pasajeSnap.exists()) return { ok: false, mensaje: MOTIVO_RECHAZO.no_encontrado }
    const pasaje = pasajeSnap.data()

    if (pasaje.codigo !== codigo) return { ok: false, mensaje: MOTIVO_RECHAZO.codigo_invalido }
    if (pasaje.usado) return { ok: false, mensaje: MOTIVO_RECHAZO.ya_usado }
    if (pasaje.estado !== 'confirmado') return { ok: false, mensaje: MOTIVO_RECHAZO.no_pagado }
    if (pasaje.horarioId !== horario.id || pasaje.fecha !== fecha) return { ok: false, mensaje: MOTIVO_RECHAZO.otro_viaje }

    const categoria = pasaje.categoria || 'comun'

    const viajeExiste = viajeSnap.exists()
    const base = viajeExiste
      ? viajeSnap.data()
      : {
          salida: horario.salida || '',
          origen: horario.origen || '',
          destino: horario.destino || '',
          capacidadTotal: horario.capacidadTotal ?? PLANTILLA_VIAJE_DEFAULT.capacidadTotal,
          asientosReservadosDiscapacidad: horario.asientosReservadosDiscapacidad ?? PLANTILLA_VIAJE_DEFAULT.asientosReservadosDiscapacidad,
          asientosReservadosJubilados: horario.asientosReservadosJubilados ?? PLANTILLA_VIAJE_DEFAULT.asientosReservadosJubilados,
          minutosLiberacionReserva: horario.minutosLiberacionReserva ?? PLANTILLA_VIAJE_DEFAULT.minutosLiberacionReserva,
          horarioSalidaTs: salidaTimestamp(fecha, horario.salida),
          embarcadosGeneral: 0,
          embarcadosDiscapacidad: 0,
          embarcadosJubilado: 0,
        }

    const evaluacion = evaluarEmbarque(categoria, base, base)
    if (!evaluacion.ok) return { ok: false, mensaje: MOTIVO_RECHAZO[evaluacion.motivo] || MOTIVO_RECHAZO.error }

    tx.set(viajeRef, {
      ...(viajeExiste ? {} : { ...base, creadoEn: serverTimestamp() }),
      [evaluacion.contador]: (base[evaluacion.contador] || 0) + 1,
      actualizadoEn: serverTimestamp(),
    }, { merge: true })

    tx.set(embarqueRef, {
      nombre: pasaje.nombre || '',
      categoriaAplicada: categoria,
      tarifaAplicada: evaluacion.tarifaAplicada,
      asientoTipo: evaluacion.asientoTipo,
      timestamp: serverTimestamp(),
      conductorUid: conductor?.uid || '',
      conductorEmail: conductor?.email || '',
    })

    // Marca el pasaje como usado — de un solo uso, ya no sirve más (ni
    // para este viaje ni para ningún otro), a diferencia del viejo pase
    // general que se podía reusar día a día.
    tx.update(pasajeRef, {
      usado: true,
      usadoEn: serverTimestamp(),
      conductorUid: conductor?.uid || '',
      conductorEmail: conductor?.email || '',
    })

    return {
      ok: true,
      mensaje: 'Embarque confirmado',
      detalle: {
        nombre: pasaje.nombre || 'Pasajero',
        categoria: categoriaPorId(categoria).label,
        tarifa: LABEL_TARIFA[evaluacion.tarifaAplicada],
        prioritario: evaluacion.asientoTipo.startsWith('prioritario'),
      },
    }
  })
}
