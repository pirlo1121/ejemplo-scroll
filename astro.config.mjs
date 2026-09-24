// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // El backend autoriza este origen en CLIENT_URL: no cambiarlo sin actualizar server/.env.
  server: { port: 5173 },

  // URLs limpias (/servicios) servidas desde archivos planos (servicios.html).
  trailingSlash: 'never',
  build: { format: 'file' },

  // Desde Astro 7 el HTML sigue por defecto las reglas de espacios de JSX, que
  // borran el espacio entre un texto y un enlace escritos en líneas distintas.
  // Este sitio tiene mucho texto corrido (páginas legales, formularios), así
  // que se usa la compresión sin pérdida: quita lo sobrante y conserva los
  // espacios que se ven.
  compressHTML: true,

  // La página siguiente se descarga al pasar el cursor o tocar un enlace.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  env: {
    schema: {
      // Opcional: sin definirla, api.ts usa localhost:4000 en desarrollo y el mismo dominio en producción.
      PUBLIC_API_URL: envField.string({ context: 'client', access: 'public', optional: true })
    }
  },

  // Las fuentes se descargan en el build y se sirven desde el propio dominio,
  // con fuentes de respaldo de métricas ajustadas para que el texto no salte.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Sora',
      cssVariable: '--fuente-display',
      weights: ['300 700'],
      styles: ['normal'],
      fallbacks: ['sans-serif']
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Instrument Serif',
      cssVariable: '--fuente-acento',
      weights: [400],
      styles: ['normal', 'italic'],
      fallbacks: ['serif']
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Instrument Sans',
      cssVariable: '--fuente-texto',
      weights: [400, 500, 600],
      styles: ['normal'],
      fallbacks: ['sans-serif']
    }
  ]
});
