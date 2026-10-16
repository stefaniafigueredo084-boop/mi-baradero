// Esqueleto de carga: bloques grises que laten en el lugar donde va a
// aparecer el contenido, en vez de un "Cargando..." de texto.
export default function Esqueleto({ filas = 3, alto = 'h-16' }) {
  return (
    <div className="space-y-3" role="status" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className={`${alto} rounded bg-gray-200 animate-pulse`} />
      ))}
    </div>
  )
}
