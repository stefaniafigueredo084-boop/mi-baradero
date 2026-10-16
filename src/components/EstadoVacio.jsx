// Mensaje para cuando no hay nada que mostrar (sin resultados, lista
// vacía): Tachín acompaña el texto, así no queda un renglón gris suelto.
export default function EstadoVacio({ titulo, texto, children, compacto = false }) {
  return (
    <div className={`flex flex-col items-center text-center ${compacto ? 'py-4' : 'py-8'}`}>
      <img src="/tachin.png" alt="" className={`${compacto ? 'h-14 w-14' : 'h-20 w-20'} object-contain mb-2`} />
      {titulo && <p className="font-bold font-poppins text-tinta">{titulo}</p>}
      {texto && <p className="text-sm text-gray-500 max-w-sm mt-0.5">{texto}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
