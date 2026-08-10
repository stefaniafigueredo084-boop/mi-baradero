import { useState } from 'react'
import { useTutorial } from '../../context/TutorialContext'
import { SECTORES_TOUR } from '../../data/tutorialContenido'

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
  if (!tutorial || tutorial.paso === 'oculto') return null

  const sectorActual = SECTORES_TOUR.find(s => s.id === tutorial.sectorId)
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
                {sectorActual.pasos[tutorial.pasoSector]}
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
        </div>
      </div>
    </div>
  )
}
