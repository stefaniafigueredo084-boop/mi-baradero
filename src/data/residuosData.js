export const calendario = [
  { dia: 'Lunes', tipo: 'Residuos Comunes', color: 'verde', icono: '🗑️', descripcion: 'Bolsas negras de residuos domiciliarios generales' },
  { dia: 'Martes', tipo: 'Sin recolección', color: 'gris', icono: '❌', descripcion: 'No hay servicio de recolección' },
  { dia: 'Miércoles', tipo: 'Reciclables', color: 'azul', icono: '♻️', descripcion: 'Plásticos, vidrio, papel y cartón en bolsa verde' },
  { dia: 'Jueves', tipo: 'Sin recolección', color: 'gris', icono: '❌', descripcion: 'No hay servicio de recolección' },
  { dia: 'Viernes', tipo: 'Residuos Comunes', color: 'verde', icono: '🗑️', descripcion: 'Bolsas negras de residuos domiciliarios generales' },
  { dia: 'Sábado', tipo: 'Sin recolección', color: 'gris', icono: '❌', descripcion: 'No hay servicio de recolección' },
  { dia: 'Domingo', tipo: 'Sin recolección', color: 'gris', icono: '❌', descripcion: 'No hay servicio de recolección' },
]

export const zonas = [
  { id: 1, nombre: 'Centro', horario: '08:00 - 10:00', proximaRecoleccion: 15 },
  { id: 2, nombre: 'Estación', horario: '10:00 - 12:00', proximaRecoleccion: 45 },
  { id: 3, nombre: 'Barrio Bernabé', horario: '12:00 - 14:00', proximaRecoleccion: 90 },
  { id: 4, nombre: 'Barrio Fonavi', horario: '14:00 - 16:00', proximaRecoleccion: 150 },
  { id: 5, nombre: 'Barrio Mutual', horario: '16:00 - 18:00', proximaRecoleccion: 210 },
]

export const estadosCamion = {
  EN_SERVICIO: { label: 'En servicio', color: 'verde', descripcion: 'El camión está operativo y realizando recorrido' },
  FUERA_DE_SERVICIO: { label: 'Fuera de servicio', color: 'rojo', descripcion: 'El camión no está disponible temporalmente' },
  EN_DEPOSITO: { label: 'En depósito', color: 'amarillo', descripcion: 'El camión se encuentra en el depósito municipal' },
}

export const consejos = [
  { titulo: 'Separá en origen', descripcion: 'Separar los residuos en casa facilita el reciclado y cuida el ambiente.', icono: '🌿' },
  { titulo: 'Sacar antes de las 20h', descripcion: 'Coloca los residuos en la vereda antes de las 20hs del día anterior.', icono: '🕗' },
  { titulo: 'Bolsas bien cerradas', descripcion: 'Asegurá que las bolsas estén bien cerradas para evitar derrames.', icono: '🛍️' },
  { titulo: 'No arrojar en la vía pública', descripcion: 'No tirar basura en la calle. Multas de hasta $50.000.', icono: '⚠️' },
]
