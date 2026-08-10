import { useEffect, useRef, useState } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Mic, MicOff, X } from 'lucide-react'
import { db } from '../firebase'
import { idVecino, esPrimerGuardadoVecino, marcarVecinoGuardado } from '../utils/perfilLocal'
import { usuarioVecino } from '../utils/usuario'
import { hablar, escuchar, esAfirmativo, esNegativo, detenerVoz, soportaReconocimientoVoz } from '../utils/voz'
import { NOTIF_SECTORES } from '../data/notifSectores'

const PREGUNTAS_SECTOR = {
  basura: '¿Querés activar notificaciones de recolección de residuos?',
  eventos: '¿Querés activar notificaciones de eventos: cuando estén por empezar y cuando se agreguen nuevos a la agenda?',
  puntosVerdes: '¿Querés activar notificaciones de puntos verdes?',
  combi: '¿Querés activar notificaciones de demoras y cambios de parada de la combi municipal?',
}

// Asistente conversacional por voz para registrarse sin usar el
// formulario: pregunta y confirma cada dato hablado, y al final guarda
// el perfil exactamente igual que "Guardar perfil" en /perfil (mismo
// localStorage + mismo documento en Firestore).
export default function AsistenteVoz({ onClose }) {
  const [mensajes, setMensajes] = useState([])
  const [escuchando, setEscuchando] = useState(false)
  const [terminado, setTerminado] = useState(false)
  const canceladoRef = useRef(false)

  useEffect(() => {
    if (!soportaReconocimientoVoz()) return
    ejecutarConversacion()
    return () => {
      canceladoRef.current = true
      detenerVoz()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const agregarMensaje = (quien, texto) => setMensajes(m => [...m, { quien, texto }])

  const decir = async texto => {
    if (canceladoRef.current) throw new Error('cancelado')
    agregarMensaje('bot', texto)
    await hablar(texto)
  }

  const oir = async () => {
    if (canceladoRef.current) throw new Error('cancelado')
    setEscuchando(true)
    agregarMensaje('vos', '(escuchando...)')
    try {
      const texto = await escuchar()
      setMensajes(m => {
        const copia = [...m]
        copia[copia.length - 1] = { quien: 'vos', texto }
        return copia
      })
      return texto
    } catch (err) {
      setMensajes(m => {
        const copia = [...m]
        copia[copia.length - 1] = { quien: 'vos', texto: '(no se entendió)' }
        return copia
      })
      throw err
    } finally {
      setEscuchando(false)
    }
  }

  const preguntarSiNo = async pregunta => {
    let intentos = 0
    while (!canceladoRef.current && intentos < 6) {
      await decir(pregunta)
      try {
        const respuesta = await oir()
        if (esAfirmativo(respuesta)) return true
        if (esNegativo(respuesta)) return false
      } catch {
        /* sigue el loop y reintenta */
      }
      pregunta = 'No te entendí bien. Decí "sí" o "no".'
      intentos++
    }
    throw new Error('sin-respuesta')
  }

  const preguntarTexto = async preguntaOriginal => {
    let pregunta = preguntaOriginal
    let intentos = 0
    while (!canceladoRef.current && intentos < 6) {
      await decir(pregunta)
      let respuesta
      try {
        respuesta = await oir()
      } catch {
        pregunta = 'No te escuché. Repetime, por favor.'
        intentos++
        continue
      }
      const confirma = await preguntarSiNo(`¿Confirmás "${respuesta}"?`)
      if (confirma) return respuesta
      pregunta = preguntaOriginal
      intentos++
    }
    throw new Error('sin-respuesta')
  }

  const guardarPerfilPorVoz = async ({ nombre, apellido, notif, notifVoz }) => {
    const previo = JSON.parse(localStorage.getItem('mibaradero_perfil') || 'null') || {}
    const perfil = {
      ...previo,
      nombre,
      apellido,
      notif: { ...previo.notif, ...notif },
      notifVoz: { ...previo.notifVoz, ...notifVoz },
    }
    localStorage.setItem('mibaradero_perfil', JSON.stringify(perfil))

    const esNuevo = esPrimerGuardadoVecino()
    const usuario = await usuarioVecino(nombre, apellido)
    await setDoc(doc(db, 'vecinos', idVecino()), {
      nombre,
      apellido,
      notif: perfil.notif,
      usuario,
      actualizadoEn: serverTimestamp(),
      ...(esNuevo ? { creadoEn: serverTimestamp() } : {}),
    }, { merge: true })
    if (esNuevo) marcarVecinoGuardado()
    return usuario
  }

  const ejecutarConversacion = async () => {
    try {
      const quiere = await preguntarSiNo('Hola, soy el asistente de voz de Mi Baradero. ¿Querés registrarte por voz?')
      if (!quiere) {
        await decir('Está bien. Cuando quieras, volvé a activarme desde el botón del micrófono.')
        setTerminado(true)
        return
      }

      const nombre = await preguntarTexto('Por favor, decime tu nombre.')
      const apellido = await preguntarTexto('Ahora decime tu apellido.')

      const notif = {}
      const notifVoz = {}
      for (const sector of NOTIF_SECTORES) {
        const quiereNotif = await preguntarSiNo(`${PREGUNTAS_SECTOR[sector.key]} Decí sí o no.`)
        notif[sector.key] = quiereNotif
        if (quiereNotif) {
          await decir(`Te doy un ejemplo de cómo te llegaría: "${sector.ejemplo}"`)
          notifVoz[sector.key] = await preguntarSiNo('¿Querés que estas notificaciones también te lleguen habladas, como recién? Decí sí o no.')
        } else {
          notifVoz[sector.key] = false
        }
      }

      await guardarPerfilPorVoz({ nombre, apellido, notif, notifVoz })
      await decir(`Listo ${nombre}, guardé tu perfil y tus preferencias de notificación. ¡Gracias por usar Mi Baradero!`)
    } catch {
      if (!canceladoRef.current) {
        await decir('Tuvimos un problema para escucharte. Podés intentar de nuevo cuando quieras, o cargar tu perfil desde el formulario.')
      }
    } finally {
      setTerminado(true)
    }
  }

  const cerrar = () => {
    canceladoRef.current = true
    detenerVoz()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold font-poppins text-gray-800 flex items-center gap-2">
            {escuchando ? <Mic className="w-5 h-5 text-verde animate-pulse" /> : <MicOff className="w-5 h-5 text-gray-400" />}
            Asistente de voz
          </h3>
          <button onClick={cerrar} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Cerrar">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!soportaReconocimientoVoz() ? (
          <div className="p-6 text-center">
            <p className="text-gray-600 text-sm leading-relaxed">
              Tu navegador no soporta reconocimiento de voz. Esta función funciona en <strong>Chrome</strong> o <strong>Edge</strong>
              (en computadora o Android). Podés cargar tu perfil manualmente desde el formulario en su lugar.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.quien === 'bot' ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                    m.quien === 'bot' ? 'bg-gray-100 text-gray-800' : 'bg-verde text-white'
                  }`}
                >
                  {m.texto}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-gray-100">
          <button onClick={cerrar} className="btn-secondary w-full !text-sm !py-2.5">
            {terminado ? 'Cerrar' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  )
}
