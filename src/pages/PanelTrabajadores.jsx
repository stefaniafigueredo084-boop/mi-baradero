import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { Bell, Bus, Calendar, Car, Clock, CreditCard, History as HistoryIcon, ClipboardList, Lightbulb, Loader2, LogOut, MapPin, Megaphone, Navigation, Recycle, ShieldOff, Trash2, Truck, Users, UserCheck, UserPlus } from 'lucide-react'
import { auth } from '../firebase'
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
import AcordeonItem, { Acordeon } from '../components/panel/Acordeon'
import {
  camposEventos,
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

  useEffect(() => onAuthStateChanged(auth, u => {
    setUsuario(u)
    if (u) registrarHistorial({ tipo: 'login', seccion: 'usuarios', detalle: '' })
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

  const cerrarSesion = async () => {
    await registrarHistorial({ tipo: 'logout', seccion: 'usuarios', detalle: '' })
    await signOut(auth)
  }

  if (usuario === undefined || (usuario && trabajador === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-verde animate-spin" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-verde-oscuro to-[#064020] text-white py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-poppins">Panel de Trabajadores</h1>
            <p className="text-green-200 text-sm mt-1">
              Conectado como {usuario.email}
              {!esAdmin && trabajador?.sector && <> · Sector: {TODAS_LAS_TABS.find(t => t.id === trabajador.sector)?.label}</>}
              {esAdmin && <> · Administrador general</>}
            </p>
          </div>
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-2xl font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {tabsVisibles.length > 1 && (
          <div className="flex gap-2 mb-8 flex-wrap">
            {tabsVisibles.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
                  tab === id ? 'bg-verde text-white shadow-md' : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-verde'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
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
            <AcordeonItem icono={Megaphone} color="azul" titulo="Avisos" descripcion="Publicar un aviso nuevo">
              <EnviarAviso nombreDoc="avisoEventos" seccion="eventos" placeholder="Ej: La Fiesta de la Primavera empieza en 30 minutos" />
            </AcordeonItem>

            <AcordeonItem icono={Calendar} color="verde" titulo="Eventos" descripcion="Agregar o editar eventos" abiertoPorDefecto>
              <ColeccionCRUD
                coleccion="eventos"
                seccion="eventos"
                campos={camposEventos}
                renderTitulo={i => i.titulo}
                renderSubtitulo={i => [i.fechaDisplay, i.ubicacion].filter(Boolean).join(' · ')}
              />
            </AcordeonItem>
          </Acordeon>
        )}

        {tab === 'choferes' && (
          <EmbarqueScanner soloHorarios={trabajador?.horariosAsignados} />
        )}

        {tab === 'combi' && (
          <Acordeon>
            <AcordeonItem
              icono={CreditCard}
              color="azul"
              titulo="Confirmar pagos"
              descripcion="Pasajes esperando confirmación"
              badge={pagosPendientes}
              abiertoPorDefecto={pagosPendientes > 0}
            >
              <ConfirmarPago />
            </AcordeonItem>

            <AcordeonItem
              icono={ClipboardList}
              color="azul"
              titulo="Solicitudes de categoría"
              descripcion="Certificados de estudiante/jubilado/discapacidad a revisar"
              badge={categoriasPendientes}
              abiertoPorDefecto={categoriasPendientes > 0}
            >
              <SolicitudesCategoria />
            </AcordeonItem>

            <AcordeonItem icono={Navigation} color="verde" titulo="Combi en vivo" descripcion="Marcar la parada actual">
              <CombiEnVivo />
            </AcordeonItem>

            <AcordeonItem icono={Clock} color="verde" titulo="Horarios de la combi" descripcion="Agregar o editar los horarios del día">
              <ColeccionCRUD
                coleccion="horariosCombi"
                seccion="combi"
                campos={camposHorariosCombi}
                renderTitulo={i => `${i.salida} — ${i.origen} → ${i.destino}`}
                renderSubtitulo={i => `Llega ${i.llegada || '-'} · ${i.disponibles} lugares`}
              />
            </AcordeonItem>

            <AcordeonItem icono={Bell} color="amarillo" titulo="Alertas y demoras" descripcion="Publicar un aviso nuevo">
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
          </Acordeon>
        )}

        {tab === 'residuos' && (
          <Acordeon>
            <AcordeonItem icono={Truck} color="verde" titulo="Estado del camión" descripcion="Dónde está ahora" abiertoPorDefecto>
              <EstadoCamion />
            </AcordeonItem>

            <AcordeonItem icono={Megaphone} color="azul" titulo="Avisos" descripcion="Publicar un aviso nuevo">
              <EnviarAviso
                nombreDoc="avisoResiduos"
                seccion="residuos"
                presets={['🚛 El camión salió del depósito', '🚛 El camión está llegando a tu zona']}
                placeholder="O escribí un aviso personalizado..."
              />
            </AcordeonItem>

            <AcordeonItem icono={Calendar} color="azul" titulo="Calendario semanal" descripcion="Qué residuo corresponde cada día">
              <CalendarioResiduos />
            </AcordeonItem>

            <AcordeonItem icono={MapPin} color="verde" titulo="Zonas y próxima recolección" descripcion="Agregar o editar zonas">
              <ColeccionCRUD
                coleccion="zonasResiduos"
                seccion="residuos"
                campos={camposZonasResiduos}
                renderTitulo={i => i.nombre}
                renderSubtitulo={i => `${i.horario || ''} · en ${i.proximaRecoleccion} min`}
              />
            </AcordeonItem>

            <AcordeonItem icono={Lightbulb} color="amarillo" titulo="Consejos de reciclado" descripcion="Agregar o editar consejos">
              <ColeccionCRUD
                coleccion="consejosResiduos"
                seccion="residuos"
                campos={camposConsejosResiduos}
                renderTitulo={i => `${i.icono || ''} ${i.titulo}`}
                renderSubtitulo={i => i.descripcion}
              />
            </AcordeonItem>
          </Acordeon>
        )}

        {tab === 'puntosVerdes' && (
          <div>
            <ColeccionCRUD
              coleccion="puntosVerdesExtra"
              seccion="puntosVerdes"
              campos={camposPuntosVerdes}
              renderTitulo={i => i.nombre}
              renderSubtitulo={i => i.direccion}
            />
          </div>
        )}

        {tab === 'usuarios' && esAdmin && (
          <Acordeon>
            <AcordeonItem icono={Users} color="verde" titulo="Cuentas del panel" descripcion="Desactivar, reactivar o eliminar" abiertoPorDefecto>
              <GestionarTrabajadores />
            </AcordeonItem>
            <AcordeonItem icono={UserPlus} color="azul" titulo="Agregar trabajador" descripcion="Crear una cuenta nueva">
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
