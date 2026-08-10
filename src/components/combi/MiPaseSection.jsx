import { useState } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { BadgeCheck, CheckCircle2, Clock, Contact, Lock, Loader2, MessageCircle, ShieldCheck, Ticket } from 'lucide-react'
import { db } from '../../firebase'
import { idVecino, leerPerfilLocal } from '../../utils/perfilLocal'
import { usuarioVecino, usuarioVecinoLocal } from '../../utils/usuario'
import { usePasajero } from '../../hooks/usePasajero'
import { usePasaje } from '../../hooks/usePasaje'
import { useViaje } from '../../hooks/useViaje'
import { useHorariosCombi } from '../../hooks/useHorariosCombi'
import { CATEGORIAS, categoriaPorId, categoriaVerificada, calcularImporte, fechaHoy, idPasaje, MINUTOS_CORTE_VENTA, salidaTimestamp } from '../../utils/pase'
import { datosPago } from '../../data/combiData'
import ImagenInput from '../panel/ImagenInput'
import CopiarCampo from '../CopiarCampo'
import PaseQR from '../pase/PaseQR'

const COLOR_CATEGORIA = {
  azul: 'border-azul bg-azul/5 text-azul-oscuro',
  amber: 'border-amber-400 bg-amber-50 text-amber-700',
  teal: 'border-teal-500 bg-teal-50 text-teal-700',
}

const formatoPesos = n => `$${Number(n || 0).toLocaleString('es-AR')}`
const formatearFecha = fecha => {
  const [y, m, d] = (fecha || '').split('-')
  return d && m && y ? `${d}/${m}/${y}` : fecha
}

// Sección embebida en la página de la Combi. Cada pasaje es un ticket
// puntual para un viaje específico (fecha + horario) — se paga, un
// empleado confirma el pago, y recién ahí aparece el QR. La categoría
// verificada (estudiante/jubilado/discapacidad) es aparte y permanente:
// se pide una sola vez y desbloquea el precio con descuento para
// cualquier pasaje futuro de esa categoría.
export default function MiPaseSection() {
  const perfilLocal = leerPerfilLocal()
  const [nombreForm, setNombreForm] = useState(perfilLocal?.nombre || '')
  const [apellidoForm, setApellidoForm] = useState(perfilLocal?.apellido || '')
  const tieneNombre = !!(perfilLocal?.nombre?.trim())

  const { pasajero } = usePasajero()
  const horarios = useHorariosCombi()

  const [fecha, setFecha] = useState(fechaHoy())
  const [horarioId, setHorarioId] = useState('')
  const [categoriaId, setCategoriaId] = useState('comun')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const horario = horarios.find(h => String(h.id) === String(horarioId)) || null
  const { pasaje, cargando: cargandoPasaje } = usePasaje(horario?.id, fecha)
  const viajeHorarioElegido = useViaje(horario)
  const horarioYaNoDisponible = horario && (
    salidaTimestamp(fecha, horario.salida).getTime() < Date.now() + MINUTOS_CORTE_VENTA * 60_000
    || (viajeHorarioElegido && !viajeHorarioElegido.cargando && viajeHorarioElegido.asientos.libres <= 0)
  )

  const guardarNombre = e => {
    e.preventDefault()
    if (!nombreForm.trim()) return
    const previo = JSON.parse(localStorage.getItem('mibaradero_perfil') || 'null') || {}
    localStorage.setItem('mibaradero_perfil', JSON.stringify({ ...previo, nombre: nombreForm.trim(), apellido: apellidoForm.trim() }))
    window.location.reload()
  }

  const categoriaBloqueada = cat => cat.requiereDocumento && !categoriaVerificada(pasajero, cat.id)

  const comprar = async () => {
    if (!horario) { setError('Elegí un horario.'); return }
    if (horarioYaNoDisponible) { setError('Ese horario ya no está disponible — elegí otro.'); return }
    const cat = categoriaPorId(categoriaId)
    if (categoriaBloqueada(cat)) { setError('Esa categoría todavía no está verificada.'); return }
    setError('')
    setEnviando(true)
    try {
      const nombreCompleto = `${perfilLocal.nombre} ${perfilLocal.apellido || ''}`.trim()
      const usuario = usuarioVecinoLocal() || await usuarioVecino(perfilLocal.nombre, perfilLocal.apellido)
      await setDoc(doc(db, 'pasajes', idPasaje(idVecino(), horario.id, fecha)), {
        pasajeroId: idVecino(),
        nombre: nombreCompleto,
        usuario,
        categoria: categoriaId,
        horarioId: horario.id,
        fecha,
        salida: horario.salida || '',
        origen: horario.origen || '',
        destino: horario.destino || '',
        importe: calcularImporte(categoriaId, horario.origen, horario.destino),
        estado: 'pendiente',
        usado: false,
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      })
    } catch {
      setError('No se pudo generar el pedido. Revisá tu conexión e intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="card p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-1">
        <Ticket className="w-5 h-5 text-verde" />
        <h2 className="text-xl font-bold font-poppins">Mi Pase</h2>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Elegí fecha, horario y tipo de pasaje, pagá, y una vez confirmado el pago se habilita tu QR para embarcar.
      </p>

      {!tieneNombre ? (
        <form onSubmit={guardarNombre} className="max-w-sm space-y-3">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Contact className="w-4 h-4 text-verde" /> Antes, ¿cómo te llamás?
          </p>
          <input className="input-field" placeholder="Nombre" value={nombreForm} onChange={e => setNombreForm(e.target.value)} required />
          <input className="input-field" placeholder="Apellido" value={apellidoForm} onChange={e => setApellidoForm(e.target.value)} />
          <button type="submit" className="btn-primary w-full">Continuar</button>
        </form>
      ) : (
        <>
          <div className="mb-5 max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha del viaje</label>
            <input
              type="date"
              className="input-field"
              min={fechaHoy()}
              value={fecha}
              onChange={e => { setFecha(e.target.value); setHorarioId('') }}
            />
          </div>

          <div className="mb-5 max-w-md">
            <p className="text-sm font-semibold text-gray-700 mb-2">Horario</p>
            <div className="space-y-2">
              {horarios.map(h => (
                <HorarioOption
                  key={h.id}
                  horario={h}
                  fecha={fecha}
                  seleccionado={String(horarioId) === String(h.id)}
                  onSeleccionar={setHorarioId}
                />
              ))}
            </div>
          </div>

          {!horario && <p className="text-sm text-gray-400">Elegí fecha y horario para ver el precio y comprar tu pasaje.</p>}

          {horario && cargandoPasaje && (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-verde animate-spin" /></div>
          )}

          {horario && !cargandoPasaje && !pasaje && (
            <div className="max-w-md">
              <p className="text-sm font-semibold text-gray-700 mb-3">Tipo de pasaje</p>
              <div className="space-y-3 mb-5">
                {CATEGORIAS.map(cat => {
                  const bloqueada = categoriaBloqueada(cat)
                  const precio = calcularImporte(cat.id, horario.origen, horario.destino)
                  const pendienteEsta = pasajero?.categoriaSolicitada === cat.id && pasajero?.estadoVerificacion === 'pendiente'
                  return (
                    <div
                      key={cat.id}
                      className={`rounded-xl border-2 p-4 transition-colors ${
                        categoriaId === cat.id && !bloqueada
                          ? (COLOR_CATEGORIA[cat.color] || 'border-verde bg-verde/5 text-verde-oscuro')
                          : 'border-gray-200'
                      }`}
                    >
                      <label className={`flex items-start gap-2.5 ${bloqueada ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="radio"
                          name="categoria"
                          disabled={bloqueada}
                          checked={categoriaId === cat.id}
                          onChange={() => setCategoriaId(cat.id)}
                          className="accent-verde w-4 h-4 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-sm">{cat.label}</p>
                            {bloqueada && <Lock className="w-3 h-3 text-gray-400" />}
                            <span className="ml-auto font-bold text-sm shrink-0">{formatoPesos(precio)}</span>
                          </div>
                          <p className="text-xs opacity-80">{cat.descripcion}</p>
                        </div>
                      </label>

                      {bloqueada && pendienteEsta && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5 pl-6">
                          <Clock className="w-3 h-3 shrink-0" /> Tu solicitud está en revisión.
                        </p>
                      )}
                      {bloqueada && !pendienteEsta && (
                        <VerificarCategoria categoria={cat} pasajero={pasajero} perfilLocal={perfilLocal} />
                      )}
                    </div>
                  )
                })}
              </div>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              <button
                onClick={comprar}
                disabled={enviando || horarioYaNoDisponible || categoriaBloqueada(categoriaPorId(categoriaId))}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Generar pasaje — {formatoPesos(calcularImporte(categoriaId, horario.origen, horario.destino))}
              </button>
            </div>
          )}

          {horario && !cargandoPasaje && pasaje && <EstadoPasaje pasaje={pasaje} />}
        </>
      )}
    </div>
  )
}

function HorarioOption({ horario, fecha, seleccionado, onSeleccionar }) {
  const viaje = useViaje(horario)
  const faltaPoco = salidaTimestamp(fecha, horario.salida).getTime() < Date.now() + MINUTOS_CORTE_VENTA * 60_000
  const sinLugar = viaje && !viaje.cargando && viaje.asientos.libres <= 0
  const deshabilitado = faltaPoco || sinLugar

  return (
    <label
      className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 transition-colors ${
        deshabilitado
          ? 'opacity-60 cursor-not-allowed border-gray-100 bg-gray-50'
          : seleccionado
          ? 'border-verde bg-verde/5 cursor-pointer'
          : 'border-gray-200 hover:border-gray-300 cursor-pointer'
      }`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <input
          type="radio"
          name="horario"
          disabled={deshabilitado}
          checked={seleccionado}
          onChange={() => onSeleccionar(horario.id)}
          className="accent-verde w-4 h-4 shrink-0"
        />
        <span className="text-sm truncate">
          <span className="font-semibold text-gray-800">{horario.salida}</span>{' '}
          <span className="text-gray-500">— {horario.origen} → {horario.destino}</span>
        </span>
      </span>
      <span className="text-xs shrink-0 font-semibold">
        {faltaPoco
          ? <span className="text-gray-400">Ya no disponible</span>
          : !viaje || viaje.cargando
          ? <span className="text-gray-300">...</span>
          : sinLugar
          ? <span className="text-red-500">Sin lugar</span>
          : <span className="text-verde">{viaje.asientos.libres} libres</span>}
      </span>
    </label>
  )
}

function VerificarCategoria({ categoria, pasajero, perfilLocal }) {
  const [documento, setDocumento] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  const rechazada = pasajero?.categoriaSolicitada === categoria.id && pasajero?.estadoVerificacion === 'rechazada'

  const enviar = async () => {
    if (!documento) { setError('Subí una foto del documento.'); return }
    setError('')
    setEnviando(true)
    try {
      const nombreCompleto = `${perfilLocal.nombre} ${perfilLocal.apellido || ''}`.trim()
      const usuario = usuarioVecinoLocal() || await usuarioVecino(perfilLocal.nombre, perfilLocal.apellido)
      const esNuevo = !pasajero
      await setDoc(doc(db, 'pasajeros', idVecino()), {
        nombre: nombreCompleto,
        usuario,
        categoriaSolicitada: categoria.id,
        documentoUrl: documento,
        estadoVerificacion: 'pendiente',
        actualizadoEn: serverTimestamp(),
        ...(esNuevo ? { creadoEn: serverTimestamp() } : {}),
      }, { merge: true })
      setEnviado(true)
    } catch {
      setError('No se pudo enviar. Probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <p className="text-xs text-verde mt-2 pl-6 flex items-center gap-1.5">
        <Clock className="w-3 h-3 shrink-0" /> Solicitud enviada, un empleado la va a revisar.
      </p>
    )
  }

  return (
    <div className="mt-3 pl-6 pr-1">
      {rechazada && pasajero.motivoRechazo && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg p-2 mb-2">{pasajero.motivoRechazo}</p>
      )}
      <p className="text-xs text-gray-500 mb-1.5">
        Para desbloquear esta tarifa, subí: {categoria.descripcionDocumento}
      </p>
      <ImagenInput valor={documento} onChange={setDocumento} />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <button
        type="button"
        onClick={enviar}
        disabled={enviando}
        className="btn-secondary !text-xs !py-1.5 mt-2 disabled:opacity-60"
      >
        {enviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        {rechazada ? 'Volver a enviar' : 'Verificar categoría'}
      </button>
    </div>
  )
}

function EstadoPasaje({ pasaje }) {
  const cat = categoriaPorId(pasaje.categoria)

  if (pasaje.usado) {
    return (
      <div className="text-center max-w-sm py-4">
        <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="font-bold text-gray-600">Este pasaje ya fue utilizado</p>
        <p className="text-sm text-gray-400">{cat.label} · {pasaje.origen} → {pasaje.destino} · {pasaje.salida} hs</p>
      </div>
    )
  }

  if (pasaje.estado === 'confirmado') {
    return (
      <div className="text-center max-w-sm">
        <div className="mb-4 bg-verde/10 border border-verde/30 rounded-xl p-3 flex items-center justify-center gap-2 text-verde-oscuro font-bold text-sm">
          <BadgeCheck className="w-4 h-4" /> Pasaje confirmado
        </div>
        <PaseQR codigo={pasaje.codigo} />
        <div className="mt-4 text-sm text-gray-600 space-y-0.5">
          <p>{cat.label} · {pasaje.origen} → {pasaje.destino}</p>
          <p>{formatearFecha(pasaje.fecha)} · {pasaje.salida} hs</p>
          <p className="font-bold text-verde-oscuro">Importe abonado: {formatoPesos(pasaje.importe)}</p>
        </div>
        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Mostrale esta pantalla al conductor para embarcar.
        </p>
      </div>
    )
  }

  // Pendiente de pago.
  const mensaje = [
    '*Comprobante de pago - Pasaje Combi Municipal*',
    `Pasajero: ${pasaje.nombre}`,
    `Tipo: ${cat.label}`,
    `Recorrido: ${pasaje.origen} → ${pasaje.destino}`,
    `Fecha: ${formatearFecha(pasaje.fecha)}`,
    `Horario: ${pasaje.salida} hs`,
    `Importe: ${formatoPesos(pasaje.importe)}`,
    '',
    'Adjunto el comprobante de la transferencia.',
  ].join('\n')
  const linkWhatsApp = `https://wa.me/${datosPago.telefono}?text=${encodeURIComponent(mensaje)}`

  return (
    <div className="max-w-sm bg-amber-50 border border-amber-200 rounded-xl p-5">
      <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mb-3">
        <Clock className="w-3.5 h-3.5" /> Estado: Pago pendiente
      </p>
      <div className="text-sm text-gray-700 space-y-1 mb-4">
        <p><span className="text-gray-500">Tipo de pasaje:</span> {cat.label}</p>
        <p><span className="text-gray-500">Recorrido:</span> {pasaje.origen} → {pasaje.destino}</p>
        <p><span className="text-gray-500">Fecha:</span> {formatearFecha(pasaje.fecha)}</p>
        <p><span className="text-gray-500">Horario:</span> {pasaje.salida} hs</p>
        <p className="font-bold text-gray-800">Total a pagar: {formatoPesos(pasaje.importe)}</p>
      </div>

      <div className="pt-3 border-t border-amber-200 space-y-2">
        <p className="text-xs font-semibold text-gray-600">Pagá por transferencia:</p>
        <CopiarCampo label="Alias" valor={datosPago.alias} />
        <CopiarCampo label="Titular" valor={datosPago.titular} />
        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
        >
          <MessageCircle className="w-4 h-4" /> Enviar comprobante por WhatsApp
        </a>
        <p className="text-xs text-amber-600 pt-1">
          Apenas se confirme el pago, tu QR va a aparecer acá — no hace falta que hagas nada más.
        </p>
      </div>
    </div>
  )
}
