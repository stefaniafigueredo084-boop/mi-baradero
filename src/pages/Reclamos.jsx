import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Camera, CheckCircle, ClipboardList, Loader2, MapPin, MessageSquare, Send, X } from 'lucide-react'
import { asegurarSesion, db } from '../firebase'
import { nombreVecino } from '../utils/perfilLocal'
import { comprimirImagen } from '../utils/imagen'
import { MENSAJE_MALAS_PALABRAS, tieneMalasPalabras } from '../utils/malasPalabras'
import { leerIdsReclamos, recordarReclamo, useMisReclamos } from '../hooks/useMisReclamos'
import {
  AREAS_RECLAMO,
  TIPOS_RECLAMO,
  areaReclamoPorId,
  codigoReclamo,
  departamentoDeReclamo,
  departamentoPorId,
  estadoReclamoPorId,
  fechaReclamo,
  tipoReclamoPorId,
} from '../data/reclamosData'

const MAX_MENSAJE = 1000

function MiReclamo({ reclamo }) {
  const tipo = tipoReclamoPorId(reclamo.tipo)
  const estado = estadoReclamoPorId(reclamo.estado)
  return (
    <div className="bg-white rounded shadow-md p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge text-xs font-semibold ${tipo.color}`}><tipo.icono className="w-3.5 h-3.5" /> {tipo.label}</span>
          <span className="text-xs text-gray-500">{areaReclamoPorId(reclamo.area).label}</span>
        </div>
        <span className={`badge text-xs font-bold ${estado.color}`}>{estado.label}</span>
      </div>
      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line break-words">{reclamo.mensaje}</p>
      <p className="text-xs text-gray-400 mt-2">
        {codigoReclamo(reclamo.id)}{reclamo.creadoEn ? ` · ${fechaReclamo(reclamo.creadoEn)}` : ''}
        {' · '}Lo atiende: {departamentoDeReclamo(reclamo).label}
      </p>
      {reclamo.respuesta && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
          <p className="text-xs font-bold text-primario mb-1">Respuesta del municipio</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">{reclamo.respuesta}</p>
        </div>
      )}
    </div>
  )
}

export default function Reclamos() {
  const [tipo, setTipo] = useState('reclamo')
  const [area, setArea] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [nombre, setNombre] = useState(() => nombreVecino())
  const [foto, setFoto] = useState('')
  const [procesandoFoto, setProcesandoFoto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(null) // { id, departamento } del reclamo recién enviado

  const [ids, setIds] = useState(() => leerIdsReclamos())
  const { reclamos, cargando } = useMisReclamos(ids)

  const manejarFoto = async e => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setError('')
    setProcesandoFoto(true)
    try {
      setFoto(await comprimirImagen(archivo))
    } catch {
      setError('No se pudo procesar la foto. Probá con otra.')
    } finally {
      setProcesandoFoto(false)
    }
  }

  const enviar = async e => {
    e.preventDefault()
    if (!area) { setError('Elegí sobre qué tema es.'); return }
    if (mensaje.trim().length < 10) { setError('Contanos un poco más: escribí al menos 10 caracteres.'); return }
    if ([mensaje, ubicacion, nombre].some(tieneMalasPalabras)) { setError(MENSAJE_MALAS_PALABRAS); return }
    setError('')
    setEnviando(true)
    try {
      const { uid } = await asegurarSesion()
      const ref = await addDoc(collection(db, 'reclamos'), {
        uid,
        tipo,
        area,
        departamento: areaReclamoPorId(area).departamento,
        mensaje: mensaje.trim(),
        ubicacion: ubicacion.trim(),
        nombre: nombre.trim(),
        fotoUrl: foto,
        estado: 'nuevo',
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      })
      setIds(recordarReclamo(ref.id))
      setEnviado({ id: ref.id, departamento: areaReclamoPorId(area).departamento })
      setMensaje('')
      setUbicacion('')
      setFoto('')
      setArea('')
    } catch {
      setError('No se pudo enviar. Revisá tu conexión y probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primario text-white py-5 sm:py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-secundario flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-poppins">Reclamos y Sugerencias</h1>
            <p className="text-white/80 text-sm sm:text-base">Contale al municipio qué pasa en tu barrio y seguí la respuesta</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

        {enviado ? (
          <div className="bg-white rounded shadow-xl p-8 sm:p-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-secundario/10 rounded-full p-5">
                <CheckCircle className="w-14 h-14 text-secundario" />
              </div>
            </div>
            <h2 className="text-2xl font-bold font-poppins text-gray-800 mb-2">¡Recibimos tu mensaje!</h2>
            <p className="text-gray-500 mb-4">
              Ya le llegó al municipio. Guardá este código por si necesitás consultar:
            </p>
            <p className="inline-block bg-gray-100 text-gray-800 font-bold font-poppins text-xl tracking-widest px-5 py-2.5 rounded mb-6">
              {codigoReclamo(enviado.id)}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Lo va a atender <strong>{departamentoPorId(enviado.departamento).label}</strong>. Más abajo, en “Mis reclamos”, vas a ver cuando cambie de estado o te respondan.
            </p>
            <button onClick={() => setEnviado(null)} className="btn-primary">
              Enviar otro
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} className="bg-white rounded shadow-xl overflow-hidden" id="reclamos-form">

            {/* Tipo */}
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <h2 className="font-bold font-poppins text-gray-800 mb-4">¿Qué querés enviar?</h2>
              <div className="grid grid-cols-2 gap-3">
                {TIPOS_RECLAMO.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipo(t.id)}
                    aria-pressed={tipo === t.id}
                    className={`text-left p-4 rounded border-2 transition-all duration-200 ${
                      tipo === t.id
                        ? 'border-primario bg-primario/10'
                        : 'border-gray-200 hover:border-primario'
                    }`}
                  >
                    <span className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 ${t.color}`} aria-hidden="true">
                      <t.icono className="w-5 h-5" />
                    </span>
                    <span className="font-bold text-gray-800 block">{t.label}</span>
                    <span className="text-xs text-gray-500 leading-snug block">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Área */}
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <h2 className="font-bold font-poppins text-gray-800 mb-4">¿Sobre qué tema es?</h2>
              <div className="flex flex-wrap gap-2">
                {AREAS_RECLAMO.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setArea(a.id)}
                    aria-pressed={area === a.id}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                      area === a.id
                        ? 'bg-primario text-white border-primario shadow-md shadow-primario/20'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primario hover:text-primario'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensaje */}
            <div className="p-6 sm:p-8 border-b border-gray-100 space-y-5">
              <div>
                <label htmlFor="reclamo-mensaje" className="font-bold font-poppins text-gray-800 mb-3 block">
                  Contanos qué pasó
                </label>
                <textarea
                  id="reclamo-mensaje"
                  value={mensaje}
                  onChange={e => setMensaje(e.target.value)}
                  placeholder="Ej: Hace una semana que no pasa el camión por mi cuadra..."
                  maxLength={MAX_MENSAJE}
                  rows={5}
                  className="input-field resize-none text-sm leading-relaxed"
                />
                <p className="text-gray-400 text-xs text-right mt-1">{mensaje.length}/{MAX_MENSAJE}</p>
              </div>

              <div>
                <label htmlFor="reclamo-ubicacion" className="font-bold font-poppins text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primario" /> ¿Dónde es?
                  <span className="text-gray-400 font-normal text-sm">(opcional)</span>
                </label>
                <input
                  id="reclamo-ubicacion"
                  type="text"
                  value={ubicacion}
                  onChange={e => setUbicacion(e.target.value)}
                  placeholder="Ej: San Martín y Anchorena, frente a la plaza"
                  maxLength={150}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <p className="font-bold font-poppins text-gray-800 mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-primario" /> Foto
                  <span className="text-gray-400 font-normal text-sm">(opcional)</span>
                </p>
                {foto && (
                  <div className="relative w-full h-44 rounded overflow-hidden mb-3 border-2 border-gray-200">
                    <img src={foto} alt="Foto adjunta al reclamo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFoto('')}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-colors"
                      aria-label="Quitar foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded border-2 border-gray-200 text-gray-600 hover:border-primario hover:text-primario font-semibold text-sm transition-colors">
                  {procesandoFoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  {foto ? 'Cambiar foto' : 'Agregar una foto'}
                  <input type="file" accept="image/*" className="hidden" onChange={manejarFoto} disabled={procesandoFoto} />
                </label>
              </div>

              <div>
                <label htmlFor="reclamo-nombre" className="font-bold font-poppins text-gray-800 mb-3 block">
                  Tu nombre{' '}
                  <span className="text-gray-400 font-normal text-sm">(opcional)</span>
                </label>
                <input
                  id="reclamo-nombre"
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Si lo dejás vacío, se envía como anónimo"
                  maxLength={60}
                  className="input-field text-sm"
                />
              </div>
            </div>

            {/* Enviar */}
            <div className="p-6 sm:p-8 bg-gray-50">
              {error && <p className="text-red-500 text-sm mb-3 text-center" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={enviando || procesandoFoto}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base disabled:opacity-60"
              >
                {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {enviando ? 'Enviando...' : 'Enviar'}
              </button>
              <p className="text-gray-400 text-xs text-center mt-3">
                No pedimos teléfono ni dirección de tu casa. Por una emergencia llamá al 100, 101 o 107.
              </p>
            </div>
          </form>
        )}

        {/* Mis reclamos */}
        <section id="mis-reclamos">
          <h2 className="font-bold font-poppins text-xl text-gray-800 flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-primario" /> Mis reclamos
          </h2>
          <p className="text-gray-500 text-sm mb-5">Lo que enviaste desde este dispositivo y en qué estado está.</p>

          {ids.length === 0 ? (
            <p className="text-gray-400 text-sm">Todavía no enviaste nada desde este dispositivo.</p>
          ) : cargando && reclamos.length === 0 ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : reclamos.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay reclamos para mostrar.</p>
          ) : (
            <div className="space-y-4">
              {reclamos.map(r => <MiReclamo key={r.id} reclamo={r} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
