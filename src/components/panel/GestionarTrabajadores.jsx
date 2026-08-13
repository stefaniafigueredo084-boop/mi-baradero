import { useState } from 'react'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { AlertTriangle, Ban, Loader2, Trash2, UserCheck, Users } from 'lucide-react'
import { auth, db } from '../../firebase'
import { useTrabajadores } from '../../hooks/useTrabajadores'
import { registrarHistorial } from '../../utils/historial'
import { labelSector } from '../../data/sectores'

// Lista de cuentas del panel, con dar de baja (reversible) y eliminar
// definitivamente (para cargas de prueba o cuentas mal creadas).
//
// "Eliminar definitivamente" NO borra el documento de Firestore — lo
// deja con rol "eliminado", que no coincide con ningún permiso. Borrar
// el documento de verdad tendría dos problemas: dejaría huérfanas las
// referencias a esa cuenta en el historial, y — más grave — la próxima
// vez que esa persona inicie sesión, el sistema la recrearía sola como
// administradora (así está pensado para que nadie quede afuera del
// panel la primera vez que se usa la app). Con el rol "eliminado" no
// pasa ninguna de las dos cosas.
export default function GestionarTrabajadores() {
  const { items, cargando } = useTrabajadores()
  const visibles = items.filter(t => t.rol !== 'eliminado')
  const propioUid = auth.currentUser?.uid

  const [procesando, setProcesando] = useState(null)
  const [confirmando, setConfirmando] = useState(null) // uid en confirmación de borrado

  const alternarActivo = async t => {
    const activoAhora = t.activo !== false
    setProcesando(t.id)
    try {
      await updateDoc(doc(db, 'trabajadores', t.id), { activo: !activoAhora })
      registrarHistorial({
        tipo: 'editar',
        seccion: 'usuarios',
        detalle: `${activoAhora ? 'Desactivada' : 'Reactivada'} la cuenta de ${t.email}`,
      })
    } finally {
      setProcesando(null)
    }
  }

  const eliminarDefinitivo = async t => {
    setProcesando(t.id)
    try {
      await updateDoc(doc(db, 'trabajadores', t.id), { rol: 'eliminado', activo: false, eliminadoEn: serverTimestamp() })
      registrarHistorial({ tipo: 'eliminar', seccion: 'usuarios', detalle: `Cuenta eliminada: ${t.email}` })
      setConfirmando(null)
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div className="mb-10">
      <h3 className="font-bold font-poppins text-lg text-gray-800 flex items-center gap-2 mb-1">
        <Users className="w-5 h-5 text-verde" /> Cuentas del panel
      </h3>
      <p className="text-gray-500 text-sm mb-5">
        Desactivar es reversible (se puede reactivar en cualquier momento). Eliminar es para cuentas que no hace falta conservar.
      </p>

      {cargando ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : visibles.length === 0 ? (
        <p className="text-gray-400 text-sm">Todavía no hay cuentas cargadas.</p>
      ) : (
        <div className="space-y-3">
          {visibles.map(t => {
            const activo = t.activo !== false
            const esUnoMismo = t.id === propioUid
            return (
              <div key={t.id} className="card p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{t.email}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="badge bg-azul/10 text-azul text-xs font-semibold px-2 py-0.5 rounded-full">
                        {t.rol === 'admin' ? 'Administrador general' : `Solo ${labelSector(t.sector)}`}
                      </span>
                      <span className={`badge text-xs font-semibold px-2 py-0.5 rounded-full ${activo ? 'bg-verde/10 text-verde' : 'bg-gray-100 text-gray-500'}`}>
                        {activo ? 'Activa' : 'Desactivada'}
                      </span>
                    </div>
                  </div>

                  {esUnoMismo ? (
                    <p className="text-xs text-gray-400 shrink-0">Esta es tu cuenta — no se puede modificar desde acá.</p>
                  ) : (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => alternarActivo(t)}
                        disabled={procesando === t.id}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-colors disabled:opacity-60 ${
                          activo ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-verde/10 text-verde hover:bg-verde/20'
                        }`}
                      >
                        {procesando === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : activo ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        {activo ? 'Desactivar' : 'Reactivar'}
                      </button>
                      <button
                        onClick={() => setConfirmando(t.id)}
                        disabled={procesando === t.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 font-semibold text-xs transition-colors disabled:opacity-60"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                    </div>
                  )}
                </div>

                {confirmando === t.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 bg-red-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-2xl">
                    <p className="text-xs text-red-600 flex items-start gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      Esto le saca el acceso para siempre (no es lo mismo que desactivar). ¿Confirmás eliminar la cuenta de {t.email}?
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmando(null)} className="btn-secondary !text-xs !py-1.5">Cancelar</button>
                      <button
                        onClick={() => eliminarDefinitivo(t)}
                        disabled={procesando === t.id}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs py-1.5 rounded-2xl transition-colors disabled:opacity-60"
                      >
                        {procesando === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Sí, eliminar definitivamente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
