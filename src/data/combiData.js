export const paradas = [
  { id: 1, nombre: 'Estación', descripcion: 'Terminal de ómnibus y ferroviaria', icono: '🚉', posX: 15, posY: 50 },
  { id: 2, nombre: 'Centro de Camioneros', descripcion: 'Av. Costanera s/n', icono: '🏢', posX: 35, posY: 35 },
  { id: 3, nombre: 'Plaza Principal', descripcion: 'Plaza Mitre - Centro', icono: '🌳', posX: 55, posY: 50 },
  { id: 4, nombre: 'Hospital', descripcion: 'Hospital Municipal Baradero', icono: '🏥', posX: 75, posY: 65 },
]

export const rutas = [
  { id: 1, nombre: 'Ruta Alsina - Portela - Baradero', color: '#1B8E3E' },
]

export const horarios = [
  { id: 1, salida: '06:30', llegada: '07:00', origen: 'Alsina', destino: 'Baradero', disponibles: 8 },
  { id: 2, salida: '08:00', llegada: '08:30', origen: 'Alsina', destino: 'Baradero', disponibles: 12 },
  { id: 3, salida: '10:00', llegada: '10:30', origen: 'Portela', destino: 'Baradero', disponibles: 5 },
  { id: 4, salida: '12:30', llegada: '13:00', origen: 'Baradero', destino: 'Alsina', disponibles: 10 },
  { id: 5, salida: '15:00', llegada: '15:30', origen: 'Baradero', destino: 'Portela', disponibles: 7 },
  { id: 6, salida: '17:30', llegada: '18:00', origen: 'Alsina', destino: 'Baradero', disponibles: 3 },
  { id: 7, salida: '19:00', llegada: '19:30', origen: 'Baradero', destino: 'Alsina', disponibles: 15 },
  { id: 8, salida: '21:00', llegada: '21:30', origen: 'Portela', destino: 'Baradero', disponibles: 0 },
]

export const destinos = ['Alsina', 'Portela', 'Baradero - Centro', 'Baradero - Hospital', 'Baradero - Estación']

export const estadosCombi = [
  'Combi circulando por Alsina',
  'Combi próxima a Portela',
  'Combi llegando a Centro de Camioneros',
  'Combi en Plaza Principal',
  'Combi próxima a Hospital',
  'Combi circulando por Baradero',
  'Combi próxima a Estación',
]

export const alertasCombi = [
  {
    id: 1,
    tipo: 'demora',
    horario: '08:00',
    mensaje: 'La combi de las 08:00 tiene un retraso aproximado de 15 minutos por tráfico en Av. Alsina.',
    hora: '07:48',
  },
  {
    id: 2,
    tipo: 'atiempo',
    horario: '06:30',
    mensaje: 'La combi de las 06:30 llegó a tiempo a Baradero - Estación.',
    hora: '07:02',
  },
  {
    id: 3,
    tipo: 'aviso',
    horario: '10:00',
    mensaje: 'Por obras en Ruta 9, el recorrido de las 10:00 tomará un desvío por Portela. Se estima un retraso de 10 minutos.',
    hora: '09:15',
  },
  {
    id: 4,
    tipo: 'demora',
    horario: '12:30',
    mensaje: 'La combi de las 12:30 sale con 20 minutos de demora desde Baradero por inconvenientes mecánicos menores.',
    hora: '12:10',
  },
]

export const datosPago = {
  alias: 'Mi.baradero.no.es.un.alias.verdadero',
  titular: 'Mi Baradero APP',
  telefono: '5493329383105',
  telefonoVisible: '+54 9 3329 38-3105',
}
