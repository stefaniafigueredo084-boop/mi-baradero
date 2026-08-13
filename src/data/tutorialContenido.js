// Guion del recorrido guiado de Tachín — cada sector tiene uno o varios
// pasos cortos (para leerse rápido, público objetivo: gente grande, no
// acostumbrada a apps). Fácil de editar sin tocar la lógica del tour.
//
// "ancla" (opcional): selector CSS del elemento de la página real al
// que hay que hacerle scroll mientras se explica ese paso — así Tachín
// va mostrando exactamente de qué parte está hablando, en vez de dejar
// la página quieta donde quedó. Si un paso no tiene ancla, se scrollea
// al principio de la página (por ejemplo, al entrar a un sector nuevo).
export const SECTORES_TOUR = [
  {
    id: 'combi',
    ruta: '/combi',
    titulo: 'Combi Municipal',
    pasos: [
      {
        texto: 'Bajá hasta "Mi Pase". Ahí elegís la fecha del viaje y el horario de la combi que querés tomar.',
        ancla: '#mipase-horario',
      },
      {
        texto: 'Elegís qué tipo de pasaje sos: Común, Estudiante, Jubilado o con Discapacidad. Si es con descuento, la primera vez te va a pedir una foto del documento correspondiente.',
        ancla: '#mipase-categoria',
      },
      {
        texto: 'Te muestra cuánto tenés que pagar. Hacés la transferencia y mandás el comprobante por WhatsApp tocando el botón "Enviar comprobante".',
        ancla: '#mi-pase',
      },
      {
        texto: 'Cuando el municipio confirma que llegó el pago, en esa misma pantalla aparece tu código QR. Se lo mostrás al chofer al subir — es de un solo uso.',
        ancla: '#mi-pase',
      },
    ],
  },
  {
    id: 'residuos',
    ruta: '/residuos',
    titulo: 'Recolección de Residuos',
    pasos: [
      { texto: 'Acá te fijás qué día pasa el camión por tu calle y qué tipo de residuo corresponde cada día de la semana.' },
      { texto: 'Si activás las notificaciones, te avisa cuando el camión está por llegar a tu zona.' },
    ],
  },
  {
    id: 'eventos',
    ruta: '/eventos',
    titulo: 'Eventos y Noticias',
    pasos: [
      { texto: 'Acá te enterás de las actividades y noticias del pueblo, actualizadas por la Municipalidad.' },
      { texto: 'Podés filtrar por categoría (fiestas, cultura, deportes...) y activar avisos para enterarte apenas se agrega un evento nuevo.' },
    ],
  },
  {
    id: 'puntosVerdes',
    ruta: '/puntos-verdes',
    titulo: 'Puntos Verdes',
    pasos: [
      { texto: 'Acá encontrás dónde llevar pilas, botellas y otros reciclables cerca tuyo, con la dirección y los horarios de cada punto.' },
    ],
  },
]
