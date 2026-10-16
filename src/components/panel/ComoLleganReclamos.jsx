import { ArrowRight } from 'lucide-react'
import { AREAS_RECLAMO, departamentoPorId } from '../../data/reclamosData'
import { labelSector } from '../../data/sectores'

const PASOS = [
  {
    titulo: 'El vecino lo envía',
    texto: 'Desde “Reclamos y Sugerencias” en la app: elige si es queja, reclamo, sugerencia o felicitación, el tema, y escribe qué pasó. Puede sumar ubicación y foto. No se puede enviar con malas palabras.',
  },
  {
    titulo: 'Se asigna solo al departamento',
    texto: 'Según el tema que eligió, el reclamo queda asignado al departamento que corresponde (ver la tabla de abajo).',
  },
  {
    titulo: 'Llega al panel como “Recibido”',
    texto: 'Aparece en la pestaña del sector de ese departamento, dentro de “Reclamos de vecinos”. Atención al Vecino y los administradores ven todos los reclamos en la pestaña Reclamos.',
  },
  {
    titulo: 'Se atiende y se responde',
    texto: 'El empleado lo pasa a “En proceso” y después a “Resuelto”, y puede dejarle una respuesta. Si no le corresponde a su área, lo deriva a otro departamento.',
  },
  {
    titulo: 'El vecino ve el resultado',
    texto: 'En “Mis reclamos”, desde el mismo teléfono, ve el estado, qué departamento lo atiende y la respuesta.',
  },
]

const dondeLoVe = sector => (sector === 'reclamos' ? 'Atención al Vecino (pestaña Reclamos)' : `Pestaña ${labelSector(sector)}`)

export default function ComoLleganReclamos() {
  return (
    <div className="space-y-6">
      <ol className="space-y-3">
        {PASOS.map((paso, i) => (
          <li key={paso.titulo} className="flex gap-3">
            <span className="w-7 h-7 rounded-full bg-primario text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{paso.titulo}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{paso.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <div>
        <h4 className="font-bold font-poppins text-gray-800 mb-1">¿Qué departamento se encarga de cada tema?</h4>
        <p className="text-sm text-gray-500 mb-3">
          Los departamentos que no tienen un sector propio en el panel los recibe Atención al Vecino, que los coordina con esa área.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-3 font-semibold">Tema que elige el vecino</th>
                <th className="py-2 pr-3 font-semibold">Departamento</th>
                <th className="py-2 font-semibold">Dónde lo ve en el panel</th>
              </tr>
            </thead>
            <tbody>
              {AREAS_RECLAMO.map(area => {
                const depto = departamentoPorId(area.departamento)
                return (
                  <tr key={area.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2.5 pr-3 text-gray-700">{area.label}</td>
                    <td className="py-2.5 pr-3 font-semibold text-gray-800">
                      <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5 text-primario shrink-0" /> {depto.label}</span>
                    </td>
                    <td className="py-2.5 text-gray-500">{dondeLoVe(depto.sector)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
