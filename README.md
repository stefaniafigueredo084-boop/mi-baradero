# Mi Baradero

Servicios, eventos y avisos para los vecinos de **Baradero, Buenos Aires**, en una sola app web que se puede instalar en el celular.

> Proyecto de la **E.S.T. N°1 Vuelta de Obligado**. No es el sitio oficial de la Municipalidad de Baradero.

Sitio publicado: **https://mi-baradero.web.app**

Integrantes: Stefania Figueredo, Celeste Weiss, Roman Van Loo y Wanda Garcia.

## Qué hace

**Para los vecinos**

- **Inicio**: buscador, atajos y "Hoy en Baradero", con la próxima combi y qué residuo se recolecta hoy en tu zona. También muestra las últimas noticias y los eventos.
- **Combi Municipal**: horarios, alertas y demoras, recorrido y **Mi Pase**. En Mi Pase se pide el pasaje y, cuando el municipio confirma el pago, se genera un QR para subir. Hay tarifas reducidas para estudiantes y jubilados, y viaje sin cargo con CUD, después de verificar el documento.
- **Residuos**: calendario semanal, estado del camión y **Tu zona**, con el horario de recolección de tu barrio y si hoy ya pasó.
- **Eventos y noticias**: agenda, noticias publicadas desde el panel y "Agregar a mi calendario" en los eventos con fecha exacta.
- **Puntos Verdes**: mapa real (OpenStreetMap), materiales que recibe cada punto y "Cómo llegar".
- **Reclamos y sugerencias**: con foto opcional. Cada vecino sigue el estado y la respuesta de los suyos en "Mis reclamos".
- **Mi Perfil**: cuenta opcional con Google o email, y accesibilidad (modo oscuro, tamaño de letra y lector de voz).
- **Tachín**: la mascota que muestra cómo se usa la app.
- **App instalable y sin conexión**: lo que ya se vio (horarios, calendario, eventos, el pase) se puede abrir sin internet.

**Panel de trabajadores** (`/panel-trabajadores`)

Cada cuenta tiene un rol: **admin** o **sector**. Cada sector ve solo lo suyo:

| Sector | Qué hace |
|---|---|
| Combi | Horarios, alertas, parada actual de la combi, confirmar pagos y verificar categorías |
| Choferes | Escanear el QR de cada pasajero al subir (solo sus horarios) |
| Residuos | Calendario, zonas, estado del camión, avisos y consejos |
| Eventos | Eventos (con fecha exacta opcional), noticias y avisos |
| Puntos Verdes | Puntos de reciclaje, con latitud y longitud para el mapa |
| Reclamos (Atención al Vecino) | Todos los reclamos: estado, respuesta, derivar a otro departamento y buscar por código (#K3F9QA) |

El admin además crea cuentas y ve el historial de actividad y la lista de vecinos.

## Tecnologías

- **React 18** + **Vite 4**, **React Router 6**, **Tailwind CSS 3**, íconos de **Lucide**
- **Firebase**: Authentication (Google, email y **Anónimo**), Firestore con caché local en el teléfono, y Hosting
- **Leaflet** + **react-leaflet** con mosaicos de OpenStreetMap
- **vite-plugin-pwa** (Workbox) para instalar la app y usarla sin conexión
- **html5-qrcode** para el escáner y **qrcode.react** para el QR del pase
- **ESLint 9**

## Cómo correrlo

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint     # revisa el código
npm run build    # genera dist/
```

## Firebase

El proyecto es `mi-baradero` (ver `.firebaserc`). `firebase-tools` ya viene en las dependencias, así que se usa con `npx`.

**Publicar el sitio, las reglas y los índices juntos.** Siempre van juntos, para que no quede un rato en que el sitio y las reglas no coinciden:

```bash
npx firebase login   # solo la primera vez
npm run build && npx firebase deploy --only hosting,firestore:rules,firestore:indexes
```

Para revisar las reglas sin publicarlas: `npx firebase deploy --only firestore:rules --dry-run`.

**Cosas que tienen que estar activadas en la consola de Firebase**

- Authentication → Método de acceso: **Google**, **Correo/contraseña** y **Anónimo**.

**Cómo están protegidos los datos** (`firestore.rules`)

- Cada visitante entra con una sesión anónima y tiene su propio `uid`. Si después entra con Google o crea una cuenta, la sesión se vincula y conserva el mismo `uid`.
- Perfiles, pases, pasajes y reclamos guardan ese `uid`. Solo los lee su dueño o el sector que los atiende.
- Pasajes: el id tiene que ser `pasajeroId_horarioId_fecha` y el importe tiene que ser la tarifa. Si cambian las tarifas, hay que cambiarlas en `src/utils/pase.js` **y** en `firestore.rules`.
- Reclamos: tienen tamaños máximos. El sector solo puede cambiar el estado, la respuesta y el departamento.
- El contenido del panel (eventos, noticias, horarios…) se lee sin restricciones y solo lo escribe su sector o el admin.

**Colecciones principales**: `vecinos`, `pasajeros`, `pasajes`, `viajes` (con `embarques`), `reclamos`, `eventos`, `noticias`, `horariosCombi`, `alertasCombi`, `zonasResiduos`, `consejosResiduos`, `puntosVerdesExtra`, `config`, `trabajadores` e `historial`.

## Datos honestos

- El camión de residuos **no tiene GPS**: la app muestra el horario estimado de cada zona y lo dice así.
- La posición de la combi es la última parada que marca un empleado desde el panel. Si nadie la marcó, se muestra un recorrido estimado sobre un mapa ilustrativo.
- Las coordenadas de los Puntos Verdes salen del cruce de las calles de su dirección, calculado con OpenStreetMap. Si una esquina no se pudo ubicar, el punto no aparece en el mapa (sí en la lista) hasta que se carguen sus coordenadas desde el panel.

## Estructura

```
src/
├── components/   Header, BottomNav, Footer, HoyEnBaradero, Noticias, MapaPuntosVerdes,
│                 BotonCalendario, EstadoVacio, Esqueleto, Tachín, panel/ (secciones del panel)…
├── pages/        Home, CombiMunicipal, Residuos, Eventos, PuntosVerdes, Reclamos, Perfil,
│                 PanelTrabajadores, LoginTrabajadores
├── hooks/        datos en vivo de Firestore (useColeccion, useDocPropio, useReclamos,
│                 useResiduos, useHorariosCombi, useViaje…)
├── context/      sesión (AuthContext), accesibilidad y recorrido de Tachín
├── data/         datos fijos de respaldo y definición de los formularios del panel
├── utils/        tarifas y pases, residuos de hoy, calendario (.ics), imágenes, voz…
├── firebase.js   configuración, caché local y sesión anónima
└── styles/       Tailwind + modo oscuro
firestore.rules, firestore.indexes.json, firebase.json, vite.config.js (PWA)
```

## Colores: "Verde Tranqui"

Están definidos como tokens en `tailwind.config.js`:

| Token | Hex | Uso |
|---|---|---|
| `primario` | `#3D8B68` | botones, links, header |
| `primario-oscuro` | `#285E47` | franja superior, botones de texto |
| `secundario` | `#6AAE4E` | detalles (siempre con texto oscuro encima) |
| `acento` | `#F2B53E` | etiquetas y avisos (nunca como color de texto) |
| `tinta` | `#1D3328` | títulos y texto principal |
| `fondo-app` | `#F1F6F3` | fondo |

Tipografías: Poppins (títulos) e Inter (texto).
