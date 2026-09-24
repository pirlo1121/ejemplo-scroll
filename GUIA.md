# Guía de arquitectura — Sitio JAPH en Astro

Este documento explica **cómo está construido el cliente** y **por qué**. Léelo antes
de tocar el código: cada decisión responde a cuatro prioridades, en este orden:

1. **Fluidez**: el scroll nunca se traba, tampoco en un celular de gama media.
2. **Rendimiento**: cada página envía solo el JavaScript que usa.
3. **Accesibilidad**: todo el contenido se lee sin animaciones, sin JavaScript y
   con "reducir movimiento" activado.
4. **Código limpio**: un archivo, una responsabilidad; nombres que se explican
   solos; comentarios que cuentan el *porqué*, no el *qué*.

---

## 1. Stack

| Pieza | Uso | Por qué esta y no otra |
|---|---|---|
| **Astro 7** (salida estática) | Base del sitio | Genera HTML en el build. Sin framework de UI en el navegador: solo viaja el JS que cada componente pide. |
| **TypeScript estricto** | Scripts y datos | `strict` + `noUncheckedIndexedAccess` + `noUnused*`. `astro check` corre antes de cada build. |
| **Motor de scroll propio** (`scripts/nucleo/bucle.ts`) | Todo lo que se mueve con el scroll | Un solo `requestAnimationFrame` por página, que primero lee y luego escribe. Pesa ~0,5 KB. Sustituye a GSAP + ScrollTrigger (~70 KB), que aquí no aportaba nada que este motor no cubra. Si algún día hace falta una línea de tiempo compleja, GSAP se importa **solo** en ese componente. |
| **Lenis** | Scroll suave con rueda o trackpad | Solo con puntero fino y sin "reducir movimiento". En táctil se deja el scroll nativo, que ya es el más fluido posible. |
| **Canvas 2D** | Escena de partículas de la portada | Da volumen con una proyección en perspectiva, sin Three.js. Llega en diferido (1,6 KB) y se omite en equipos modestos. |
| **API de fuentes de Astro** (`fontProviders.fontsource()`) | Sora, Instrument Serif, Instrument Sans | Descarga las fuentes en el build y las sirve desde el propio dominio (sin Google Fonts en cada visita), precarga las críticas y genera respaldos con métricas ajustadas para que el texto no salte. |
| **Prefetch de Astro** | Navegación | La página siguiente se descarga al pasar el cursor o tocar el enlace. |
| **View Transitions nativas** (CSS `@view-transition`) | Paso entre páginas | Fundido entre páginas sin convertir el sitio en SPA y sin JavaScript. Donde no hay soporte, se navega normal. |
| **Prettier + `astro check`** | Calidad | Formato uniforme y verificación de tipos. |

El backend (`../server`, Express + MongoDB) **no cambia**.

---

## 2. Estructura de carpetas

```
client/
├─ astro.config.mjs        Puerto, URLs, prefetch, fuentes, variables de entorno, HTML
├─ tsconfig.json           TypeScript estricto y alias @/ → src/
├─ .env.example            PUBLIC_API_URL (opcional)
├─ .prettierrc.mjs
├─ public/                 Se copia tal cual: favicon.svg
└─ src/
   ├─ config/
   │  └─ sitio.ts           Nombre, descripción, navegación, correo, WhatsApp, redes
   ├─ datos/                Todo el contenido editable, tipado y sin HTML
   │  ├─ servicios.ts        Los 7 servicios (id sincronizado con el servidor)
   │  ├─ proceso.ts          Las 4 fases
   │  ├─ proyectos.ts        Filtros, portafolio, destacados y caso en detalle
   │  ├─ testimonios.ts
   │  ├─ cifras.ts           Números de la portada y de "Nosotros"
   │  ├─ planes.ts           Modelos de trabajo
   │  ├─ preguntas.ts        Preguntas de servicios y de contacto
   │  └─ nosotros.ts         Principios, línea de tiempo y equipo
   ├─ layouts/
   │  ├─ Base.astro          <html>, <head>, capas, cabecera, menú, pie y núcleo de scripts
   │  └─ Legal.astro         Índice lateral + aviso de plantilla (privacidad, términos)
   ├─ components/
   │  ├─ estructura/         Cabecera, MenuMovil, PieDePagina, CapasAmbientales, Seo
   │  ├─ ui/                 Piezas sin lógica: Boton, TituloEnLineas, Rotulo,
   │  │                      CabeceraDeSeccion, NotaEjemplo, SelloEjemplo,
   │  │                      IconoDeServicio, Acordeon
   │  ├─ compartidos/        Piezas con comportamiento que usan varias páginas: Contador
   │  ├─ portada/            Un componente por capítulo de la historia, más Escena
   │  │                      e IndiceDeCapitulos
   │  ├─ servicios/          CarrilDeServicios, Planes
   │  ├─ proyectos/          IndiceDeProyectos, TarjetaDeProyecto, CasoDestacado
   │  ├─ nosotros/           Retrato, Metricas, Principios, LineaDeTiempo, Equipo
   │  └─ contacto/           FormularioDeContacto, Campo, Canales, PreguntasFrecuentes
   ├─ pages/                Una ruta por archivo; solo componen componentes
   │  index · servicios · proyectos · nosotros · contacto · privacidad · terminos · 404
   ├─ scripts/
   │  ├─ nucleo/             Se carga en TODAS las páginas (desde Base.astro)
   │  │  ├─ iniciar.ts        Punto de entrada: arranca cada módulo aislado
   │  │  ├─ bucle.ts          El único bucle de scroll (tareas leer/escribir)
   │  │  ├─ progreso.ts       data-progreso → variable CSS --p
   │  │  ├─ preferencias.ts   ¿Movimiento? ¿Puntero fino? ¿Equipo capaz?
   │  │  ├─ matematica.ts     limitar, suavizar, mezclar
   │  │  ├─ desplazamiento.ts Lenis y saltos a anclas
   │  │  ├─ revelado.ts       data-revelar y titulares en líneas
   │  │  ├─ navegacion.ts     Barra de progreso y cabecera condensada
   │  │  ├─ menu.ts           Menú móvil accesible
   │  │  └─ cursor.ts         Cursor a medida, magnetismo y brillo
   │  ├─ funciones/          Solo en las páginas que las usan
   │  │  └─ contadores, parallax, carril, filtros, indice-legal
   │  ├─ historia/           Narrativa de la portada
   │  │  ├─ manifiesto.ts, orbita.ts, proceso.ts, capitulos.ts
   │  │  └─ escena/          cargador.ts (decide y conecta), escena.ts (dibuja), formas.ts
   │  └─ contacto/
   │     ├─ api.ts            Única función que llama a fetch
   │     ├─ reglas.ts         Validación (espejo de la del servidor)
   │     └─ formulario.ts     Interfaz del formulario
   ├─ styles/
   │  ├─ tokens.css          Colores, tipografía, escala, ritmo, curvas y capas (z-index)
   │  └─ base.css            Reset, tipografía, maquetación, revelados, accesibilidad
   └─ utilidades/
      └─ rutas.ts            ¿Es este enlace la página actual? (se resuelve en el build)
```

Importa siempre con el alias: `import { servicios } from '@/datos/servicios'`.

### Cómo fluye todo

```
datos/*.ts ──► components/**/*.astro ──► pages/*.astro ──► HTML estático (dist/)
                      │
                      └─ <script> propio ──► scripts/**  (solo si el componente lo necesita)
```

- **Los datos no saben de HTML** y **los componentes no guardan contenido**:
  cambiar un texto nunca obliga a tocar marcado.
- **Cada componente trae su comportamiento.** `CarrilDeServicios.astro` importa
  `funciones/carril.ts` en su `<script>`; una página sin carril no descarga ese
  código. Astro agrupa y deduplica los scripts.
- **Lo que no necesita JavaScript no lo usa**: los titulares se dividen en líneas
  y el manifiesto en cláusulas **en el servidor**; el acordeón es
  `<details>`; la página actual se marca con `aria-current` en el build.

---

## 3. El motor de scroll

Todo lo que se mueve con el scroll pasa por `scripts/nucleo/bucle.ts`:

```ts
registrarTarea({
  leer(alto)  { /* solo lecturas: getBoundingClientRect, scrollY… */ },
  escribir(v) { /* solo escrituras: style.setProperty, classList… */ }
});
```

En cada cuadro se ejecutan **primero todas las lecturas y después todas las
escrituras**. Mezclarlas obliga al navegador a recalcular el layout varias veces
por cuadro ("layout thrashing"), que es la causa más común de un scroll trabado.
`elementosCercanos()` limita las mediciones a lo que está cerca de la pantalla.

### La variable `--p`

`progreso.ts` escribe `--p` (de 0 a 1) en cada elemento con `data-progreso`.
**El CSS decide qué hacer con ese número**: el JavaScript nunca anima
propiedades directamente.

| `data-progreso` | 0 cuando… | 1 cuando… | Se usa en |
|---|---|---|---|
| `fija` | la sección alta llega arriba | su marco *sticky* se suelta | Manifiesto, carril de servicios (la órbita lo mide con `medirProgreso`) |
| `salida` | la pieza está arriba del todo | ya salió por arriba | Héroe |
| `entrada` | asoma por abajo | llega al 35 % superior | Proyectos destacados |
| `recorrido` | su borde superior cruza el 55 % de la pantalla | lo cruza el inferior | Línea del proceso |

### La escena de la portada

Cada capítulo declara su figura con `data-escena`: `nube`, `esfera`,
`constelacion`, `rejilla`, `onda` o `anillo` (ver `escena/formas.ts`). El
cargador calcula en qué punto de la historia está el centro de la pantalla y la
escena interpola partícula por partícula entre dos figuras.

### Los dos efectos protagonistas

**Manifiesto — "a través de la O"** (`portada/Manifiesto.astro`). La palabra
gigante *ecosistema* tiene la O dibujada como un anillo, cuyo hueco enmarca la
esfera de partículas. Al bajar, la cámara vuela a través de la O y del otro
lado aparece el manifiesto, que se entinta cláusula por cláusula. Todo el guion
está en el CSS, calculado a partir de `--p`:

| Tramo de `--p` | Qué pasa | Variable |
|---|---|---|
| 0,06 – 0,56 | Zoom al cubo (×70) hacia el anillo, que se desplaza al centro | `--t` |
| 0,42 – 0,56 | El manifiesto llega desde el fondo | `--r` |
| 0,50 – 0,95 | Cada cláusula se llena de tinta, con un borde cian | `--q` |

`historia/manifiesto.ts` solo mide, al cargar y al redimensionar, dónde está el
anillo (`--origen-*`, `--hacia-*`). La palabra no lleva `will-change` a
propósito: congelaría la capa a su tamaño inicial y el anillo se vería pixelado
al ampliarlo.

**Servicios — "órbita"** (`portada/OrbitaDeServicios.astro`). Los siete
servicios forman un anillo 3D, igual que los siete cúmulos de partículas de la
escena. `historia/orbita.ts` convierte el scroll en `--giro` (de 0 a 6, en
"fichas"), con una pausa en cada servicio: en cada tramo solo gira el 40 %
central. El CSS pone cada ficha en el anillo
(`rotateY(i × 360°/7) translateZ(radio)`) y usa `cos()` para atenuar las fichas
según lo lejos que estén del frente.

### Reglas de oro del movimiento

- Animar **solo `transform` y `opacity`** (y `clip-path` en piezas pequeñas).
  Nunca `top`, `height`, `margin` ni `filter` durante el scroll.
- **Secciones fijas con `position: sticky`** de CSS, no con JavaScript.
- Nada de `backdrop-filter` ni `blur` sobre elementos fijos o que se mueven: la
  cabecera usa un fondo casi opaco.
- El margen para la cabecera fija en los saltos a anclas lo pone
  `scroll-padding-top` (en `base.css`); lo respetan Lenis y el scroll nativo.
- El lienzo se **pausa** en segundo plano y bajo el pie de página.

---

## 4. Estilos

- **`tokens.css`** es la única fuente de colores, tipografías, escala, curvas y
  capas (`--capa-*`). Un componente no escribe un color literal si hay token.
- **`base.css`**: reset, tipografía, utilidades de maquetación compartidas
  (`.envoltura`, `.seccion`, `.portada-pagina`, `.plomo`, `.malla`…), revelados
  y accesibilidad.
- **Estilos de componente en el `<style>` de cada `.astro`**: Astro los aísla,
  así que las clases pueden ser cortas (`.pie`, `.visual`) sin chocar.
- **`:global()` solo en tres casos**: la clase de estado de `<html>`, el marcado
  que llega por un slot (páginas legales) y las clases que se pasan a otro
  componente.

### Clase de estado en `<html>`

Un script mínimo en el `<head>` de `Base.astro` (la única excepción a "sin
scripts en línea") añade `.movimiento` **antes de la primera pintura** si hay
JavaScript y no se pidió reducir movimiento. Así el diseño nunca salta.

**Regla:** todo efecto de scroll se escribe bajo `:global(.movimiento)`. Sin esa
clase, la página es un documento estático, completo y legible. Otras clases que
aparecen solas: `sin-escena` (no se dibuja el lienzo) y `lenis` (la pone Lenis).

### Excepciones justificadas

- **Variables CSS como dato**: `style={{ '--i': i }}` para pasar el índice de una
  ficha. Es un dato, no un estilo; el estilo sigue en el CSS.
- **`set:html`** solo en textos escritos por el equipo que llevan `<em>`
  (titulares) o en los iconos SVG. Nunca con contenido de usuarios.

### Espacios en el HTML

Desde Astro 7, el HTML sigue por defecto las reglas de espacios de JSX, que
borran el espacio entre un texto y un enlace escritos en líneas distintas. Como
el sitio tiene mucho texto corrido, `astro.config.mjs` usa
`compressHTML: true` (compresión sin pérdida).

---

## 5. Rendimiento

Medido sobre el build (`npm run build`), JavaScript inicial comprimido con gzip:

| Página | Objetivo | Medido | Qué lleva |
|---|---|---|---|
| Legales, 404 | < 12 KB | 9,3–9,6 KB | Núcleo (incluye Lenis) |
| Servicios, Proyectos, Nosotros | < 12 KB | 9,8–10,2 KB | Núcleo + su función |
| Contacto | < 16 KB | 11,3 KB | Núcleo + validación + API |
| Portada | < 20 KB | 13,3 KB | Núcleo + historia. La escena (1,6 KB) llega después, en diferido |

Fuentes: 144 KB en `woff2` en total, servidas desde el propio dominio; solo se
precargan las de titulares y texto.

Prácticas que lo sostienen:

- **Carga diferida de lo pesado**: la escena se importa con `import()` durante
  `requestIdleCallback`; nunca compite con la primera pintura.
- **Detección de capacidad** (`preferencias.ts`): con ahorro de datos, ≤ 2 GB de
  memoria o ≤ 2 núcleos no hay lienzo; en táctiles o pantallas estrechas se
  dibujan menos partículas y con menor densidad de píxeles.
- **Imágenes** (cuando existan): `<Image>` de `astro:assets` ya está conectado
  en `TarjetaDeProyecto` y `ProyectosDestacados`: genera AVIF/WebP, varios
  tamaños y carga diferida.
- **CSS por página**: Astro solo incluye los estilos de los componentes usados.

Mídelo en un **Android de gama media real** o con Lighthouse en modo móvil y
CPU ralentizada ×4. El escritorio engaña.

---

## 6. Accesibilidad

- `prefers-reduced-motion`: sin secciones fijas, sin Lenis, sin cursor a medida,
  sin parallax ni contadores; el lienzo queda como imagen estática y todo el
  contenido se ve desde el inicio.
- La palabra gigante del manifiesto es decorativa (`aria-hidden`); el
  manifiesto es un párrafo normal, dividido en cláusulas solo para el estilo.
- La órbita de servicios es, en el HTML, una lista ordenada: los lectores de
  pantalla leen los siete servicios en orden, sin depender del giro.
- Menú móvil `inert` mientras está cerrado; al abrirse atrapa el foco y se cierra
  con `Escape`, devolviendo el foco al botón.
- Los saltos a anclas mueven también el foco.
- Formularios: cada error enlazado con `aria-describedby` desde el HTML; avisos
  con `aria-live`. El filtro de proyectos anuncia cuántos quedaron.
- "Saltar al contenido", foco visible y contraste AA sobre el fondo oscuro.

---

## 7. Convenciones de código

- **Idioma**: nombres de dominio en español, como el resto del proyecto
  (`OrbitaDeServicios`, `registrarTarea`). Inglés solo donde lo impone la
  herramienta (`pages/`, `layouts/`, `components/`).
- **Componentes** en `PascalCase.astro`; **scripts y datos** en `kebab-case.ts`.
- **Props tipadas** con `interface Props` en cada componente.
- **Una responsabilidad por archivo.** Si un script necesita "y además…", son
  dos archivos.
- **Funciones `iniciarX()` que salen en silencio** si su elemento no está en la
  página. Las que comparten varios componentes (`iniciarParallax`,
  `iniciarContadores`) son idempotentes.
- **Nunca un `addEventListener('scroll')` propio**: se usa `registrarTarea`.
- **Comentarios**: explican decisiones y restricciones, no repiten el código.
- Antes de subir cambios: `npm run format` y `npm run check`.

---

## 8. Contenido de ejemplo

Lo provisional lleva `ejemplo: true` en `src/datos/` o en `config/sitio.ts`, y se
muestra con un sello o una nota en coral. Al poner `ejemplo: false`, el aviso
desaparece solo.

| Qué | Dónde |
|---|---|
| Proyectos y caso destacado | `datos/proyectos.ts` (+ imágenes en `src/assets/proyectos/`) |
| Cifras | `datos/cifras.ts` |
| Testimonios | `datos/testimonios.ts` |
| Equipo e historia | `datos/nosotros.ts` (`hitosEjemplo` para la línea de tiempo) |
| Precios | `datos/planes.ts` |
| Correo, WhatsApp, redes | `config/sitio.ts` |
| Foto del estudio | `components/nosotros/Retrato.astro` |
| Textos legales | `pages/privacidad.astro`, `pages/terminos.astro` |

---

## 9. Conexión con la API

- `scripts/contacto/api.ts` es el único archivo que llama a `fetch`
  (`POST /api/contact`, `GET /api/health`).
- La URL sale de `PUBLIC_API_URL` (validada con `astro:env` en
  `astro.config.mjs`). Sin definirla: si el sitio se abre en `localhost` o
  `127.0.0.1` usa `http://localhost:4000`; publicado, el mismo dominio.
- Los `id` de `datos/servicios.ts` deben coincidir con el `enum` de
  `server/src/models/Contact.js`. Si agregas un servicio, actualiza ambos.
- El sitio corre en el puerto **5173**. `CLIENT_URL` en `server/.env` debe ser
  exactamente ese origen (`http://localhost:5173`), o el servidor rechazará los
  envíos por CORS.

---

## 10. Recetas

**Agregar un capítulo a la portada**
1. Crea `components/portada/MiCapitulo.astro` con
   `<section id="…" data-escena="onda">`.
2. Si algo debe moverse con el scroll, añade `data-progreso="…"` y usa `--p` en
   su `<style>` bajo `:global(.movimiento)`.
3. Agrégalo en `pages/index.astro` (el orden del archivo es el de la historia) y
   en la lista `capitulos` de esa misma página.

**Agregar un proyecto**: un objeto más en `datos/proyectos.ts`.

**Agregar una página**: `pages/nueva.astro` con `<Base>`, y el enlace en
`navegacion` de `config/sitio.ts`.

**Agregar un comportamiento**: un archivo en `scripts/funciones/` que exporte
`iniciarX()`, importado desde el `<script>` del componente que lo necesita. Si
reacciona al scroll, usa `registrarTarea` de `nucleo/bucle.ts`.

---

## 11. Comandos

```bash
npm install          # una vez (Node 22.12 o superior)
npm run dev          # http://localhost:5173 con recarga en vivo
npm run check        # tipos y diagnósticos de Astro
npm run build        # verifica tipos y genera dist/
npm run preview      # sirve dist/ para probar el resultado final
npm run format       # formatea con Prettier
```

Si `astro dev` o `astro preview` quedan corriendo en segundo plano, se detienen
con `npx astro dev stop` o `npx astro preview stop`.

**Despliegue**: `npm run build` genera `dist/`, un sitio estático. Súbelo a
Cloudflare Pages, Netlify o Vercel (comando `npm run build`, carpeta `dist`).
Si la API vive en otro dominio, define `PUBLIC_API_URL` en el hosting.
