import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  Bus, Trash2, CalendarDays, Recycle, MessageSquare, UserCircle,
  ArrowRight, QrCode, BadgeCheck, Ticket, ScanLine, Check, Clock, Bell,
  MapPin, Map as MapIcon, Truck, Leaf, Newspaper, Lightbulb, Wrench, ThumbsUp,
  ThumbsDown, Type, Moon, Volume2, Mic, WifiOff, ShieldCheck, Lock,
} from 'lucide-react'

const URL_APP = 'https://mi-baradero.web.app'

// Página para presentar y ofrecer la app (/presentacion). Va sin el
// header, la barra de abajo ni Tachín: es una página de venta, no parte
// del uso diario. Todo lo que dice tiene que ser algo que la app ya hace.
//
// Forma de herramienta (fondo oscuro, tarjetas claras, rótulos en letra
// de máquina) pero con la identidad de Mi Baradero: verde oscuro de fondo,
// títulos en Poppins, botón verde y el amarillo/verde de la marca como
// señal en puntos y detalles.

const C = {
  fondo: '#0F1D17',
  elevado: '#1D3328',
  linea: '#2F4D3F',
  apagado: '#8FA89B',
  suave: '#B9CCC1',
  hueso: '#F1F6F3',
  amarillo: '#F2B53E',
  verde: '#6AAE4E',
}

const SERVICIOS = [
  { Icon: Bus, titulo: 'Combi Municipal', texto: 'Horarios, alertas y demoras, recorrido y Mi Pase: el pasaje con QR para subir.' },
  { Icon: Trash2, titulo: 'Residuos', texto: 'Calendario semanal y "Tu zona": qué se recolecta hoy en tu barrio y si ya pasó.' },
  { Icon: CalendarDays, titulo: 'Eventos y noticias', texto: 'Agenda de la ciudad, noticias del municipio y "Agregar a mi calendario".' },
  { Icon: Recycle, titulo: 'Puntos Verdes', texto: 'Mapa real, qué materiales recibe cada punto y cómo llegar.' },
  { Icon: MessageSquare, titulo: 'Reclamos', texto: 'Con foto opcional y un código para seguir el estado y la respuesta.' },
  { Icon: UserCircle, titulo: 'Mi Perfil', texto: 'Cuenta opcional con Google o email, y opciones de accesibilidad.' },
]

const PASOS_PASE = [
  { Icon: Ticket, titulo: 'El vecino pide el pasaje', texto: 'Elige el horario desde Mi Pase.' },
  { Icon: BadgeCheck, titulo: 'El municipio confirma', texto: 'El sector Combi confirma el pago desde el panel.' },
  { Icon: QrCode, titulo: 'Se genera el QR', texto: 'Queda en el celular, aunque no haya internet.' },
  { Icon: ScanLine, titulo: 'El chofer lo escanea', texto: 'Al subir, con su propio celular.' },
]

const SECTORES = [
  { titulo: 'Combi', texto: 'Horarios, alertas, parada actual, pagos y categorías.' },
  { titulo: 'Choferes', texto: 'Escanean el QR de cada pasajero de sus horarios.' },
  { titulo: 'Residuos', texto: 'Calendario, zonas, estado del camión, avisos y consejos.' },
  { titulo: 'Eventos', texto: 'Eventos, noticias y avisos para toda la ciudad.' },
  { titulo: 'Puntos Verdes', texto: 'Puntos de reciclaje y su ubicación en el mapa.' },
  { titulo: 'Atención al Vecino', texto: 'Reclamos: estado, respuesta y derivación a otra área.' },
]

const mono = { fontFamily: "'Geist Mono', ui-monospace, monospace" }

function Rotulo({ children, color = C.amarillo, oscuro = false }) {
  return (
    <p className="flex items-center gap-2 text-xs uppercase tracking-[-0.02em]" style={{ ...mono, color: oscuro ? '#0F1D17' : C.suave }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      {children}
    </p>
  )
}

function Titulo({ rotulo, titulo, texto, color }) {
  return (
    <div className="max-w-2xl">
      <Rotulo color={color}>{rotulo}</Rotulo>
      <h2 className="mt-4 text-[32px] sm:text-[44px] leading-[1.1] tracking-[-0.025em]" style={{ color: C.hueso }}>{titulo}</h2>
      {texto && <p className="mt-4 text-base leading-normal" style={{ color: C.apagado }}>{texto}</p>}
    </div>
  )
}

const botonClaro = 'inline-flex items-center gap-2 h-11 px-[14px] rounded-[3px] text-sm bg-[#3D8B68] text-white hover:bg-[#4A9C77] transition-colors duration-150'
const botonFantasma = 'inline-flex items-center gap-2 h-11 px-[14px] text-sm border border-[#2F4D3F] text-[#F1F6F3] hover:border-[#F1F6F3] transition-colors duration-150'

// Movimiento: corto y seco, como una herramienta. Si la persona pidió
// "reducir movimiento" en su equipo, todo aparece quieto.
const ESTILOS = `
@keyframes pres-entrar { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
@keyframes pres-ventana { from { opacity: 0; transform: translateY(24px) scale(.97) } to { opacity: 1; transform: none } }
@keyframes pres-cinta { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes pres-pulso { 0%, 100% { box-shadow: 0 0 0 0 rgba(242,181,62,.55) } 60% { box-shadow: 0 0 0 6px rgba(242,181,62,0) } }
@keyframes pres-escaneo { 0%, 100% { top: 8% } 50% { top: 88% } }
@keyframes pres-flotar { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
@keyframes pres-pulso-verde { 0%, 100% { box-shadow: 0 0 0 0 rgba(106,174,78,.6) } 60% { box-shadow: 0 0 0 10px rgba(106,174,78,0) } }
@keyframes pres-aviso { 0%, 8% { opacity: 0; transform: translateY(-10px) } 14%, 86% { opacity: 1; transform: none } 92%, 100% { opacity: 0; transform: translateY(-10px) } }
.pres h1, .pres h2, .pres-titulo { font-family: Poppins, sans-serif; font-weight: 600 }
.pres-entrar { opacity: 0; animation: pres-entrar .7s cubic-bezier(.2,.7,.2,1) forwards }
.pres-ventana { opacity: 0; animation: pres-ventana .9s cubic-bezier(.2,.7,.2,1) forwards }
.pres-cinta { animation: pres-cinta 40s linear infinite }
.pres-pulso { animation: pres-pulso 2s ease-out infinite }
.pres-escaneo { animation: pres-escaneo 2.4s ease-in-out infinite }
.pres-aviso { animation: pres-aviso 6s ease-in-out infinite }
.pres-barra { width: 0; transition: width 1.2s cubic-bezier(.2,.7,.2,1) .2s }
.visto .pres-barra { width: var(--ancho) }
.pres-flotar { animation: pres-flotar 4s ease-in-out infinite }
.pres-pulso-verde { animation: pres-pulso-verde 2.4s ease-out infinite }
[data-aparecer] { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1) }
[data-aparecer].visto { opacity: 1; transform: none }
@media (prefers-reduced-motion: reduce) {
  .pres-barra { width: var(--ancho) !important; transition: none !important }
  .pres-entrar, .pres-ventana, [data-aparecer] { opacity: 1 !important; transform: none !important; animation: none !important; transition: none !important }
  .pres-cinta, .pres-pulso, .pres-escaneo, .pres-aviso, .pres-flotar, .pres-pulso-verde { animation: none !important }
}
`

function Punto({ color = C.amarillo, vivo = false }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${vivo ? 'pres-pulso' : ''}`} style={{ background: color }} />
}

// Celular con la app adentro: la pantalla es clara (la "tarjeta" sobre
// el negro). Arriba cae un aviso de vez en cuando, como uno real del
// panel. Los textos son los de la app, sin horarios inventados.
function Celular() {
  return (
    <div className="w-[230px] sm:w-[250px] rounded-[2.4rem] p-2 border" style={{ background: '#0B1612', borderColor: C.linea }}>
      <div className="relative rounded-[2rem] overflow-hidden" style={{ background: C.hueso, color: '#0F1D17' }}>
        <div className="flex justify-center pt-2"><span className="w-16 h-4 rounded-full bg-[#0F1D17]" /></div>

        <div className="pres-aviso absolute left-2.5 right-2.5 top-8 z-10 rounded-[10px] px-3 py-2.5" style={{ background: '#0F1D17', color: C.hueso }}>
          <p className="flex items-center gap-1.5 text-[9px] uppercase" style={{ ...mono, color: C.suave }}>
            <Punto /> Aviso · Combi
          </p>
          <p className="mt-1 text-[11px] leading-snug">El municipio cargó un cambio de horario</p>
        </div>

        <div className="px-4 pt-4 pb-5">
          <p className="text-[9px] uppercase text-[#8FA89B]" style={mono}>Baradero, Buenos Aires</p>
          <p className="pres-titulo mt-1.5 text-[22px] leading-[1.05] tracking-[-0.04em]">Todo Baradero en tus manos</p>

          <p className="mt-5 text-[9px] uppercase text-[#8FA89B]" style={mono}>Hoy en Baradero</p>
          <div className="mt-2 border-t border-[#0F1D17]/15">
            {[
              { Icon: Bus, t: 'Próxima combi', d: 'según el horario' },
              { Icon: Trash2, t: 'Residuos en tu zona', d: 'horario estimado' },
              { Icon: CalendarDays, t: 'Próximo evento', d: 'agenda de la ciudad' },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="flex items-center gap-2.5 py-2.5 border-b border-[#0F1D17]/15">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-[11px] leading-tight">{t}<span className="block text-[#8FA89B]">{d}</span></span>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {[Bus, Trash2, CalendarDays, Recycle, MessageSquare, UserCircle].map((Icon, i) => (
              <span key={i} className="h-10 rounded-[3px] bg-[#0F1D17] flex items-center justify-center">
                <Icon className="w-4 h-4" style={{ color: i % 2 ? C.verde : C.hueso }} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Ventana tipo escritorio con el panel del municipio. Sin números
// inventados: solo lo que la app tiene de verdad.
function VentanaPanel() {
  const filas = [
    { etiqueta: 'Servicios para el vecino', valor: '6', color: C.verde },
    { etiqueta: 'Sectores del panel', valor: '6', color: C.verde },
    { etiqueta: 'Roles de cuenta', valor: '2', detalle: 'admin · sector', color: C.amarillo },
    { etiqueta: 'Tiendas de apps', valor: '0', detalle: 'se instala desde el navegador', color: C.amarillo },
  ]
  return (
    <div className="rounded-[10px] overflow-hidden border" style={{ background: '#0B1612', borderColor: C.elevado }}>
      <div className="flex items-center gap-3 px-4 h-10 border-b" style={{ borderColor: C.elevado }}>
        <span className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2F4D3F]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2F4D3F]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2F4D3F]" />
        </span>
        <span className="text-xs uppercase" style={{ ...mono, color: C.suave }}>Panel de trabajadores</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs uppercase" style={{ ...mono, color: C.apagado }}>
          <Punto vivo /> En línea
        </span>
      </div>
      <div className="grid grid-cols-2">
        {filas.map(({ etiqueta, valor, detalle, color }, i) => (
          <div key={etiqueta} className={`p-5 border-b ${i % 2 === 0 ? 'border-r' : ''}`} style={{ borderColor: C.elevado }}>
            <p className="text-xs uppercase leading-tight" style={{ ...mono, color: C.suave }}>{etiqueta}</p>
            <p className="mt-3 text-[36px] leading-none tracking-[-0.031em]" style={{ color: C.hueso }}>{valor}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: C.apagado }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
              {detalle || 'funcionando hoy'}
            </p>
          </div>
        ))}
      </div>
      <div className="p-5">
        <p className="text-xs uppercase" style={{ ...mono, color: C.suave }}>Reclamo</p>
        <div className="mt-3 flex items-center justify-between gap-3 border rounded-[3px] px-3 h-11" style={{ borderColor: C.linea }}>
          <span className="text-sm" style={{ ...mono, color: C.hueso }}>#K3F9QA</span>
          <span className="text-xs uppercase" style={{ ...mono, color: C.verde }}>Respondido</span>
        </div>
        <p className="mt-2 text-xs" style={{ color: C.apagado }}>Ejemplo del formato del código de seguimiento</p>
      </div>
    </div>
  )
}

// ── Datos de las partes de la presentación ─────────────────────────────
// Pensada para unos 20 minutos entre 4 personas: 4 partes de ~5 minutos.

const PARTES = [
  { n: '01', id: 'parte-1', titulo: 'El proyecto', texto: 'Qué problema vimos en Baradero y qué idea tuvimos.' },
  { n: '02', id: 'parte-2', titulo: 'Para el vecino', texto: 'Recorremos la app como la usa cualquier persona.' },
  { n: '03', id: 'parte-3', titulo: 'Participar e incluir', texto: 'Reclamos, accesibilidad, el panel del municipio y cómo está hecha.' },
  { n: '04', id: 'parte-4', titulo: 'Por qué Mi Baradero', texto: 'Lo que dijo la comunidad, cuánto cuesta y cómo empezar.' },
]

const SITUACIONES = [
  { pregunta: '¿A qué hora sale la combi a Alsina?', donde: 'Combi Municipal → Horarios', Icon: Bus },
  { pregunta: '¿Hoy pasa el camión por mi barrio?', donde: 'Residuos → Tu zona', Icon: Trash2 },
  { pregunta: '¿Dónde llevo las botellas de plástico?', donde: 'Puntos Verdes → Mapa', Icon: Recycle },
  { pregunta: 'Se quemó la luz de la esquina, ¿a quién le aviso?', donde: 'Reclamos → Alumbrado público', Icon: Lightbulb },
]

const OBJETIVOS = [
  { titulo: 'Acercar', texto: 'Que la información del municipio esté en el bolsillo de cada vecino, a cualquier hora.' },
  { titulo: 'Ordenar', texto: 'Que cada área cargue lo suyo en un solo lugar, y que no se pierdan los pedidos.' },
  { titulo: 'Incluir', texto: 'Que la pueda usar todo el mundo: gente grande, personas con discapacidad y quien tiene poca señal.' },
]

const CATEGORIAS_PASE = [
  { nombre: 'Común', tarifa: 'Tarifa completa', doc: 'No requiere documento', prioridad: false },
  { nombre: 'Estudiante', tarifa: '50% de descuento', doc: 'Constancia de alumno regular', prioridad: false },
  { nombre: 'Jubilado', tarifa: '50% de descuento', doc: 'Carnet de jubilación', prioridad: true },
  { nombre: 'Discapacidad', tarifa: 'Sin cargo', doc: 'Certificado Único de Discapacidad (CUD)', prioridad: true },
]

const TIPOS_RECLAMO = [
  { Icon: ThumbsDown, nombre: 'Queja', texto: 'Algo molestó o no funcionó bien' },
  { Icon: Wrench, nombre: 'Reclamo', texto: 'Algo que hay que arreglar' },
  { Icon: Lightbulb, nombre: 'Sugerencia', texto: 'Una idea para mejorar' },
  { Icon: ThumbsUp, nombre: 'Felicitación', texto: 'Algo que salió bien' },
]

const DEPARTAMENTOS = [
  'Atención al Vecino', 'Transporte', 'Higiene Urbana', 'Ambiente', 'Cultura y Eventos',
  'Obras Públicas', 'Alumbrado Público', 'Espacios Verdes', 'Sistemas',
]

const RECLAMO_PUNTA_A_PUNTA = [
  { quien: 'Vecino', texto: 'Elige el tema, escribe qué pasa y si quiere agrega una foto.' },
  { quien: 'App', texto: 'Le da un código de seguimiento y lo manda al departamento que corresponde.' },
  { quien: 'Municipio', texto: 'El sector lo ve en su panel, lo pone "En proceso" o lo deriva a otra área.' },
  { quien: 'Municipio', texto: 'Escribe la respuesta y lo marca como "Resuelto".' },
  { quien: 'Vecino', texto: 'Ve el estado y la respuesta en "Mis reclamos", sin llamar a nadie.' },
]

const ANTES_DESPUES = [
  ['Horarios de la combi', 'Carteles, redes o preguntar', 'En la app, actualizados por el sector'],
  ['Pasaje', 'Papel o efectivo al subir', 'QR en el celular, de un solo uso'],
  ['Días de recolección', 'Hay que acordarse', 'Tu zona: qué pasa hoy y si ya pasó'],
  ['Reclamos', 'Llamar y esperar', 'Código, estado y respuesta por escrito'],
  ['Avisos del municipio', 'Se enteran algunos', 'Llegan a la portada en el momento'],
]

const PROPUESTA = [
  { titulo: 'Cargar los datos oficiales', texto: 'Horarios, zonas de recolección, Puntos Verdes y eventos, desde el mismo panel.' },
  { titulo: 'Crear las cuentas', texto: 'Una por trabajador, cada una con su sector. Las crea el administrador.' },
  { titulo: 'Capacitar al personal', texto: 'Una charla corta por sector: el panel se usa como un formulario.' },
  { titulo: 'Contarle a los vecinos', texto: 'Con el código QR en paradas, plazas, la terminal y las redes del municipio.' },
]

// ── Datos del informe del proyecto (Feria Provincial de Ciencias 2026) ──

const CANALES_HOY = ['Redes sociales', 'Páginas institucionales', 'Medios periodísticos locales', 'Grupos de WhatsApp', 'Carteles en la calle']

const ITINERARIO = [
  { mes: 'Marzo', t: 'Identificación del problema', d: 'Vimos lo difícil que es encontrar información local ordenada.' },
  { mes: 'Abril', t: 'Investigación e ideas', d: 'Buscamos soluciones y definimos qué tendría la plataforma.' },
  { mes: 'Mayo', t: 'Diseño', d: 'Estructura, secciones y cómo se vería cada pantalla.' },
  { mes: 'Junio', t: 'Desarrollo', d: 'Programamos la plataforma.' },
  { mes: 'Julio', t: 'Contenidos', d: 'Noticias, eventos, transporte, turismo y servicios.' },
  { mes: 'Agosto', t: 'Pruebas y mejoras', d: 'Corregimos errores y sumamos lo que pidieron los evaluadores de la instancia distrital.' },
]

const ESTADISTICAS = [
  { t: 'Opiniones positivas y felicitaciones', v: 98, color: C.verde },
  { t: 'Dijeron que sería útil para Baradero', v: 25, color: C.verde },
  { t: 'Destacaron el trabajo del equipo', v: 18, color: C.verde },
  { t: 'Expresaron ganas de que salga la app', v: 10, color: C.amarillo },
  { t: 'Sugirieron nuevas funciones', v: 2, color: C.amarillo },
  { t: 'Comentarios negativos', v: 0, color: C.linea },
]

// Comentarios públicos de vecinos en Facebook, tal como figuran en el
// informe. Se muestra solo el nombre y la inicial del apellido.
const OPINIONES = [
  ['Brenda V.', 'Felicitaciones, una aplicación que nos serviría muchísimo, no aflojen'],
  ['Fabiana L.', 'Qué lindo enterarse de las buenas cosas que aprenden y ponen en marcha para el bien de toda la comunidad'],
  ['María Paula M.', 'Me encantaría que salga esa aplicación, felicitaciones'],
  ['Débora G.', 'Felicitaciones, apoyemos esta iniciativa'],
  ['Emanuel C.', 'Fabuloso… mis felicitaciones a los chicos, excelente trabajo'],
  ['Sandra Q.', 'Me encanta, felicitaciones chicos, la Técnica siempre'],
]

const COSTOS_TECNOLOGIA = [
  ['Dominio y hosting', '24 meses', '$160.008'],
  ['Cuota de App Store', '24 meses', '$302.952'],
  ['Dominio .com', '1 registro', '$8.500'],
]

const COSTOS_FIJOS = [
  ['Alquiler', '$300.000'], ['Internet', '$50.000'], ['Electricidad', '$50.000'], ['Gas', '$5.000'],
  ['Claude', '$60.560'], ['Canva Pro', '$98.410'], ['CapCut', '$105.828,60'], ['GitHub', '$5.800'],
]

const ROLES = [
  { nombre: 'Stefania Figueredo', roles: 'Dirección general, coordinación, programación y desarrollo técnico' },
  { nombre: 'Wanda Garcia', roles: 'Diseño y comunicación, investigación' },
  { nombre: 'Celeste Weiss', roles: 'Contenido visual y difusión, producción audiovisual' },
  { nombre: 'Roman Van Loo', roles: 'Búsqueda y análisis de información, fotos, entrevistas y videos' },
]

const FUTURO = [
  { titulo: 'Turnos de salud', texto: 'Pedido por la comunidad: sacar turno sin ir “de gusto” hasta el hospital.' },
  { titulo: 'Turismo', texto: 'Dar más visibilidad a los atractivos de Baradero para vecinos y visitantes.' },
  { titulo: 'Alianzas', texto: 'Con comercios locales y el municipio, para sostener el proyecto en el tiempo.' },
]

// Encabezado de cada parte: ocupa una pantalla entera, para que cada
// integrante arranque su parte con un corte claro.
function PortadaParte({ parte }) {
  return (
    <Diapo id={parte.id} parte={parte.n} className="justify-center">
      <p className="text-xs uppercase" style={{ ...mono, color: C.suave }}>Parte {parte.n} de 04</p>
      <p className="pres-titulo mt-4 text-[96px] sm:text-[160px] leading-none tracking-[-0.06em]" style={{ color: C.elevado }}>{parte.n}</p>
      <h2 className="-mt-6 sm:-mt-10 text-[40px] sm:text-[64px] leading-none tracking-[-0.04em]">{parte.titulo}</h2>
      <p className="mt-5 text-lg max-w-xl" style={{ color: C.apagado }}>{parte.texto}</p>
      <div className="mt-10 h-px w-full max-w-md" style={{ background: C.linea }}>
        <div className="h-px" style={{ width: `${Number(parte.n) * 25}%`, background: C.amarillo }} />
      </div>
    </Diapo>
  )
}

// Cada pantalla de la presentación. En computadora ocupa el alto de la
// pantalla, para poder pasar de una a otra con el teclado.
function Diapo({ id, parte, className = '', children, ancho = true }) {
  return (
    <section
      id={id}
      data-diapo
      data-parte={parte}
      className={`scroll-mt-16 lg:min-h-[calc(100svh-4rem)] flex flex-col py-20 ${className}`}
    >
      <div data-aparecer className={ancho ? 'w-full max-w-[1200px] mx-auto px-4 sm:px-6' : 'w-full'}>
        {children}
      </div>
    </section>
  )
}

function Tarjeta({ children, className = '' }) {
  return <div className={`rounded-[10px] border p-6 ${className}`} style={{ borderColor: C.elevado }}>{children}</div>
}

function TarjetaClara({ children, className = '' }) {
  return <div className={`rounded-[20px] p-6 sm:p-10 ${className}`} style={{ background: C.hueso, color: '#0F1D17' }}>{children}</div>
}

function Mini({ titulo, children }) {
  return (
    <p className="border-t pt-4 text-sm" style={{ borderColor: C.linea, color: C.apagado }}>
      <span className="block text-xs uppercase mb-2" style={{ ...mono, color: C.suave }}>{titulo}</span>
      {children}
    </p>
  )
}

export default function Presentacion() {
  const raiz = useRef(null)
  const [actual, setActual] = useState({ i: 0, total: 1, parte: '01' })

  // Cada bloque marcado con data-aparecer sube suavemente al entrar en pantalla
  useEffect(() => {
    const bloques = raiz.current.querySelectorAll('[data-aparecer]')
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visto'); obs.unobserve(e.target) }
      })
    }, { threshold: 0.1 })
    bloques.forEach(b => obs.observe(b))
    return () => obs.disconnect()
  }, [])

  // Marca en qué pantalla estamos (para el contador de abajo)
  useEffect(() => {
    const diapos = [...raiz.current.querySelectorAll('[data-diapo]')]
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (e.isIntersecting) {
          const i = diapos.indexOf(e.target)
          setActual({ i, total: diapos.length, parte: e.target.dataset.parte })
        }
      })
    }, { rootMargin: '-45% 0px -45% 0px' })
    diapos.forEach(d => obs.observe(d))
    return () => obs.disconnect()
  }, [])

  // Para presentar: flechas, espacio y "avanzar página" (también los
  // punteros de presentación) pasan a la pantalla siguiente o anterior.
  useEffect(() => {
    const alTocar = e => {
      const adelante = ['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)
      const atras = ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)
      if (!adelante && !atras) return
      e.preventDefault()
      const diapos = [...raiz.current.querySelectorAll('[data-diapo]')]
      const tope = 64 + 4
      const destino = adelante
        ? diapos.find(d => d.getBoundingClientRect().top > tope)
        : [...diapos].reverse().find(d => d.getBoundingClientRect().top < -4)
      destino?.scrollIntoView({ behavior: 'smooth' })
    }
    window.addEventListener('keydown', alTocar)
    return () => window.removeEventListener('keydown', alTocar)
  }, [])

  // La letra de los rótulos se carga solo en esta página, para no sumarle peso a la app
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&display=swap'
    document.head.appendChild(link)
    return () => link.remove()
  }, [])

  return (
    <div
      ref={raiz}
      className="pres min-h-screen antialiased"
      style={{ background: C.fondo, color: C.hueso, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400 }}
    >
      <style>{ESTILOS}</style>

      {/* Barra de arriba */}
      <header className="sticky top-0 z-20 border-b" style={{ background: C.fondo, borderColor: C.elevado }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a href="#inicio" className="flex items-center gap-2.5">
            <img src="/logo-mibaradero.png" alt="" className="h-7 w-auto rounded-[3px] bg-white p-0.5" />
            <span className="pres-titulo text-base tracking-[-0.02em]">Mi Baradero</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm uppercase" style={{ color: C.apagado }}>
            {PARTES.map(p => (
              <a key={p.id} href={`#${p.id}`} className="flex items-center gap-2 hover:text-white transition-colors" style={actual.parte === p.n ? { color: C.hueso } : undefined}>
                <span className="text-xs" style={{ ...mono, color: actual.parte === p.n ? C.amarillo : C.linea }}>{p.n}</span>
                {p.titulo}
              </a>
            ))}
          </nav>
          <Link to="/" className={botonClaro}>Probar la app</Link>
        </div>
      </header>

      {/* Contador para quien presenta */}
      <div className="hidden lg:flex fixed bottom-5 right-5 z-20 items-center gap-3 rounded-[3px] border px-3 h-9 text-xs uppercase" style={{ ...mono, background: C.fondo, borderColor: C.elevado, color: C.apagado }}>
        <Punto vivo /> Parte {actual.parte}
        <span style={{ color: C.linea }}>|</span>
        {String(actual.i + 1).padStart(2, '0')} / {String(actual.total).padStart(2, '0')}
      </div>

      {/* ═════════════════ PARTE 01 · EL PROYECTO ═════════════════ */}

      {/* Portada */}
      <section id="inicio" data-diapo data-parte="01" className="lg:min-h-[calc(100svh-4rem)] flex flex-col justify-center">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-16 pb-16 grid lg:grid-cols-[1fr_1.15fr] gap-12 items-center">
          <div className="pres-entrar">
            <Rotulo>Una app para Baradero, hecha en Baradero</Rotulo>
            <h1 className="mt-6 text-[44px] sm:text-[60px] lg:text-[72px] leading-none tracking-[-0.04em]">
              Toda la ciudad en el celular de cada vecino
            </h1>
            <p className="mt-6 text-base leading-normal max-w-md" style={{ color: C.apagado }}>
              Mi Baradero junta la combi, la recolección de residuos, los eventos, los Puntos Verdes y los reclamos
              en un solo lugar. Y le da al municipio un panel para manejar cada servicio desde su área.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#indice" className={botonClaro}>Empezar <ArrowRight className="w-4 h-4" /></a>
              <Link to="/" className={botonFantasma}>Ver la app <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <p className="hidden lg:block mt-8 text-xs uppercase" style={{ ...mono, color: C.linea }}>Usá las flechas del teclado para avanzar</p>
          </div>
          <div className="relative pb-24 sm:pb-0 sm:pr-28 lg:pr-32">
            <div className="pres-ventana" style={{ animationDelay: '.15s' }}><VentanaPanel /></div>
            <div className="pres-ventana absolute right-0 bottom-0 sm:-bottom-16 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 w-max" style={{ animationDelay: '.45s' }}>
              <Celular />
            </div>
          </div>
        </div>

        {/* Cinta con los servicios, pasando despacio */}
        <div className="border-y overflow-hidden mt-8 sm:mt-16" style={{ borderColor: C.elevado }}>
          <div className="pres-cinta flex w-max">
            {[0, 1].map(vuelta => (
              <div key={vuelta} className="flex shrink-0" aria-hidden={vuelta === 1}>
                {['Combi Municipal', 'Mi Pase con QR', 'Residuos · Tu zona', 'Eventos', 'Noticias', 'Puntos Verdes', 'Reclamos con código', 'Sin conexión', 'Lector de voz', 'Panel por sector'].map((t, i) => (
                  <span key={t} className="flex items-center gap-3 px-8 py-6 text-sm uppercase whitespace-nowrap" style={{ ...mono, color: C.apagado }}>
                    <Punto color={i % 2 ? C.verde : C.amarillo} /> {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Índice */}
      <Diapo id="indice" parte="01" className="justify-center">
        <Titulo rotulo="Lo que vamos a contar" titulo="Cuatro partes, una app" texto="Cada parte la cuenta un integrante del equipo." />
        <ol className="mt-12 border-t" style={{ borderColor: C.elevado }}>
          {PARTES.map(p => (
            <li key={p.id}>
              <a href={`#${p.id}`} className="group grid grid-cols-[56px_1fr] sm:grid-cols-[96px_1fr_auto] items-center gap-4 py-6 border-b transition-colors" style={{ borderColor: C.elevado }}>
                <span className="text-sm" style={{ ...mono, color: C.amarillo }}>{p.n}</span>
                <span>
                  <span className="pres-titulo block text-2xl sm:text-[32px] tracking-[-0.03em] group-hover:text-white">{p.titulo}</span>
                  <span className="block mt-1 text-sm" style={{ color: C.apagado }}>{p.texto}</span>
                </span>
                <ArrowRight className="hidden sm:block w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: C.linea }} />
              </a>
            </li>
          ))}
        </ol>
      </Diapo>

      <PortadaParte parte={PARTES[0]} />

      {/* Un día en Baradero */}
      <Diapo parte="01">
        <Titulo
          rotulo="Un día cualquiera"
          titulo="Cuatro preguntas que se hace cualquier vecino"
          texto="Son cosas simples, pero hoy cada una tiene su propio camino para encontrar la respuesta."
        />
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {SITUACIONES.map(({ pregunta, donde, Icon }, i) => (
            <Tarjeta key={pregunta} className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ ...mono, color: C.suave }}>0{i + 1}</span>
                <Icon className="w-5 h-5" style={{ color: C.amarillo }} />
              </div>
              <p className="pres-titulo mt-6 text-[22px] sm:text-2xl leading-snug tracking-[-0.02em]">“{pregunta}”</p>
              <p className="mt-6 pt-4 border-t flex items-center gap-2 text-xs uppercase" style={{ ...mono, borderColor: C.elevado, color: C.verde }}>
                <Punto color={C.verde} /> {donde}
              </p>
            </Tarjeta>
          ))}
        </div>
      </Diapo>

      {/* El problema */}
      <Diapo parte="01" className="justify-center">
        <TarjetaClara className="grid lg:grid-cols-2 gap-10">
          <div>
            <Rotulo oscuro>El problema</Rotulo>
            <h2 className="mt-4 text-[32px] sm:text-[44px] leading-[1.1] tracking-[-0.025em]">Hoy la información está repartida</h2>
            <p className="mt-4 text-base leading-normal text-[#3E5A4C]">
              Para saber a qué hora pasa la combi, qué día se saca el reciclable o cómo hacer un reclamo,
              el vecino tiene que buscar en carteles, redes o llamar por teléfono. Y del lado del municipio,
              cada área avisa por su cuenta y los pedidos de los vecinos se pueden perder.
            </p>
          </div>
          <div>
            <Rotulo oscuro color={C.verde}>Con Mi Baradero</Rotulo>
            <ul className="mt-4">
              {[
                'Todo en una sola dirección: mi-baradero.web.app',
                'Cada área del municipio actualiza lo suyo',
                'El vecino ve los cambios en el momento',
                'Los reclamos quedan registrados, con código y respuesta',
              ].map((t, i) => (
                <li key={t} className="flex gap-4 py-3.5 border-b border-[#0F1D17]/15 text-base">
                  <span className="text-xs pt-1 text-[#8FA89B]" style={mono}>0{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </TarjetaClara>
      </Diapo>

      {/* Dónde está hoy la información */}
      <Diapo parte="01" className="justify-center">
        <Titulo
          rotulo="Lo que investigamos"
          titulo="Cinco lugares distintos para buscar lo mismo"
          texto="Durante la investigación vimos que la información de Baradero está repartida en todos estos canales. Algunas novedades no llegan a todos, o llegan tarde."
        />
        <div className="mt-12 grid sm:grid-cols-5 border rounded-[10px] overflow-hidden" style={{ borderColor: C.elevado }}>
          {CANALES_HOY.map((c, i) => (
            <div key={c} className="p-6 border-b sm:border-b-0 sm:border-r last:border-r-0" style={{ borderColor: C.elevado }}>
              <p className="text-xs" style={{ ...mono, color: C.amarillo }}>0{i + 1}</p>
              <p className="pres-titulo mt-8 text-lg leading-snug">{c}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 flex items-center gap-3 text-base" style={{ color: C.suave }}>
          <ArrowRight className="w-5 h-5 shrink-0" style={{ color: C.verde }} />
          Mi Baradero los junta en uno solo.
        </p>
      </Diapo>

      {/* Objetivos */}
      <Diapo parte="01" className="justify-center">
        <Titulo rotulo="Nuestra idea" color={C.verde} titulo="Tres objetivos" texto="Todo lo que tiene la app sale de alguno de estos tres." />
        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          {OBJETIVOS.map(({ titulo, texto }, i) => (
            <div key={titulo} className="border-t pt-6" style={{ borderColor: i === 0 ? C.amarillo : C.linea }}>
              <p className="text-xs" style={{ ...mono, color: C.suave }}>OBJETIVO 0{i + 1}</p>
              <p className="pres-titulo mt-4 text-[40px] leading-none tracking-[-0.04em]">{titulo}</p>
              <p className="mt-4 text-base leading-normal" style={{ color: C.apagado }}>{texto}</p>
            </div>
          ))}
        </div>
      </Diapo>

      {/* Hipótesis */}
      <Diapo parte="01" className="justify-center">
        <p className="text-xs uppercase" style={{ ...mono, color: C.suave }}>Nuestra hipótesis</p>
        <p className="pres-titulo mt-8 text-[32px] sm:text-[52px] leading-[1.1] tracking-[-0.035em] max-w-5xl">
          “Reunir toda la información relevante de Baradero en una única plataforma digital
          <span style={{ color: C.verde }}> facilitará el acceso de los vecinos</span> a la información y a los servicios de la ciudad.”
        </p>
        <div className="mt-12 grid sm:grid-cols-2 gap-6 max-w-4xl">
          <Mini titulo="Ciudades inteligentes">Usan la tecnología para mejorar la vida de sus habitantes y conectar a los vecinos con su comunidad.</Mini>
          <Mini titulo="Gobierno digital">Brinda servicios públicos de forma más accesible, rápida y transparente, sin depender solo de los medios de siempre.</Mini>
        </div>
      </Diapo>

      {/* Cómo lo hicimos */}
      <Diapo parte="01">
        <Titulo rotulo="Cómo lo hicimos" color={C.verde} titulo="De marzo a agosto, paso a paso" texto="Organizamos el proyecto con una planificación mensual." />
        <ol className="mt-12 relative">
          <span className="hidden lg:block absolute left-0 right-0 top-[7px] h-px" style={{ background: C.linea }} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-5">
            {ITINERARIO.map(({ mes, t, d }, i) => (
              <li key={mes} className="relative">
                <span className="block w-[15px] h-[15px] rounded-full border-2" style={{ borderColor: i === ITINERARIO.length - 1 ? C.amarillo : C.verde, background: C.fondo }} />
                <p className="mt-5 text-xs uppercase" style={{ ...mono, color: C.suave }}>{mes}</p>
                <p className="pres-titulo mt-2 text-base">{t}</p>
                <p className="mt-2 text-sm" style={{ color: C.apagado }}>{d}</p>
              </li>
            ))}
          </div>
        </ol>
        <div className="mt-12 rounded-[10px] border p-5 flex flex-wrap items-center gap-x-6 gap-y-2" style={{ borderColor: C.linea }}>
          <span className="flex items-center gap-2 text-xs uppercase" style={{ ...mono, color: C.amarillo }}><Punto vivo /> Feria Provincial de Ciencias 2026</span>
          <span className="text-sm" style={{ color: C.suave }}>7° 4ta Programación · Modalidad técnico profesional · Área tecnología y aplicaciones web</span>
        </div>
      </Diapo>

      {/* ═════════════════ PARTE 02 · PARA EL VECINO ═════════════════ */}

      <PortadaParte parte={PARTES[1]} />

      {/* Hoy en Baradero */}
      <Diapo parte="02">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
          <div>
            <Titulo
              rotulo="La portada"
              color={C.verde}
              titulo="Lo primero que ve: Hoy en Baradero"
              texto="Al abrir la app, el vecino ya ve la próxima combi y qué residuo se recolecta hoy en su zona. Después, las últimas noticias y los eventos."
            />
            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              <Mini titulo="Buscador">Escribe lo que necesita y la app lo lleva a esa sección.</Mini>
              <Mini titulo="Atajos">Los servicios más usados, a un toque.</Mini>
              <Mini titulo="Sin cuenta">Se puede usar sin registrarse. La cuenta es opcional.</Mini>
              <Mini titulo="Mi Perfil">Si quiere, entra con Google o email y guarda sus datos.</Mini>
            </div>
          </div>
          <div className="flex justify-center"><Celular /></div>
        </div>
      </Diapo>

      {/* Servicios */}
      <Diapo parte="02">
        <Titulo rotulo="Los servicios" color={C.verde} titulo="Seis secciones, todo en un lugar" />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICIOS.map(({ Icon, titulo, texto }) => (
            <Tarjeta key={titulo}>
              <Icon className="w-5 h-5" style={{ color: C.verde }} />
              <p className="pres-titulo mt-5 text-base" style={{ color: C.hueso }}>{titulo}</p>
              <p className="mt-2 text-sm leading-[1.43]" style={{ color: C.apagado }}>{texto}</p>
            </Tarjeta>
          ))}
        </div>
      </Diapo>

      {/* Combi */}
      <Diapo parte="02">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
          <Titulo
            rotulo="Combi Municipal"
            titulo="La combi, al día"
            texto="La ruta Alsina · Portela · Baradero, con todo lo que el pasajero necesita saber antes de salir de su casa."
          />
          <div className="rounded-[10px] border overflow-hidden" style={{ borderColor: C.elevado }}>
            {[
              { Icon: Clock, t: 'Horarios', d: 'Salida y llegada de cada viaje, cargados por el sector Combi.' },
              { Icon: Bell, t: 'Alertas y demoras', d: 'Si hay un cambio, aparece arriba de todo apenas lo cargan.' },
              { Icon: MapPin, t: 'Dónde está la combi', d: 'La última parada que marcó un empleado. Si nadie la marcó, se muestra un recorrido estimado y lo dice.' },
              { Icon: Ticket, t: 'Mi Pase', d: 'El pasaje desde el celular, con código QR.' },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="flex gap-4 p-5 border-b last:border-b-0" style={{ borderColor: C.elevado }}>
                <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: C.amarillo }} />
                <div>
                  <p className="pres-titulo">{t}</p>
                  <p className="mt-1 text-sm" style={{ color: C.apagado }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Diapo>

      {/* Mi Pase: pasos */}
      <Diapo parte="02">
        <Titulo
          rotulo="Mi Pase · cómo funciona"
          titulo="El pasaje de la combi, sin papel"
          texto="Se paga por transferencia (mandando el comprobante por WhatsApp) o en efectivo en el Centro Operativo Baradero I y en las delegaciones de Alsina y Portela."
        />
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 border rounded-[10px] overflow-hidden" style={{ borderColor: C.elevado }}>
          {PASOS_PASE.map(({ Icon, titulo, texto }, i) => (
            <li key={titulo} className="p-6 border-b sm:border-b-0 lg:border-r last:border-r-0" style={{ borderColor: C.elevado }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ ...mono, color: C.suave }}>PASO 0{i + 1}</span>
                <Icon className="w-5 h-5" style={{ color: i === 3 ? C.verde : C.amarillo }} />
              </div>
              {i === 3 && (
                <div className="relative mt-6 w-20 h-20 p-2 rounded-[3px]" style={{ background: C.hueso }}>
                  <QRCodeSVG value={URL_APP} size={64} bgColor="#F1F6F3" fgColor="#0F1D17" />
                  <span className="pres-escaneo absolute left-0 right-0 h-px" style={{ background: C.amarillo, boxShadow: `0 0 8px ${C.amarillo}` }} />
                </div>
              )}
              <p className="pres-titulo mt-8 text-base">{titulo}</p>
              <p className="mt-2 text-sm leading-[1.43]" style={{ color: C.apagado }}>{texto}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 grid sm:grid-cols-3 gap-6">
          <Mini titulo="Un solo uso">El QR se marca como usado al escanearlo y no sirve más.</Mini>
          <Mini titulo="Cierre de venta">La venta de cada viaje cierra 10 minutos antes de la salida.</Mini>
          <Mini titulo="Una sola vez">El documento de descuento se verifica una vez y queda guardado.</Mini>
        </div>
      </Diapo>

      {/* Mi Pase: categorías */}
      <Diapo parte="02" className="justify-center">
        <TarjetaClara>
          <Rotulo oscuro color={C.verde}>Mi Pase · categorías</Rotulo>
          <h2 className="mt-4 text-[32px] sm:text-[44px] leading-[1.1] tracking-[-0.025em]">Un pasaje justo para cada uno</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="text-xs uppercase text-[#8FA89B]" style={mono}>
                  <th className="py-3 font-normal">Categoría</th>
                  <th className="py-3 font-normal">Tarifa</th>
                  <th className="py-3 font-normal">Qué presenta</th>
                  <th className="py-3 font-normal">Prioridad de asiento</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIAS_PASE.map(c => (
                  <tr key={c.nombre} className="border-t border-[#0F1D17]/15">
                    <td className="pres-titulo py-4 text-lg">{c.nombre}</td>
                    <td className="py-4">{c.tarifa}</td>
                    <td className="py-4 text-[#3E5A4C]">{c.doc}</td>
                    <td className="py-4">{c.prioridad ? <Check className="w-5 h-5 text-[#3D8B68]" /> : <span className="text-[#8FA89B]">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TarjetaClara>
      </Diapo>

      {/* Residuos */}
      <Diapo parte="02">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
          <div>
            <Titulo
              rotulo="Residuos"
              color={C.verde}
              titulo="Qué sacar, qué día y en qué zona"
              texto="El vecino elige su zona una vez y la app le dice qué se recolecta hoy y si el camión ya pasó."
            />
            <div className="mt-10 rounded-[10px] border p-5" style={{ borderColor: C.linea }}>
              <p className="flex items-center gap-2 text-xs uppercase" style={{ ...mono, color: C.amarillo }}><Punto /> Dato honesto</p>
              <p className="mt-3 text-sm" style={{ color: C.suave }}>
                El camión no tiene GPS. Por eso la app muestra el horario estimado de cada zona, y lo aclara.
                No inventamos ubicaciones.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { Icon: CalendarDays, t: 'Calendario semanal', d: 'Qué tipo de residuo corresponde a cada día.' },
              { Icon: MapPin, t: 'Tu zona', d: 'El horario de recolección de tu barrio y si hoy ya pasó.' },
              { Icon: Truck, t: 'Estado del camión', d: 'En servicio, fuera de servicio o en depósito, cargado por el sector.' },
              { Icon: Leaf, t: 'Consejos', d: 'Separar en origen, horario para sacar las bolsas y más.' },
            ].map(({ Icon, t, d }) => (
              <Tarjeta key={t}>
                <Icon className="w-5 h-5" style={{ color: C.verde }} />
                <p className="pres-titulo mt-5">{t}</p>
                <p className="mt-2 text-sm" style={{ color: C.apagado }}>{d}</p>
              </Tarjeta>
            ))}
          </div>
        </div>
      </Diapo>

      {/* Eventos + Puntos Verdes */}
      <Diapo parte="02">
        <div className="grid lg:grid-cols-2 gap-6">
          <Tarjeta className="sm:p-8">
            <Rotulo>Eventos y noticias</Rotulo>
            <p className="pres-titulo mt-5 text-[28px] sm:text-[32px] leading-tight tracking-[-0.03em]">La agenda de la ciudad</p>
            <ul className="mt-6 space-y-4 text-sm" style={{ color: C.apagado }}>
              <li className="flex gap-3"><CalendarDays className="w-5 h-5 shrink-0" style={{ color: C.amarillo }} /> Los eventos de Baradero con foto, lugar y fecha.</li>
              <li className="flex gap-3"><Newspaper className="w-5 h-5 shrink-0" style={{ color: C.amarillo }} /> Noticias que publica el municipio desde el panel.</li>
              <li className="flex gap-3"><Bell className="w-5 h-5 shrink-0" style={{ color: C.amarillo }} /> “Agregar a mi calendario” para que el celular le recuerde.</li>
            </ul>
            <div className="mt-8 grid grid-cols-3 gap-2">
              {['festival-baradero', 'feria-artesanos', 'fiesta-primavera'].map(f => (
                <img key={f} src={`/eventos/${f}.jpg`} alt="" className="aspect-[4/3] w-full object-cover rounded-[3px]" />
              ))}
            </div>
          </Tarjeta>
          <Tarjeta className="sm:p-8">
            <Rotulo color={C.verde}>Puntos Verdes</Rotulo>
            <p className="pres-titulo mt-5 text-[28px] sm:text-[32px] leading-tight tracking-[-0.03em]">Reciclar es más fácil si sabés dónde</p>
            <ul className="mt-6 space-y-4 text-sm" style={{ color: C.apagado }}>
              <li className="flex gap-3"><MapIcon className="w-5 h-5 shrink-0" style={{ color: C.verde }} /> Mapa real de la ciudad, de OpenStreetMap.</li>
              <li className="flex gap-3"><Recycle className="w-5 h-5 shrink-0" style={{ color: C.verde }} /> Qué materiales recibe cada punto.</li>
              <li className="flex gap-3"><MapPin className="w-5 h-5 shrink-0" style={{ color: C.verde }} /> “Cómo llegar”, que abre el recorrido en el celular.</li>
            </ul>
            <div className="mt-8 relative h-[118px] rounded-[3px] overflow-hidden" style={{ background: '#0B1612' }}>
              {/* Dibujo de mapa: calles en grilla y puntos */}
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: `linear-gradient(${C.elevado} 1px, transparent 1px), linear-gradient(90deg, ${C.elevado} 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
              {[[18, 30], [46, 62], [70, 28], [84, 70]].map(([x, y], i) => (
                <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                  <span className="block w-3 h-3 rounded-full pres-pulso-verde" style={{ background: C.verde, animationDelay: `${i * 0.4}s` }} />
                </span>
              ))}
            </div>
          </Tarjeta>
        </div>
      </Diapo>

      {/* ═════════════════ PARTE 03 · PARTICIPAR E INCLUIR ═════════════════ */}

      <PortadaParte parte={PARTES[2]} />

      {/* Reclamos */}
      <Diapo parte="03">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
          <div>
            <Titulo
              rotulo="Reclamos y sugerencias"
              titulo="Que la voz del vecino llegue a quien corresponde"
              texto="No es solo para quejarse: también se puede sugerir o felicitar. El tema que elige el vecino define a qué departamento llega."
            />
            <div className="mt-10 grid grid-cols-2 gap-3">
              {TIPOS_RECLAMO.map(({ Icon, nombre, texto }) => (
                <div key={nombre} className="rounded-[10px] border p-4" style={{ borderColor: C.elevado }}>
                  <Icon className="w-5 h-5" style={{ color: C.amarillo }} />
                  <p className="pres-titulo mt-3">{nombre}</p>
                  <p className="mt-1 text-xs" style={{ color: C.apagado }}>{texto}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase" style={{ ...mono, color: C.suave }}>Departamentos que reciben reclamos</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {DEPARTAMENTOS.map(d => (
                <span key={d} className="text-sm px-3 py-2 border rounded-[3px]" style={{ borderColor: C.linea }}>{d}</span>
              ))}
            </div>
            <p className="mt-10 text-xs uppercase" style={{ ...mono, color: C.suave }}>Estados del reclamo</p>
            <div className="mt-4 grid grid-cols-3 border rounded-[10px] overflow-hidden" style={{ borderColor: C.elevado }}>
              {[['Recibido', C.amarillo], ['En proceso', C.suave], ['Resuelto', C.verde]].map(([e, col], i) => (
                <div key={e} className="p-4 border-r last:border-r-0" style={{ borderColor: C.elevado }}>
                  <p className="text-xs" style={{ ...mono, color: C.linea }}>0{i + 1}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm"><Punto color={col} /> {e}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between gap-3 border rounded-[3px] px-4 h-12" style={{ borderColor: C.linea }}>
              <span className="text-xs uppercase" style={{ ...mono, color: C.suave }}>Código de seguimiento</span>
              <span style={{ ...mono, color: C.hueso }}>#K3F9QA</span>
            </div>
          </div>
        </div>
      </Diapo>

      {/* Un reclamo de punta a punta */}
      <Diapo parte="03" className="justify-center">
        <Titulo rotulo="Ejemplo" color={C.verde} titulo="Un reclamo, de punta a punta" texto="Así viaja un pedido desde el celular del vecino hasta el municipio, y vuelta." />
        <ol className="mt-12 relative">
          <span className="hidden lg:block absolute left-0 right-0 top-[7px] h-px" style={{ background: C.linea }} />
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-6">
            {RECLAMO_PUNTA_A_PUNTA.map(({ quien, texto }, i) => (
              <li key={i} className="relative">
                <span className="block w-[15px] h-[15px] rounded-full border-2" style={{ borderColor: quien === 'Municipio' ? C.amarillo : C.verde, background: C.fondo }} />
                <p className="mt-5 text-xs uppercase" style={{ ...mono, color: quien === 'Municipio' ? C.amarillo : C.verde }}>0{i + 1} · {quien}</p>
                <p className="mt-3 text-base leading-normal">{texto}</p>
              </li>
            ))}
          </div>
        </ol>
      </Diapo>

      {/* Accesibilidad */}
      <Diapo parte="03">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <Titulo
              rotulo="Accesibilidad"
              color={C.verde}
              titulo="Pensada para todos los vecinos"
              texto="Mucha gente grande o con poca vista también necesita los horarios y los servicios. La app se adapta a cada persona."
            />
            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {[
                { Icon: Type, t: 'Tamaño de letra', d: 'Se agranda toda la app, no solo una parte.' },
                { Icon: Moon, t: 'Modo oscuro', d: 'Para leer mejor de noche o con la vista cansada.' },
                { Icon: Volume2, t: 'Lector de voz', d: 'La app lee en voz alta lo que hay en pantalla.' },
                { Icon: Mic, t: 'Hablarle a la app', d: 'Dice “combi” o “reclamos” y la app lo lleva ahí.' },
              ].map(({ Icon, t, d }) => (
                <div key={t} className="flex gap-4">
                  <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: C.verde }} />
                  <div>
                    <p className="pres-titulo">{t}</p>
                    <p className="mt-1 text-sm" style={{ color: C.apagado }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TarjetaClara className="flex flex-col items-center text-center">
            <img src="/tachin.png" alt="Tachín, la mascota de Mi Baradero" className="w-36 h-36 object-contain pres-flotar" />
            <p className="pres-titulo mt-4 text-[28px] tracking-[-0.03em]">Tachín</p>
            <p className="mt-2 text-[#3E5A4C] max-w-xs">
              La mascota que recorre la app con el vecino y le muestra, paso a paso y con palabras simples, cómo se usa cada sección.
            </p>
          </TarjetaClara>
        </div>
      </Diapo>

      {/* Panel del municipio */}
      <Diapo id="municipio" parte="03">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <Titulo
            rotulo="Para el municipio"
            titulo="Un panel para cada área"
            texto="Cada trabajador entra con su cuenta y ve solo lo de su sector. No hace falta saber programar: se carga como un formulario, y el vecino lo ve al instante."
          />
          <VentanaPanel />
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTORES.map(({ titulo, texto }) => (
            <Tarjeta key={titulo}>
              <p className="flex items-center gap-2 text-xs uppercase" style={{ ...mono, color: C.suave }}><Punto /> Sector</p>
              <p className="pres-titulo mt-4 text-xl tracking-[-0.02em]">{titulo}</p>
              <p className="mt-2 text-sm leading-[1.43]" style={{ color: C.apagado }}>{texto}</p>
            </Tarjeta>
          ))}
        </div>
        <div className="mt-6 grid sm:grid-cols-3 gap-6">
          <Mini titulo="Administrador">Crea las cuentas de los trabajadores y ve la lista de vecinos.</Mini>
          <Mini titulo="Historial">Registro de actividad: quién cambió qué y cuándo.</Mini>
          <Mini titulo="Buscar por código">Atención al Vecino encuentra cualquier reclamo con su código.</Mini>
        </div>
      </Diapo>

            {/* Instalable y sin conexión */}
      <Diapo parte="03">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <Titulo
              rotulo="Instalable"
              titulo="Se instala sin pasar por ninguna tienda"
              texto="Es una página web que se instala en el celular como cualquier app. No ocupa casi lugar y siempre está actualizada."
            />
            <ol className="mt-10 border-t" style={{ borderColor: C.elevado }}>
              {['Entrar a mi-baradero.web.app', 'Tocar “Agregar a la pantalla de inicio”', 'Listo: queda el ícono como una app más'].map((t, i) => (
                <li key={t} className="flex gap-5 py-4 border-b" style={{ borderColor: C.elevado }}>
                  <span className="text-xs pt-1" style={{ ...mono, color: C.amarillo }}>0{i + 1}</span> {t}
                </li>
              ))}
            </ol>
          </div>
          <TarjetaClara>
            <WifiOff className="w-6 h-6 text-[#3D8B68]" />
            <h3 className="pres-titulo mt-5 text-[28px] sm:text-[32px] leading-tight tracking-[-0.03em]">Funciona sin internet</h3>
            <p className="mt-3 text-[#3E5A4C]">Lo que el vecino ya vio queda guardado en el celular. Si se queda sin señal, igual puede abrir:</p>
            <ul className="mt-6">
              {['Los horarios de la combi', 'El calendario de residuos', 'Los eventos', 'Su pase con el código QR'].map(t => (
                <li key={t} className="flex gap-3 py-3 border-t border-[#0F1D17]/15"><Check className="w-5 h-5 text-[#3D8B68]" /> {t}</li>
              ))}
            </ul>
          </TarjetaClara>
        </div>
      </Diapo>

      {/* Seguridad y datos honestos */}
      <Diapo parte="03">
        <Titulo rotulo="Confianza" color={C.verde} titulo="Datos cuidados y datos honestos" />
        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <Tarjeta className="sm:p-8">
            <ShieldCheck className="w-6 h-6" style={{ color: C.verde }} />
            <p className="pres-titulo mt-5 text-2xl tracking-[-0.02em]">Cada uno ve solo lo suyo</p>
            <ul className="mt-6 space-y-4 text-sm" style={{ color: C.apagado }}>
              <li className="flex gap-3"><Lock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.verde }} /> Los pases y reclamos de un vecino solo los ve él y el sector que los atiende.</li>
              <li className="flex gap-3"><Lock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.verde }} /> Cada sector solo puede cambiar lo de su área.</li>
              <li className="flex gap-3"><Lock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.verde }} /> El importe del pasaje lo controla el sistema: no se puede cambiar desde el celular.</li>
              <li className="flex gap-3"><Lock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.verde }} /> El sector solo puede cambiar el estado, la respuesta y el departamento de un reclamo.</li>
            </ul>
          </Tarjeta>
          <Tarjeta className="sm:p-8">
            <Check className="w-6 h-6" style={{ color: C.amarillo }} />
            <p className="pres-titulo mt-5 text-2xl tracking-[-0.02em]">No inventamos datos</p>
            <ul className="mt-6 space-y-4 text-sm" style={{ color: C.apagado }}>
              <li className="flex gap-3"><Punto /> El camión de residuos no tiene GPS: se muestra el horario estimado y se aclara.</li>
              <li className="flex gap-3"><Punto /> La posición de la combi es la última parada que marcó un empleado. Si no hay, se avisa que es estimada.</li>
              <li className="flex gap-3"><Punto /> Un Punto Verde que no se pudo ubicar no aparece en el mapa hasta que se carguen sus coordenadas.</li>
            </ul>
          </Tarjeta>
        </div>
      </Diapo>

      {/* Con qué está hecha */}
      <Diapo parte="03">
        <Titulo rotulo="Por dentro" titulo="Con qué está hecha" texto="Usamos herramientas modernas y conocidas, explicadas en simple." />
        <div className="mt-12 rounded-[10px] border overflow-hidden" style={{ borderColor: C.elevado }}>
          {[
            ['React y Vite', 'Para armar las pantallas de la app y que cargue rápido.'],
            ['Tailwind CSS', 'Para los colores, letras y que se vea bien en celular y computadora.'],
            ['Firebase', 'De Google: guarda los datos, maneja las cuentas y publica la app.'],
            ['OpenStreetMap y Leaflet', 'El mapa real de los Puntos Verdes.'],
            ['Modo app (PWA)', 'Para instalarla en el celular y usarla sin internet.'],
            ['Lector de QR', 'Para que el chofer escanee el pase con su propio celular.'],
          ].map(([t, d]) => (
            <div key={t} className="grid sm:grid-cols-[280px_1fr] gap-1 sm:gap-6 p-5 border-b last:border-b-0" style={{ borderColor: C.elevado }}>
              <p className="pres-titulo">{t}</p>
              <p className="text-sm" style={{ color: C.apagado }}>{d}</p>
            </div>
          ))}
        </div>
      </Diapo>

      {/* ═════════════════ PARTE 04 · POR QUÉ MI BARADERO ═════════════════ */}

      <PortadaParte parte={PARTES[3]} />

      {/* La comunidad: números */}
      <Diapo parte="04">
        <Titulo
          rotulo="La respuesta de la comunidad"
          color={C.verde}
          titulo="Baradero ya la está esperando"
          texto="Publicamos el proyecto en redes y analizamos todos los comentarios que dejaron los vecinos."
        />
        <div className="mt-12 grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div className="grid grid-cols-2 gap-6">
            {[['225', 'reacciones'], ['23', 'veces compartida'], ['98%', 'comentarios positivos'], ['0%', 'comentarios negativos']].map(([v, t], i) => (
              <div key={t} className="border-t pt-5" style={{ borderColor: i === 2 ? C.verde : C.linea }}>
                <p className="pres-titulo text-[48px] sm:text-[64px] leading-none tracking-[-0.05em]">{v}</p>
                <p className="mt-3 text-xs uppercase" style={{ ...mono, color: C.suave }}>{t}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs uppercase" style={{ ...mono, color: C.suave }}>Qué dijeron en los comentarios</p>
            <ul className="mt-6 space-y-5">
              {ESTADISTICAS.map(({ t, v, color }) => (
                <li key={t}>
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span>{t}</span>
                    <span style={{ ...mono, color: C.hueso }}>{v}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-[2px]" style={{ background: C.elevado }}>
                    <div className="pres-barra h-2 rounded-[2px]" style={{ '--ancho': `${Math.max(v, 0.5)}%`, background: color }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs" style={{ color: C.apagado }}>Fuente: análisis de comentarios en redes sociales, informe del proyecto (Feria Provincial de Ciencias 2026).</p>
          </div>
        </div>
      </Diapo>

      {/* La comunidad: opiniones */}
      <Diapo parte="04">
        <Titulo rotulo="En palabras de los vecinos" titulo="Lo que nos escribieron" />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {OPINIONES.map(([quien, texto], i) => (
            <figure key={quien} className={`rounded-[10px] p-6 flex flex-col justify-between ${i === 0 ? '' : 'border'}`} style={i === 0 ? { background: C.hueso, color: '#0F1D17' } : { borderColor: C.elevado }}>
              <blockquote className="pres-titulo text-lg leading-snug tracking-[-0.01em]">“{texto}”</blockquote>
              <figcaption className="mt-6 text-xs uppercase" style={{ ...mono, color: i === 0 ? '#3E5A4C' : C.suave }}>{quien} · Facebook</figcaption>
            </figure>
          ))}
        </div>
      </Diapo>

      {/* Medios + sugerencia */}
      <Diapo parte="04" className="justify-center">
        <div className="grid lg:grid-cols-2 gap-6">
          <Tarjeta className="sm:p-8">
            <Rotulo>Más allá de Facebook</Rotulo>
            <p className="pres-titulo mt-5 text-[28px] sm:text-[32px] leading-tight tracking-[-0.03em]">Salimos en los medios locales</p>
            <ul className="mt-8 border-t" style={{ borderColor: C.elevado }}>
              {[['Th Producciones', 'Reel sobre el proyecto'], ['#TúRadio', 'Publicación radial: desarrollado por estudiantes de 7° 4ta Programación']].map(([m, d]) => (
                <li key={m} className="py-4 border-b" style={{ borderColor: C.elevado }}>
                  <p className="pres-titulo">{m}</p>
                  <p className="mt-1 text-sm" style={{ color: C.apagado }}>{d}</p>
                </li>
              ))}
            </ul>
          </Tarjeta>
          <TarjetaClara>
            <Rotulo oscuro>Sugerencia destacada · 10 “me gusta”</Rotulo>
            <p className="pres-titulo mt-6 text-[22px] sm:text-[26px] leading-snug tracking-[-0.02em]">
              “Estaría bueno que en esta aplicación entre lo que es salud para sacar turno, así la gente no va de gusto hasta el hospital.”
            </p>
            <p className="mt-6 text-xs uppercase text-[#3E5A4C]" style={mono}>Silvina M. · Facebook</p>
            <p className="mt-6 pt-5 border-t border-[#0F1D17]/15 text-[#3E5A4C]">La tomamos como la próxima función a sumar.</p>
          </TarjetaClara>
        </div>
      </Diapo>

      {/* Antes y después */}
      <Diapo parte="04" className="justify-center">
        <TarjetaClara>
          <Rotulo oscuro>Antes y después</Rotulo>
          <h2 className="mt-4 text-[32px] sm:text-[44px] leading-[1.1] tracking-[-0.025em]">Lo que cambia para Baradero</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="text-xs uppercase text-[#8FA89B]" style={mono}>
                  <th className="py-3 font-normal w-1/4">Tema</th>
                  <th className="py-3 font-normal">Hoy</th>
                  <th className="py-3 font-normal">Con Mi Baradero</th>
                </tr>
              </thead>
              <tbody>
                {ANTES_DESPUES.map(([tema, antes, despues]) => (
                  <tr key={tema} className="border-t border-[#0F1D17]/15">
                    <td className="pres-titulo py-4">{tema}</td>
                    <td className="py-4 text-[#8FA89B]">{antes}</td>
                    <td className="py-4"><span className="inline-flex gap-2"><Check className="w-5 h-5 shrink-0 text-[#3D8B68]" /> {despues}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TarjetaClara>
      </Diapo>

      {/* Costos */}
      <Diapo parte="04">
        <Titulo
          rotulo="Estructura de costos"
          titulo="Cuánto cuesta hacerla y mantenerla"
          texto="Calculamos lo que cuesta de verdad desarrollar y sostener Mi Baradero, para llegar a un precio de venta justo."
        />
        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          <Tarjeta>
            <p className="text-xs uppercase" style={{ ...mono, color: C.suave }}>Tecnología · app y web</p>
            <ul className="mt-5 text-sm">
              {COSTOS_TECNOLOGIA.map(([t, c, v]) => (
                <li key={t} className="flex justify-between gap-3 py-2.5 border-b" style={{ borderColor: C.elevado }}>
                  <span>{t} <span style={{ color: C.apagado }}>· {c}</span></span><span style={mono}>{v}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between text-sm"><span style={{ color: C.suave }}>Subtotal</span><span className="pres-titulo">$471.460</span></p>
          </Tarjeta>
          <Tarjeta>
            <p className="text-xs uppercase" style={{ ...mono, color: C.suave }}>Mano de obra</p>
            <p className="pres-titulo mt-5 text-[44px] leading-none tracking-[-0.04em]">250 h</p>
            <p className="mt-3 text-sm" style={{ color: C.apagado }}>De programación, diseño, investigación y desarrollo, a $15.000 la hora (programador junior freelance en Argentina).</p>
            <p className="mt-4 pt-4 border-t flex justify-between text-sm" style={{ borderColor: C.elevado }}><span style={{ color: C.suave }}>Total</span><span className="pres-titulo">$3.750.000</span></p>
          </Tarjeta>
          <Tarjeta>
            <p className="text-xs uppercase" style={{ ...mono, color: C.suave }}>Costos fijos por mes</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 text-sm">
              {COSTOS_FIJOS.map(([t, v]) => (
                <li key={t} className="flex justify-between gap-2 py-1.5 border-b" style={{ borderColor: C.elevado }}>
                  <span style={{ color: C.apagado }}>{t}</span><span style={mono}>{v}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between text-sm"><span style={{ color: C.suave }}>Por mes</span><span className="pres-titulo">$675.598,60</span></p>
            <p className="mt-2 text-xs" style={{ color: C.apagado }}>Para dar soporte técnico y seguir mejorando la app.</p>
          </Tarjeta>
        </div>
      </Diapo>

      {/* Precio */}
      <Diapo parte="04" className="justify-center">
        <TarjetaClara className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <Rotulo oscuro color={C.verde}>Precio de venta</Rotulo>
            <p className="pres-titulo mt-6 text-[48px] sm:text-[80px] leading-none tracking-[-0.05em]">$6.079.428</p>
            <p className="mt-5 text-[#3E5A4C] max-w-md">
              Recupera lo que costó desarrollarla, deja una ganancia y permite mantener el proyecto funcionando.
            </p>
          </div>
          <ul className="text-base">
            {[['Costo variable (tecnología + mano de obra)', '$4.052.952'], ['Margen de contribución', '50%'], ['Precio de venta', '$6.079.428']].map(([t, v], i) => (
              <li key={t} className={`flex justify-between gap-4 py-4 border-b border-[#0F1D17]/15 ${i === 2 ? 'pres-titulo' : ''}`}>
                <span>{t}</span><span style={mono}>{v}</span>
              </li>
            ))}
          </ul>
        </TarjetaClara>
      </Diapo>

      {/* Propuesta */}
      <Diapo parte="04">
        <Titulo
          rotulo="Nuestra propuesta"
          color={C.verde}
          titulo="Cómo empezar a usarla"
          texto="La app ya funciona. Para que llegue a todos los vecinos, proponemos estos cuatro pasos junto al municipio."
        />
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROPUESTA.map(({ titulo, texto }, i) => (
            <li key={titulo} className="border-t pt-6" style={{ borderColor: i === 0 ? C.amarillo : C.linea }}>
              <p className="text-xs" style={{ ...mono, color: C.suave }}>PASO 0{i + 1}</p>
              <p className="pres-titulo mt-4 text-xl tracking-[-0.02em]">{titulo}</p>
              <p className="mt-3 text-sm leading-[1.43]" style={{ color: C.apagado }}>{texto}</p>
            </li>
          ))}
        </ol>
      </Diapo>

      {/* Lo que viene */}
      <Diapo parte="04">
        <Titulo rotulo="Lo que viene" color={C.verde} titulo="Hacia dónde puede crecer" texto="Ideas que salieron de la comunidad y de las devoluciones de la feria." />
        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          {FUTURO.map(({ titulo, texto }, i) => (
            <Tarjeta key={titulo}>
              <p className="text-xs" style={{ ...mono, color: i === 0 ? C.amarillo : C.suave }}>PRÓXIMO 0{i + 1}</p>
              <p className="pres-titulo mt-6 text-[28px] leading-none tracking-[-0.03em]">{titulo}</p>
              <p className="mt-4 text-sm" style={{ color: C.apagado }}>{texto}</p>
            </Tarjeta>
          ))}
        </div>
      </Diapo>

      {/* Equipo + QR */}
      <Diapo id="equipo" parte="04" className="justify-center">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <Titulo
              rotulo="Quiénes somos"
              color={C.verde}
              titulo="Hecha por estudiantes de Baradero"
              texto="Mi Baradero es un proyecto de la E.S.T. N°1 Vuelta de Obligado. La app ya está funcionando y se puede probar hoy."
            />
            <ul className="mt-8 max-w-lg">
              {ROLES.map(({ nombre, roles }, i) => (
                <li key={nombre} className="flex gap-5 py-3.5 border-b" style={{ borderColor: C.elevado }}>
                  <span className="text-xs pt-1" style={{ ...mono, color: C.amarillo }}>0{i + 1}</span>
                  <span>
                    <span className="pres-titulo block">{nombre}</span>
                    <span className="block mt-0.5 text-sm" style={{ color: C.apagado }}>{roles}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm" style={{ color: C.apagado }}>
              <span className="text-xs uppercase mr-2" style={{ ...mono, color: C.suave }}>Asesores</span>
              Azul Saladin · Valentín Orduña · Gonzalo Santin
            </p>
          </div>
          <div className="rounded-[10px] p-6 w-full max-w-[480px] lg:ml-auto" style={{ background: C.hueso, color: '#0F1D17' }}>
            <Rotulo oscuro>Probala ahora</Rotulo>
            <p className="pres-titulo mt-4 text-[32px] sm:text-[36px] leading-[1.1] tracking-[-0.031em]">Escaneá el código con el celular</p>
            <div className="mt-6 flex items-end justify-between gap-4">
              <QRCodeSVG value={URL_APP} size={140} bgColor="#F1F6F3" fgColor="#0F1D17" />
              <Link to="/" className="inline-flex items-center gap-2 h-11 px-[14px] rounded-[3px] text-sm bg-[#0F1D17] text-[#F1F6F3] hover:bg-[#1D3328] transition-colors duration-150">
                Abrir <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="mt-4 text-sm" style={mono}>mi-baradero.web.app</p>
          </div>
        </div>
      </Diapo>

      {/* Cierre */}
      <Diapo parte="04" className="justify-center text-center">
        <p className="text-xs uppercase" style={{ ...mono, color: C.suave }}>Gracias por escucharnos</p>
        <h2 className="mt-6 text-[56px] sm:text-[96px] leading-none tracking-[-0.05em]">¿Preguntas?</h2>
        <p className="mt-6 text-lg max-w-lg mx-auto" style={{ color: C.apagado }}>Toda la ciudad en el celular de cada vecino.</p>
        <div className="mt-10 flex justify-center">
          <img src="/logo-mibaradero.png" alt="Mi Baradero" className="h-16 w-auto rounded-[10px] bg-white p-1.5" />
        </div>
      </Diapo>

      <footer className="border-t" style={{ borderColor: C.elevado }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row gap-3 justify-between text-sm" style={{ color: C.apagado }}>
          <span className="text-xs uppercase" style={{ ...mono, color: C.hueso }}>Mi Baradero · E.S.T. N°1 Vuelta de Obligado</span>
          <span>No es el sitio oficial de la Municipalidad de Baradero</span>
        </div>
      </footer>
    </div>
  )
}
