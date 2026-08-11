import { useEffect, useState } from 'react'
import { Mic } from 'lucide-react'
import { useTutorial } from '../../context/TutorialContext'
import { useAccesibilidad } from '../../context/AccesibilidadContext'
import { SECTORES_TOUR } from '../../data/tutorialContenido'
import { interpretarComandoVoz } from '../../data/comandosVoz'
import { hablarTachin, detenerVoz, escuchar, soportaReconocimientoVoz, esAfirmativo, esNegativo, normalizar } from '../../utils/voz'

// Traduce lo que dijo la persona a la misma acción que dispara el botón
// correspondiente de cada paso — para alguien que no ve bien la
// pantalla, la voz tiene que poder hacer exactamente lo mismo que el
// dedo. Devuelve true si entendió algo (para no reintentar de más).
function despacharRespuestaVoz(paso, texto, tutorial, sectorActual) {
  if (paso === 'saludo') {
    if (esAfirmativo(texto)) return tutorial.decirSi()
    if (esNegativo(texto)) return tutorial.decirNo()
    return false
  }
  if (paso === 'elegirModo') {
    const dicho = normalizar(texto)
    if (dicho.includes('todo') || dicho.includes('recorrido')) return tutorial.elegirTodoElRecorrido()
    if (dicho.includes('sector')) return tutorial.elegirUnSector()
    if (esNegativo(texto) || dicho.includes('ahora no')) return tutorial.parar()
    return false
  }
  if (paso === 'menuSectores') {
    const comando = interpretarComandoVoz(texto)
    const sector = comando && SECTORES_TOUR.find(s => s.ruta === comando.ruta)
    if (sector) return tutorial.elegirSector(sector.id)
    return false
  }
  if (paso === 'explicando') {
    const dicho = normalizar(texto)
    if (dicho.includes('parar') || dicho.includes('salir') || dicho.includes('cancelar')) return tutorial.parar()
    // Acá no hay ambigüedad posible (una sola acción disponible), así
    // que cualquier otra cosa que diga ("siguiente", "dale", "ok"...)
    // avanza — mejor ser permisivo que dejarla trabada sin poder seguir.
    return tutorial.siguiente()
  }
  if (paso === 'preguntarOtro') {
    if (esAfirmativo(texto)) return tutorial.quiereOtroSi()
    if (esNegativo(texto)) return tutorial.quiereOtroNo()
    return false
  }
  return false
}

// Avatar de Tachín (public/tachin.png). Si por algún motivo no carga,
// se ve un círculo simple con "T" en su lugar, para no romper nada.
function AvatarTachin() {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold font-poppins text-white shrink-0">
        T
      </div>
    )
  }

  return (
    <img
      src="/tachin.png"
      alt="Tachín"
      onError={() => setError(true)}
      // "object-contain" (no "cover") a propósito: Tachín es una figura
      // recortada (no llena todo el cuadro), un recorte circular le
      // cortaría el brazo del saludo.
      className="w-16 h-16 object-contain shrink-0 drop-shadow-md"
    />
  )
}

// Mascota guía de Mi Baradero: aparece la primera vez que alguien entra
// al sitio (o cuando lo llaman desde el botón "Ayuda" del Header) y
// ofrece explicar la app sector por sector. Nada avanza solo — cada
// paso espera que la persona toque un botón — y "Parar" está siempre
// en el mismo lugar mientras se está explicando algo.
export default function Tachin() {
  const tutorial = useTutorial()
  const { lector } = useAccesibilidad()
  const [escuchando, setEscuchando] = useState(false)
  const sectorActual = SECTORES_TOUR.find(s => s.id === tutorial?.sectorId)
  const pasoActual = sectorActual?.pasos[tutorial?.pasoSector]

  // Va mostrando exactamente de qué parte de la página está hablando:
  // si el paso trae un ancla, se scrollea ahí; si no (o si esa parte
  // todavía no existe en pantalla), se scrollea al principio — así,
  // aparte, al pasar a un sector nuevo la página nunca arranca a mitad
  // de scroll donde había quedado el sector anterior.
  useEffect(() => {
    if (tutorial?.paso !== 'explicando') return

    // Al entrar a un sector nuevo, primero un salto instantáneo arriba
    // de todo — sin esto, si el navegador venía de una página larga
    // scrolleada hasta el final, se ve un instante (o queda pegado del
    // todo con algunos navegadores) a mitad de camino antes de que
    // React termine de montar la página nueva.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    const id = setTimeout(() => {
      const destino = pasoActual?.ancla ? document.querySelector(pasoActual.ancla) : null
      if (destino) {
        destino.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        // Instantáneo, no "smooth": si la página todavía está
        // acomodando su altura (imágenes, mapa, etc.) mientras se
        // anima un scroll suave, puede cortarse a mitad de camino y no
        // llegar arriba de todo. Instantáneo siempre llega.
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
    }, 200) // le da tiempo a la navegación de ruta a terminar de montar la página nueva
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorial?.paso, tutorial?.sectorId, tutorial?.pasoSector])

  // Dice en voz alta lo mismo que muestra en pantalla y, apenas
  // termina, se pone a escuchar la respuesta — pensado para alguien que
  // no ve bien la pantalla: la voz tiene que poder hacer exactamente lo
  // mismo que tocar un botón, no solo narrar. Todo esto solo corre si
  // tiene activado "Lector de pantalla" (si no lo activó, que le hable
  // y la escuche de la nada sin haberlo pedido es más un susto que una
  // ayuda, igual que ya pasa con el saludo al abrir la app). Los
  // botones siguen ahí siempre — la voz es un camino más, no el único.
  useEffect(() => {
    if (!lector || !tutorial || tutorial.paso === 'oculto') {
      detenerVoz()
      setEscuchando(false)
      return
    }

    let cancelado = false
    const textos = {
      saludo: 'Hola, soy Tachín. ¿Querés que te explique cómo funciona Mi Baradero? Decí "sí" o "no".',
      elegirModo: '¿Cómo preferís que te explique? Decí "todo el recorrido", o "un sector".',
      menuSectores: `¿Qué sector te interesa? Podés decir: ${SECTORES_TOUR.map(s => s.titulo).join(', ')}.`,
      explicando: sectorActual && pasoActual
        ? `${sectorActual.titulo}. ${pasoActual.texto} Decí "siguiente" para continuar, o "parar" para salir.`
        : '',
      preguntarOtro: '¿Querés que te explique otro sector? Decí "sí" o "no".',
    }

    ;(async () => {
      const texto = textos[tutorial.paso]
      if (texto) await hablarTachin(texto)
      if (cancelado || !soportaReconocimientoVoz()) return

      setEscuchando(true)
      try {
        const dicho = await escuchar()
        if (cancelado) return
        despacharRespuestaVoz(tutorial.paso, dicho, tutorial, sectorActual)
      } catch {
        // No dijo nada, o hubo un error escuchando — no insiste, los
        // botones siguen disponibles para seguir de esa forma.
      } finally {
        if (!cancelado) setEscuchando(false)
      }
    })()

    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lector, tutorial?.paso, tutorial?.sectorId, tutorial?.pasoSector])

  if (!tutorial || tutorial.paso === 'oculto') return null

  const esUltimoPasoDelSector = sectorActual && tutorial.pasoSector === sectorActual.pasos.length - 1
  const esUltimoSectorDelRecorrido = tutorial.modo === 'todo' && tutorial.indice === SECTORES_TOUR.length - 1

  let etiquetaBoton = 'Siguiente'
  if (esUltimoPasoDelSector) {
    etiquetaBoton = tutorial.modo === 'todo'
      ? (esUltimoSectorDelRecorrido ? 'Terminar' : 'Siguiente sector')
      : 'Listo, entendí'
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center sm:justify-start p-4 sm:pl-8 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
        {/* Cabecera: mascota + "Parar", siempre en el mismo lugar mientras
            se está explicando algo (no en el saludo inicial, ahí ya está
            el botón "No, gracias" que cumple la misma función). */}
        <div className="bg-gradient-to-br from-verde to-verde-oscuro p-4 flex items-center gap-3">
          <AvatarTachin />
          <div className="flex-1 min-w-0">
            <p className="font-bold font-poppins text-white leading-tight">Tachín</p>
            <p className="text-xs text-green-100">Te ayuda a conocer Mi Baradero</p>
          </div>
          {tutorial.paso !== 'saludo' && (
            <button
              onClick={tutorial.parar}
              className="shrink-0 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-3.5 py-2.5 rounded-xl transition-colors"
            >
              Parar
            </button>
          )}
        </div>

        <div className="p-5">
          {tutorial.paso === 'saludo' && (
            <>
              <p className="text-gray-800 text-base leading-relaxed mb-5">
                ¡Hola! Soy Tachín 👋 ¿Querés que te explique cómo funciona Mi Baradero?
              </p>
              <div className="flex flex-col gap-2.5">
                <button onClick={tutorial.decirSi} className="btn-primary !text-base !py-3.5">Sí, dale</button>
                <button onClick={tutorial.decirNo} className="btn-secondary !text-base !py-3.5">No, gracias</button>
              </div>
            </>
          )}

          {tutorial.paso === 'elegirModo' && (
            <>
              <p className="text-gray-800 text-base leading-relaxed mb-5">¿Cómo preferís que te explique?</p>
              <div className="flex flex-col gap-2.5">
                <button onClick={tutorial.elegirTodoElRecorrido} className="btn-primary !text-base !py-3.5">Todo el recorrido</button>
                <button onClick={tutorial.elegirUnSector} className="btn-secondary !text-base !py-3.5">Elegir un sector</button>
                <button onClick={tutorial.parar} className="text-gray-400 hover:text-gray-600 text-sm font-semibold py-1.5">
                  Ahora no
                </button>
              </div>
            </>
          )}

          {tutorial.paso === 'menuSectores' && (
            <>
              <p className="text-gray-800 text-base leading-relaxed mb-5">¿Qué sector te interesa?</p>
              <div className="flex flex-col gap-2.5">
                {SECTORES_TOUR.map(s => (
                  <button
                    key={s.id}
                    onClick={() => tutorial.elegirSector(s.id)}
                    className="btn-secondary !text-base !py-3.5 !justify-start"
                  >
                    {s.titulo}
                  </button>
                ))}
              </div>
            </>
          )}

          {tutorial.paso === 'explicando' && sectorActual && (
            <>
              <p className="font-bold font-poppins text-verde-oscuro text-lg mb-1">{sectorActual.titulo}</p>
              {sectorActual.pasos.length > 1 && (
                <p className="text-xs text-gray-400 mb-3">Paso {tutorial.pasoSector + 1} de {sectorActual.pasos.length}</p>
              )}
              <p className={`text-gray-700 text-base leading-relaxed mb-5 ${sectorActual.pasos.length > 1 ? '' : 'mt-2'}`}>
                {pasoActual?.texto}
              </p>
              <button onClick={tutorial.siguiente} className="btn-primary w-full !text-base !py-3.5">
                {etiquetaBoton}
              </button>
              {tutorial.modo === 'todo' && (
                <p className="text-center text-xs text-gray-400 mt-3">Sector {tutorial.indice + 1} de {SECTORES_TOUR.length}</p>
              )}
            </>
          )}

          {tutorial.paso === 'preguntarOtro' && (
            <>
              <p className="text-gray-800 text-base leading-relaxed mb-5">¿Querés que te explique otro sector?</p>
              <div className="flex flex-col gap-2.5">
                <button onClick={tutorial.quiereOtroSi} className="btn-primary !text-base !py-3.5">Sí</button>
                <button onClick={tutorial.quiereOtroNo} className="btn-secondary !text-base !py-3.5">No, ya entendí</button>
              </div>
            </>
          )}

          {/* Además de los botones, mientras "Lector de pantalla" está
              activo también se puede contestar hablando — esto avisa
              que te está escuchando de verdad, no que se quedó trabada. */}
          {escuchando && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-verde font-bold mt-4">
              <Mic className="w-3.5 h-3.5 animate-pulse" /> Escuchando…
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
