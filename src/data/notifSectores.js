// Metadatos de los 4 sectores de notificación del perfil, compartidos
// entre el formulario (Perfil.jsx) y el asistente de voz (AsistenteVoz.jsx).
// "ejemplo" es el texto que se muestra/lee para que el vecino sepa qué
// tipo de aviso va a recibir antes de activarlo.
export const NOTIF_SECTORES = [
  {
    key: 'basura',
    label: 'Recolección de Basura',
    desc: 'Avisame cuando el camión esté cerca de mi casa',
    ejemplo: 'El camión de residuos está a menos de 500 metros de tu casa. ¡Sacá las bolsas!',
    color: 'amarillo',
  },
  {
    key: 'eventos',
    label: 'Eventos próximos',
    desc: 'Notificación antes de que empiece un evento',
    ejemplo: 'La Fiesta de la Primavera empieza en 30 minutos.',
    color: 'verde',
  },
  {
    key: 'nuevosEventos',
    label: 'Nuevos eventos',
    desc: 'Cuando se agregue un evento nuevo a la agenda',
    ejemplo: 'Se agregó un nuevo evento a la agenda de Baradero.',
    color: 'azul',
  },
  {
    key: 'puntosVerdes',
    label: 'Puntos Verdes',
    desc: 'Avisos sobre los puntos de reciclaje cercanos',
    ejemplo: 'Hay un nuevo punto verde cerca de tu zona.',
    color: 'verde',
  },
]
