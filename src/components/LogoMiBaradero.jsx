export default function LogoMiBaradero({ size = 'md', theme = 'color' }) {
  const heights = { sm: 32, md: 44, lg: 64, xl: 90 }
  const h = heights[size] || heights.md

  const isWhite = theme === 'white'

  return (
    <div className="flex items-center gap-3">
      <div
        className="rounded-xl shrink-0 flex items-center justify-center"
        style={{
          background: 'white',
          padding: h * 0.1,
          boxShadow: isWhite
            ? '0 4px 20px rgba(0,0,0,0.25)'
            : '0 2px 8px rgba(0,0,0,0.10)',
        }}
      >
        <img
          src="/logo-mibaradero.png"
          alt="Mi Baradero"
          style={{ height: h, width: 'auto', display: 'block' }}
        />
      </div>

      <span
        className="font-poppins font-bold tracking-tight"
        style={{
          fontSize: h * 0.38,
          color: isWhite ? 'white' : '#0B6A2E',
        }}
      >
        Mi Baradero
      </span>
    </div>
  )
}
