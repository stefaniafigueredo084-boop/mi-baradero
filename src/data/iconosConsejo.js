import { AlertTriangle, Clock, Droplets, Leaf, Lightbulb, Package, Recycle, ShoppingBag, Trash2 } from 'lucide-react'

// Íconos que se pueden elegir para un consejo de reciclado desde el
// panel (campo "Ícono"). Se guarda el nombre; si un consejo viejo tiene
// guardado un emoji u otra cosa, se muestra el ícono por defecto.
export const ICONOS_CONSEJO = {
  Hoja: Leaf,
  Reloj: Clock,
  Bolsa: ShoppingBag,
  Alerta: AlertTriangle,
  Reciclaje: Recycle,
  Tacho: Trash2,
  Agua: Droplets,
  Caja: Package,
  Idea: Lightbulb,
}

export const iconoConsejo = nombre => ICONOS_CONSEJO[nombre] || Lightbulb
