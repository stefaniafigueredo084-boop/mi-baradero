import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { Bell, Bus, Calendar, Car, Clock, CreditCard, History as HistoryIcon, ClipboardList, Info, Lightbulb, Loader2, LogOut, MapPin, Megaphone, MessageSquare, Navigation, Newspaper, Recycle, ShieldOff, Trash2, Truck, Users, UserCheck, UserPlus } from 'lucide-react'
import { auth } from '../firebase'
import LogoMiBaradero from '../components/LogoMiBaradero'
import { useTrabajador } from '../hooks/useTrabajador'
import { useColeccion } from '../hooks/useColeccion'
import { registrarHistorial } from '../utils/historial'
import LoginTrabajadores from './LoginTrabajadores'
import ColeccionCRUD from '../components/panel/ColeccionCRUD'
import EnviarAviso from '../components/panel/EnviarAviso'
import EstadoCamion from '../components/panel/EstadoCamion'
import CombiEnVivo from '../components/panel/CombiEnVivo'
import CalendarioResiduos from '../components/panel/CalendarioResiduos'
import AgregarTrabajador from '../components/panel/AgregarTrabajador'
import GestionarTrabajadores from '../components/panel/GestionarTrabajadores'
import Historial from '../components/panel/Historial'
import Vecinos from '../components/panel/Vecinos'
import SolicitudesCategoria from '../components/panel/SolicitudesCategoria'
import ConfirmarPago from '../components/panel/ConfirmarPago'
import EmbarqueScanner from '../components/panel/EmbarqueScanner'
import ReclamosPanel from '../components/panel/ReclamosPanel'
import ComoLleganReclamos from '../components/panel/ComoLleganReclamos'
import { useReclamos } from '../hooks/useReclamos'
import { DEPARTAMENTOS, departamentoDeReclamo, departamentosDelSector } from '../data/reclamosData'
import AcordeonItem, { ListaSecciones as Acordeon } from '../components/panel/SeccionPanel'
import {
  camposEventos,
  camposNoticias,
  camposHorariosCombi,
  camposAlertasCombi,
  camposZonasResiduos,
  camposConsejosResiduos,
  camposPuntosVerdes,
} from '../data/panelCampos'

const TODAS_LAS_TABS = [
  { id: 'eventos', label: 'Eventos', icon: Calendar },
  { id: 'combi', label: 'Combi Municipal', icon: Bus },
  { id: 'choferes', label: 'Choferes', icon: Car },
  { id: 'residuos', label: 'Residuos', icon: Trash2 },
  { id: 'puntosVerdes', label: 'Puntos Verdes', icon: Recycle },
  { id: 'reclamos', label: 'Reclamos', icon: MessageSquare },
  { id: 'usuarios', label: 'Usuarios', icon: Users, soloAdmin: true },
  { id: 'vecinos', label: 'Vecinos', icon: UserCheck, soloAdmin: true },
  { id: 'historial', label: 'Historial', icon: HistoryIcon, soloAdmin: true },
]

export default function PanelTrabajadores() {
  const [usuario, setUsuario] = useState(undefined) // undefined = cargando, null = sin sesión
  const [tab, setTab] = useState(null)
  const trabajador = useTrabajador(usuario?.uid)

  // Solo para los badges de "pendientes" del acordeón — cuánto hay
  // esperando acción, para que se note de un vistazo sin tener que
  // abrir cada sección.
  const { items: pasajesTodos } = useColeccion('pasajes')
  const { items: pasajerosTodos } = useColeccion('pasajeros')
  const pagosPendientes = pasajesTodos.filter(p => p.estado === 'pendiente').length
  const categoriasPendientes = pasajerosTodos.filter(p => p.estadoVerificacion === 'pendiente').length

  // Reclamos de vecinos: el admin y Atención al Vecino (sector
  // "reclamos") ven todos; cada sector, solo los de sus departamentos.
  const veTodosLosReclamos = trabajador?.rol === 'admin' || trabajador?.sector === 'reclamos'
  const { items: reclamos, cargando: cargandoReclamos, error: errorReclamos, hayMas: hayMasReclamos, cargarMas: cargarMasReclamos } = useReclamos(
    veTodosLosReclamos ? null : departamentosDelSector(trabajador?.sector)
  )
  const sinAtender = lista => lista.filter(r => (r.estado || 'nuevo') === 'nuevo').length
  const reclamosNuevos = sinAtender(reclamos)

  // La sesión anónima (la que tiene cualquier visitante del sitio) no
  // cuenta como trabajador: para el panel es "sin sesión" → login.
  useEffect(() => onAuthStateChanged(auth, u => {
    const real = u && !u.isAnonymous ? u : null
    setUsuario(real)
    if (real) registrarHistorial({ tipo: 'login', seccion: 'usuarios', detalle: '' })
  }), [])

  const esAdmin = trabajador?.rol === 'admin'
  const tabsVisibles = esAdmin
    ? TODAS_LAS_TABS
    : TODAS_LAS_TABS.filter(t => !t.soloAdmin && t.id === trabajador?.sector)

  useEffect(() => {
    if (tabsVisibles.length > 0 && !tabsVisibles.some(t => t.id === tab)) {
      setTab(tabsVisibles[0].id)
    }
  }, [tabsVisibles, tab])

  // Sección "Reclamos de vecinos" dentro de la pestaña de un sector:
  // solo los reclamos de los departamentos de ese sector.
  const acordeonReclamos = sector => {
    const lista = reclamos.filter(r => departamentoDeReclamo(r).sector === sector)
    const deptos = DEPARTAMENTOS.filter(d => d.sector === sector).map(d => d.label).join(', ')
    return (
      <AcordeonItem
        icono={MessageSquare}
        titulo="Reclamos de vecinos"
        descripcion={`Quejas y reclamos que llegan a ${deptos}`}
        badge={sinAtender(lista)}
      >
        <ReclamosPanel items={lista} cargando={cargandoReclamos} error={errorReclamos} hayMas={hayMasReclamos} onCargarMas={cargarMasReclamos} departamentos={departamentosDelSector(sector)} />
      </AcordeonItem>
    )
  }

  const cerrarSesion = async () => {
    await registrarHistorial({ tipo: 'logout', seccion: 'usuarios', detalle: '' })
    await signOut(auth)
  }

  if (usuario === undefined || (usuario && trabajador === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primario animate-spin" />
      </div>
    )
  }

  if (!usuario) return <LoginTrabajadores />

  if (trabajador?.activo === false || trabajador?.rol === 'eliminado') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card p-8 max-w-sm text-center">
          <ShieldOff className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h1 className="font-bold font-poppins text-lg text-gray-800 mb-1">Tu cuenta está desactivada</h1>
          <p className="text-sm text-gray-500 mb-5">Ya no tenés acceso al panel. Si te parece que es un error, hablá con un administrador.</p>
          <button onClick={cerrarSesion} className="btn-secondary w-full flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  const tabActual = tabsVisibles.find(t => t.id === tab)
  const rolTexto = esAdmin
    ? 'Administrador general'
    : trabajador?.sector ? `Sector ${TODAS_LAS_TABS.find(t => t.id === trabajador.sector)?.label}` : ''

  return (
    <div className="panel-sistema min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="shrink-0" aria-label="Mi Baradero — ir al sitio">
              <LogoMiBaradero size="sm" />
            </Link>
            <span className="h-5 w-px bg-gray-300 shrink-0" />
            <span className="text-sm font-semibold text-gray-700 truncate">Panel de trabajadores</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-xs font-medium text-gray-800">{usuario.email}</p>
              {rolTexto && <p className="text-xs text-gray-500">{rolTexto}</p>}
            </div>
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Cerrar sesión</span><span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {tabsVisibles.length > 1 && (
        <nav className="bg-white border-b border-gray-200" aria-label="Secciones del panel">
          <div className="max-w-6xl mx-auto px-4 flex gap-6 overflow-x-auto">
            {tabsVisibles.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-current={tab === id ? 'page' : undefined}
                className={`flex items-center gap-1.5 py-3 text-sm whitespace-nowrap border-b-2 -mb-px ${
                  tab === id ? 'border-primario text-primario font-semibold' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
                {id === 'reclamos' && reclamosNuevos > 0 && (
                  <span className="bg-red-600 text-white text-[11px] font-semibold px-1.5 rounded-sm tabular-nums">{reclamosNuevos}</span>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {tabActual && (
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-gray-900">{tabActual.label}</h1>
            <p className="sm:hidden text-xs text-gray-500 mt-0.5">{usuario.email}{rolTexto && ` · ${rolTexto}`}</p>
          </div>
        )}

        {tabsVisibles.length === 0 && trabajador === null && (
          <p className="text-gray-500">Esta cuenta no tiene acceso al panel de trabajadores.</p>
        )}
        {tabsVisibles.length === 0 && trabajador !== null && (
          <p className="text-gray-500">Tu cuenta no tiene un sector asignado. Pedile a un administrador que te lo asigne.</p>
        )}

        {tab === 'eventos' && (
          <Acordeon>
            <AcordeonItem icono={Megaphone} titulo="Avisos" descripcion="Publicar un aviso nuevo">
              <EnviarAviso nombreDoc="avisoEventos" seccion="eventos" placeholder="Ej: La Fiesta de la Primavera empieza en 30 minutos" />
            </AcordeonItem>

            <AcordeonItem icono={Calendar} titulo="Eventos" descripcion="Agregar o editar eventos" abiertoPorDefecto>
              <ColeccionCRUD
                coleccion="eventos"
                seccion="eventos"
                campos={camposEventos}
                renderTitulo={i => i.titulo}
                renderSubtitulo={i => [i.fechaDisplay, i.ubicacion].filter(Boolean).join(' · ')}
              />
            </AcordeonItem>

            <AcordeonItem icono={Newspaper} titulo="Noticias" descripcion="Publicar novedades de la ciudad">
              <ColeccionCRUD
                coleccion="noticias"
                seccion="eventos"
                campos={camposNoticias}
                renderTitulo={i => i.titulo}
                renderSubtitulo={i => i.resumen}
              />
            </AcordeonItem>

            {acordeonReclamos('eventos')}
          </Acordeon>
        )}

        {tab === 'choferes' && (
          <EmbarqueScanner soloHorarios={trabajador?.horariosAsignados} />
        )}

        {tab === 'combi' && (
          <Acordeon>
            <AcordeonItem
              icono={CreditCard}
              titulo="Confirmar pagos"
              descripcion="Pasajes esperando confirmación"
              badge={pagosPendientes}
              abiertoPorDefecto={pagosPendientes > 0}
            >
              <ConfirmarPago />
            </AcordeonItem>

            <AcordeonItem
              icono={ClipboardList}
              titulo="Solicitudes de categoría"
              descripcion="Certificados de estudiante/jubilado/discapacidad a revisar"
              badge={categoriasPendientes}
              abiertoPorDefecto={categoriasPendientes > 0}
            >
              <SolicitudesCategoria />
            </AcordeonItem>

            <AcordeonItem icono={Navigation} titulo="Combi en vivo" descripcion="Marcar la parada actual">
              <CombiEnVivo />
            </AcordeonItem>

            <AcordeonItem icono={Clock} titulo="Horarios de la combi" descripcion="Agregar o editar los horarios del día">
              <ColeccionCRUD
                coleccion="horariosCombi"
                seccion="combi"
                campos={camposHorariosCombi}
                renderTitulo={i => `${i.salida} — ${i.origen} → ${i.destino}`}
                renderSubtitulo={i => `Llega ${i.llegada || '-'} · ${i.disponibles} lugares`}
              />
            </AcordeonItem>

            <AcordeonItem icono={Bell} titulo="Alertas y demoras" descripcion="Publicar un aviso nuevo">
              <p className="text-gray-500 text-sm mb-4">
                Cada alerta que agregás acá también le llega como notificación a quienes activaron avisos de la combi.
              </p>
              <ColeccionCRUD
                coleccion="alertasCombi"
                seccion="combi"
                campos={camposAlertasCombi}
                renderTitulo={i => i.mensaje}
                renderSubtitulo={i => `${i.tipo} · combi ${i.horario || ''}`}
              />
            </AcordeonItem>

            {acordeonReclamos('combi')}
          </Acordeon>
        )}

        {tab === 'residuos' && (
          <Acordeon>
            <AcordeonItem icono={Truck} titulo="Estado del camión" descripcion="Dónde está ahora" abiertoPorDefecto>
              <EstadoCamion />
            </AcordeonItem>

            <AcordeonItem icono={Megaphone} titulo="Avisos" descripcion="Publicar un aviso nuevo">
              <EnviarAviso
                nombreDoc="avisoResiduos"
                seccion="residuos"
                presets={['El camión salió del depósito', 'El camión está llegando a tu zona']}
                placeholder="O escribí un aviso personalizado..."
              />
            </AcordeonItem>

            <AcordeonItem icono={Calendar} titulo="Calendario semanal" descripcion="Qué residuo corresponde cada día">
              <CalendarioResiduos />
            </AcordeonItem>

            <AcordeonItem icono={MapPin} titulo="Zonas y próxima recolección" descripcion="Agregar o editar zonas">
              <ColeccionCRUD
                coleccion="zonasResiduos"
                seccion="residuos"
                campos={camposZonasResiduos}
                renderTitulo={i => i.nombre}
                renderSubtitulo={i => `${i.horario || ''} · en ${i.proximaRecoleccion} min`}
              />
            </AcordeonItem>

            <AcordeonItem icono={Lightbulb} titulo="Consejos de reciclado" descripcion="Agregar o editar consejos">
              <ColeccionCRUD
                coleccion="consejosResiduos"
                seccion="residuos"
                campos={camposConsejosResiduos}
                renderTitulo={i => i.titulo}
                renderSubtitulo={i => i.descripcion}
              />
            </AcordeonItem>

            {acordeonReclamos('residuos')}
          </Acordeon>
        )}

        {tab === 'puntosVerdes' && (
          <Acordeon>
            <AcordeonItem icono={Recycle} titulo="Puntos verdes" descripcion="Agregar o editar puntos de reciclaje" abiertoPorDefecto>
              <ColeccionCRUD
                coleccion="puntosVerdesExtra"
                seccion="puntosVerdes"
                campos={camposPuntosVerdes}
                renderTitulo={i => i.nombre}
                renderSubtitulo={i => i.direccion}
              />
            </AcordeonItem>

            {acordeonReclamos('puntosVerdes')}
          </Acordeon>
        )}

        {tab === 'reclamos' && (
          <Acordeon>
            <AcordeonItem
              icono={MessageSquare}
              titulo="Bandeja de reclamos"
              descripcion="Todos los reclamos de vecinos, de todos los departamentos"
              badge={reclamosNuevos}
              abiertoPorDefecto
            >
              <ReclamosPanel items={reclamos} cargando={cargandoReclamos} error={errorReclamos} hayMas={hayMasReclamos} onCargarMas={cargarMasReclamos} departamentos={veTodosLosReclamos ? null : departamentosDelSector(trabajador?.sector)} completa />
            </AcordeonItem>

            <AcordeonItem icono={Info} titulo="Cómo llegan y quién los atiende" descripcion="El recorrido de un reclamo y qué departamento se encarga de cada tema">
              <ComoLleganReclamos />
            </AcordeonItem>
          </Acordeon>
        )}

        {tab === 'usuarios' && esAdmin && (
          <Acordeon>
            <AcordeonItem icono={Users} titulo="Cuentas del panel" descripcion="Desactivar, reactivar o eliminar" abiertoPorDefecto>
              <GestionarTrabajadores />
            </AcordeonItem>
            <AcordeonItem icono={UserPlus} titulo="Agregar trabajador" descripcion="Crear una cuenta nueva">
              <AgregarTrabajador />
            </AcordeonItem>
          </Acordeon>
        )}
        {tab === 'vecinos' && esAdmin && <Vecinos />}
        {tab === 'historial' && esAdmin && <Historial />}
      </div>
    </div>
  )
}
