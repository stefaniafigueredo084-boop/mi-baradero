import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { Bus, Calendar, History as HistoryIcon, Loader2, LogOut, Recycle, Trash2, Users, UserCheck } from 'lucide-react'
import { auth } from '../firebase'
import { useTrabajador } from '../hooks/useTrabajador'
import { registrarHistorial } from '../utils/historial'
import LoginTrabajadores from './LoginTrabajadores'
import ColeccionCRUD from '../components/panel/ColeccionCRUD'
import EnviarAviso from '../components/panel/EnviarAviso'
import EstadoCamion from '../components/panel/EstadoCamion'
import CombiEnVivo from '../components/panel/CombiEnVivo'
import CalendarioResiduos from '../components/panel/CalendarioResiduos'
import AgregarTrabajador from '../components/panel/AgregarTrabajador'
import Historial from '../components/panel/Historial'
import Vecinos from '../components/panel/Vecinos'
import ImportarDatosFijos from '../components/panel/ImportarDatosFijos'
import {
  camposEventos,
  camposHorariosCombi,
  camposAlertasCombi,
  camposZonasResiduos,
  camposConsejosResiduos,
  camposPuntosVerdes,
} from '../data/panelCampos'
import { eventos as eventosFijos } from '../data/eventosData'
import { horarios as horariosFijos, alertasCombi as alertasFijas } from '../data/combiData'
import { zonas as zonasFijas, consejos as consejosFijos } from '../data/residuosData'
import { puntosVerdes as puntosFijos } from '../data/puntosVerdesData'

const TODAS_LAS_TABS = [
  { id: 'eventos', label: 'Eventos', icon: Calendar },
  { id: 'combi', label: 'Combi Municipal', icon: Bus },
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
          <div>
            <EnviarAviso nombreDoc="avisoEventos" seccion="eventos" placeholder="Ej: La Fiesta de la Primavera empieza en 30 minutos" />
            <h3 className="font-bold font-poppins text-lg text-gray-800 mb-4">Eventos</h3>
            <ImportarDatosFijos
              coleccion="eventos"
              seccion="eventos"
              etiqueta="eventos"
              datos={eventosFijos}
              mapear={e => ({
                titulo: e.titulo, imagenData: e.imagen, categoria: e.categoria, fechaDisplay: e.fechaDisplay,
                hora: e.hora, ubicacion: e.ubicacion, descripcion: e.descripcion, color: e.color,
                destacado: e.destacado, idOriginal: e.id,
              })}
            />
            <ColeccionCRUD
              coleccion="eventos"
              seccion="eventos"
              campos={camposEventos}
              renderTitulo={i => i.titulo}
              renderSubtitulo={i => [i.fechaDisplay, i.ubicacion].filter(Boolean).join(' · ')}
            />
          </div>
        )}

        {tab === 'combi' && (
          <div>
            <CombiEnVivo />
            <h3 className="font-bold font-poppins text-lg text-gray-800 mb-4">Horarios de la combi</h3>
            <ImportarDatosFijos
              coleccion="horariosCombi"
              seccion="combi"
              etiqueta="horarios"
              datos={horariosFijos}
              mapear={h => ({
                salida: h.salida, llegada: h.llegada, origen: h.origen, destino: h.destino,
                disponibles: h.disponibles, idOriginal: h.id,
              })}
            />
            <ColeccionCRUD
              coleccion="horariosCombi"
              seccion="combi"
              campos={camposHorariosCombi}
              renderTitulo={i => `${i.salida} — ${i.origen} → ${i.destino}`}
              renderSubtitulo={i => `Llega ${i.llegada || '-'} · ${i.disponibles} lugares`}
            />
            <h3 className="font-bold font-poppins text-lg text-gray-800 mb-4 mt-10">Alertas y demoras</h3>
            <p className="text-gray-500 text-sm mb-4 -mt-2">
              Cada alerta que agregás acá también le llega como notificación a quienes activaron avisos de la combi.
            </p>
            <ImportarDatosFijos
              coleccion="alertasCombi"
              seccion="combi"
              etiqueta="alertas"
              datos={alertasFijas}
              mapear={a => ({ tipo: a.tipo, horario: a.horario, mensaje: a.mensaje, hora: a.hora, idOriginal: a.id })}
            />
            <ColeccionCRUD
              coleccion="alertasCombi"
              seccion="combi"
              campos={camposAlertasCombi}
              renderTitulo={i => i.mensaje}
              renderSubtitulo={i => `${i.tipo} · combi ${i.horario || ''}`}
            />
          </div>
        )}

        {tab === 'residuos' && (
          <div>
            <EstadoCamion />
            <EnviarAviso
              nombreDoc="avisoResiduos"
              seccion="residuos"
              presets={['🚛 El camión salió del depósito', '🚛 El camión está llegando a tu zona']}
              placeholder="O escribí un aviso personalizado..."
            />
            <CalendarioResiduos />
            <h3 className="font-bold font-poppins text-lg text-gray-800 mb-4">Zonas y próxima recolección</h3>
            <ImportarDatosFijos
              coleccion="zonasResiduos"
              seccion="residuos"
              etiqueta="zonas"
              datos={zonasFijas}
              mapear={z => ({ nombre: z.nombre, horario: z.horario, proximaRecoleccion: z.proximaRecoleccion, idOriginal: z.id })}
            />
            <ColeccionCRUD
              coleccion="zonasResiduos"
              seccion="residuos"
              campos={camposZonasResiduos}
              renderTitulo={i => i.nombre}
              renderSubtitulo={i => `${i.horario || ''} · en ${i.proximaRecoleccion} min`}
            />
            <h3 className="font-bold font-poppins text-lg text-gray-800 mb-4 mt-10">Consejos de reciclado</h3>
            <ImportarDatosFijos
              coleccion="consejosResiduos"
              seccion="residuos"
              etiqueta="consejos"
              datos={consejosFijos}
              mapear={c => ({ titulo: c.titulo, descripcion: c.descripcion, icono: c.icono, idOriginal: c.titulo })}
            />
            <ColeccionCRUD
              coleccion="consejosResiduos"
              seccion="residuos"
              campos={camposConsejosResiduos}
              renderTitulo={i => `${i.icono || ''} ${i.titulo}`}
              renderSubtitulo={i => i.descripcion}
            />
          </div>
        )}

        {tab === 'puntosVerdes' && (
          <div>
            <ImportarDatosFijos
              coleccion="puntosVerdesExtra"
              seccion="puntosVerdes"
              etiqueta="puntos verdes"
              datos={puntosFijos}
              mapear={p => ({
                nombre: p.nombre, direccion: p.direccion, horario: p.horario, materiales: p.materiales,
                activo: p.activo, capacidad: p.capacidad, posX: p.posX, posY: p.posY, idOriginal: p.id,
              })}
            />
            <ColeccionCRUD
              coleccion="puntosVerdesExtra"
              seccion="puntosVerdes"
              campos={camposPuntosVerdes}
              renderTitulo={i => i.nombre}
              renderSubtitulo={i => i.direccion}
            />
          </div>
        )}

        {tab === 'usuarios' && esAdmin && <AgregarTrabajador />}
        {tab === 'vecinos' && esAdmin && <Vecinos />}
        {tab === 'historial' && esAdmin && <Historial />}
      </div>
    </div>
  )
}
