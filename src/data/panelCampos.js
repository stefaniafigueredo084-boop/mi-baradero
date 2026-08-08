// Definición de los campos de cada formulario del panel de trabajadores.
// Cada "campo" describe cómo se renderiza (CampoInput) y cómo se valida
// (required) un valor dentro de un documento de Firestore.

export const camposEventos = [
  { name: 'titulo', label: 'Título', type: 'text', required: true, placeholder: 'Ej: Feria de Primavera' },
  { name: 'imagenData', label: 'Foto del evento (opcional)', type: 'image' },
  { name: 'categoria', label: 'Categoría', type: 'select', options: ['Festival', 'Gastronomía', 'Comunidad', 'Cultura', 'Deportes', 'Obras Públicas', 'Educación', 'Salud'] },
  { name: 'fechaDisplay', label: 'Fecha', type: 'text', placeholder: 'Ej: 15 de Agosto' },
  { name: 'hora', label: 'Hora', type: 'text', placeholder: 'Ej: 20:00' },
  { name: 'ubicacion', label: 'Ubicación', type: 'text', placeholder: 'Ej: Plaza Mitre', default: 'Baradero' },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Contá de qué se trata el evento...' },
  { name: 'color', label: 'Color de la tarjeta', type: 'color', default: '#1B8E3E' },
  { name: 'destacado', label: 'Mostrar como destacado', type: 'checkbox', checkboxLabel: 'Sí, destacarlo arriba de todo' },
]

export const camposZonasResiduos = [
  { name: 'nombre', label: 'Zona / Barrio', type: 'text', required: true, placeholder: 'Ej: Barrio Norte' },
  { name: 'horario', label: 'Horario de recolección', type: 'text', placeholder: 'Ej: 08:00 - 10:00' },
  { name: 'proximaRecoleccion', label: 'Próxima recolección (minutos)', type: 'number', placeholder: '30' },
]

export const camposPuntosVerdes = [
  { name: 'nombre', label: 'Nombre del punto', type: 'text', required: true, placeholder: 'Ej: Punto Verde Costanera' },
  { name: 'direccion', label: 'Dirección', type: 'text', placeholder: 'Ej: Av. Costanera 300' },
  { name: 'horario', label: 'Horario', type: 'text', placeholder: 'Ej: Lun a Vie: 8:00 - 18:00' },
  { name: 'materiales', label: 'Materiales que recibe', type: 'multiselect', options: ['Cartón', 'Papel', 'Vidrio', 'Plástico', 'Metales', 'Residuos orgánicos'] },
  { name: 'activo', label: 'Estado', type: 'checkbox', checkboxLabel: 'Punto activo', default: true },
  { name: 'capacidad', label: 'Capacidad ocupada (%)', type: 'number', placeholder: '0', default: '0' },
]

export const camposHorariosCombi = [
  { name: 'salida', label: 'Hora de salida', type: 'text', required: true, placeholder: 'Ej: 14:00' },
  { name: 'llegada', label: 'Hora de llegada', type: 'text', placeholder: 'Ej: 14:30' },
  { name: 'origen', label: 'Origen', type: 'select', options: ['Alsina', 'Portela', 'Baradero'] },
  { name: 'destino', label: 'Destino', type: 'select', options: ['Alsina', 'Portela', 'Baradero'] },
  { name: 'disponibles', label: 'Lugares disponibles', type: 'number', placeholder: '15', default: '15' },
]

export const camposAlertasCombi = [
  { name: 'tipo', label: 'Tipo de aviso', type: 'select', required: true, options: ['demora', 'atiempo', 'aviso'] },
  { name: 'horario', label: 'Combi (horario afectado)', type: 'text', placeholder: 'Ej: 08:00' },
  { name: 'mensaje', label: 'Mensaje', type: 'textarea', required: true, placeholder: 'Ej: La combi de las 08:00 sale con 10 minutos de demora.' },
  { name: 'hora', label: 'Hora de este aviso', type: 'text', placeholder: 'Ej: 07:45' },
]

export const camposConsejosResiduos = [
  { name: 'titulo', label: 'Título', type: 'text', required: true, placeholder: 'Ej: Reciclá el vidrio' },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Explicá el consejo...' },
  { name: 'icono', label: 'Emoji', type: 'text', placeholder: '🌿' },
]

export const estadosCamionOpciones = [
  { id: 'EN_SERVICIO', label: 'En servicio' },
  { id: 'FUERA_DE_SERVICIO', label: 'Fuera de servicio' },
  { id: 'EN_DEPOSITO', label: 'En depósito' },
]

export const calendarioResiduosDefault = [
  { dia: 'Lunes', tipo: 'Residuos Comunes', color: 'verde', icono: '🗑️', descripcion: 'Bolsas negras de residuos domiciliarios generales' },
  { dia: 'Martes', tipo: 'Sin recolección', color: 'gris', icono: '❌', descripcion: 'No hay servicio de recolección' },
  { dia: 'Miércoles', tipo: 'Reciclables', color: 'azul', icono: '♻️', descripcion: 'Plásticos, vidrio, papel y cartón en bolsa verde' },
  { dia: 'Jueves', tipo: 'Sin recolección', color: 'gris', icono: '❌', descripcion: 'No hay servicio de recolección' },
  { dia: 'Viernes', tipo: 'Residuos Comunes', color: 'verde', icono: '🗑️', descripcion: 'Bolsas negras de residuos domiciliarios generales' },
  { dia: 'Sábado', tipo: 'Sin recolección', color: 'gris', icono: '❌', descripcion: 'No hay servicio de recolección' },
  { dia: 'Domingo', tipo: 'Sin recolección', color: 'gris', icono: '❌', descripcion: 'No hay servicio de recolección' },
]
