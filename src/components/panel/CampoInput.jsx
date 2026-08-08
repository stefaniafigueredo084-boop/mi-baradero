import ImagenInput from './ImagenInput'

// Renderiza el input correcto según el "type" declarado en la
// definición de campo (ver src/data/panelCampos.js).
export default function CampoInput({ campo, valor, onChange }) {
  const base = 'input-field'

  if (campo.type === 'image') {
    return <ImagenInput valor={valor} onChange={onChange} />
  }

  if (campo.type === 'textarea') {
    return (
      <textarea
        className={`${base} resize-none`}
        rows={3}
        placeholder={campo.placeholder}
        value={valor}
        onChange={e => onChange(e.target.value)}
      />
    )
  }

  if (campo.type === 'select') {
    return (
      <select className="select-field" value={valor} onChange={e => onChange(e.target.value)}>
        <option value="">Seleccioná...</option>
        {campo.options.map(op => (
          <option key={op} value={op}>{op}</option>
        ))}
      </select>
    )
  }

  if (campo.type === 'multiselect') {
    const seleccionados = valor || []
    return (
      <div className="flex flex-wrap gap-2">
        {campo.options.map(op => {
          const activo = seleccionados.includes(op)
          return (
            <button
              key={op}
              type="button"
              onClick={() => onChange(activo ? seleccionados.filter(v => v !== op) : [...seleccionados, op])}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${
                activo ? 'bg-verde text-white border-verde' : 'bg-white text-gray-600 border-gray-200 hover:border-verde'
              }`}
            >
              {op}
            </button>
          )
        })}
      </div>
    )
  }

  if (campo.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2.5 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={!!valor}
          onChange={e => onChange(e.target.checked)}
          className="w-5 h-5 accent-verde"
        />
        <span className="text-base text-gray-700">{campo.checkboxLabel || 'Sí'}</span>
      </label>
    )
  }

  if (campo.type === 'color') {
    return (
      <input
        type="color"
        className="h-[52px] w-24 rounded-2xl border-2 border-gray-200 cursor-pointer"
        value={valor}
        onChange={e => onChange(e.target.value)}
      />
    )
  }

  return (
    <input
      type={campo.type === 'number' ? 'number' : 'text'}
      className={base}
      placeholder={campo.placeholder}
      value={valor}
      onChange={e => onChange(campo.type === 'number' ? e.target.value.replace(/[^\d]/g, '') : e.target.value)}
    />
  )
}
