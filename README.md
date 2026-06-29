# Mi Baradero — Plataforma Municipal Inteligente

Plataforma web municipal moderna para la ciudad de **Baradero, Buenos Aires**.

## Tecnologías

- **React 18** + **Vite**
- **Tailwind CSS** — estilos utility-first
- **React Router v6** — navegación SPA
- **Lucide React** — iconos modernos
- **Google Fonts** — Poppins + Inter

## Instalación y ejecución

```bash
cd mi-baradero
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## Estructura del proyecto

```
mi-baradero/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx        # Navegación sticky con menú móvil
│   │   ├── Footer.jsx        # Pie de página con info municipal
│   │   ├── ServiceCard.jsx   # Tarjeta de servicio reutilizable
│   │   └── QRModal.jsx       # Modal con QR de pasaje
│   ├── pages/
│   │   ├── Home.jsx          # Página principal con hero y tarjetas
│   │   ├── CombiMunicipal.jsx # Compra de pasajes + mapa en vivo
│   │   ├── Residuos.jsx      # Calendario + alertas por zona
│   │   ├── Eventos.jsx       # Eventos y noticias municipales
│   │   └── PuntosVerdes.jsx  # Mapa de puntos de reciclaje
│   ├── data/
│   │   ├── combiData.js      # Paradas, horarios, destinos
│   │   ├── residuosData.js   # Calendario, zonas, consejos
│   │   ├── eventosData.js    # Eventos y noticias
│   │   └── puntosVerdesData.js # Puntos de reciclaje
│   ├── hooks/
│   │   └── useCombiSimulation.js # Simulación en tiempo real
│   ├── styles/
│   │   └── index.css         # Estilos globales + Tailwind
│   ├── App.jsx               # Router principal
│   └── main.jsx              # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

## Paleta de colores

| Color         | Hex       |
|---------------|-----------|
| Verde         | `#1B8E3E` |
| Verde oscuro  | `#0B6A2E` |
| Azul          | `#1D8FE1` |
| Azul oscuro   | `#0057B8` |
| Amarillo      | `#F5C400` |
| Blanco        | `#FFFFFF` |

## Secciones

1. **Inicio** — Hero, estadísticas y accesos directos
2. **Combi Municipal** — Compra de pasajes con QR + seguimiento en tiempo real
3. **Recolección de Residuos** — Calendario semanal, alertas por zona, estado del camión
4. **Eventos y Noticias** — Agenda de eventos y novedades municipales
5. **Puntos Verdes** — Mapa de reciclaje con materiales aceptados

---
Municipalidad de Baradero © 2026
