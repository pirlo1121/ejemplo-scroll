/**
 * cargador.ts
 * Decide si la escena de partículas se dibuja, la carga cuando el navegador
 * está libre y la conecta con el scroll.
 *
 * - Equipo modesto o ahorro de datos: no se carga; queda el degradado de fondo.
 * - Reducir movimiento: se dibuja una sola imagen estática.
 * - Resto: escena animada, pausada en segundo plano y bajo el pie de página.
 */

import { registrarTarea } from '../../nucleo/bucle';
import { limitar } from '../../nucleo/matematica';
import { capacidadGrafica, hayMovimiento } from '../../nucleo/preferencias';
import { esNombreDeForma } from './formas';
import type { Escena } from './escena';

export function iniciarEscena(): void {
  const lienzo = document.querySelector<HTMLCanvasElement>('[data-escena-lienzo]');
  const capitulos = Array.from(document.querySelectorAll<HTMLElement>('[data-escena]'));
  const secuencia = capitulos.map((capitulo) => capitulo.dataset.escena).filter(esNombreDeForma);
  const capacidad = capacidadGrafica();

  if (!lienzo || !secuencia.length || secuencia.length !== capitulos.length || !capacidad) {
    marcarSinEscena();
    return;
  }

  const estatica = !hayMovimiento();

  const cargar = async (): Promise<void> => {
    try {
      // Import dinámico: el código de dibujo llega en su propio archivo, después.
      const { crearEscena } = await import('./escena');
      const escena = crearEscena(lienzo, {
        secuencia,
        particulas: estatica ? Math.round(capacidad.particulas * 0.6) : capacidad.particulas,
        dprMaximo: capacidad.dprMaximo,
        estatica
      });
      if (!escena) throw new Error('Canvas 2D no disponible');

      escena.actualizar(posicionEnLaHistoria(capitulos, window.innerHeight));
      lienzo.classList.add('esta-lista');

      if (!estatica) {
        registrarTarea({
          leer: (alto) => posicionEnLaHistoria(capitulos, alto),
          escribir: (posicion) => escena.actualizar(posicion)
        });
        pausarBajoElPie(escena);
      }
    } catch (error) {
      console.error('[escena] No pudo iniciarse:', error);
      marcarSinEscena();
    }
  };

  // Nunca compite con la primera pintura del contenido.
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(cargar, { timeout: 1200 });
  } else {
    setTimeout(cargar, 200);
  }
}

function marcarSinEscena(): void {
  document.documentElement.classList.add('sin-escena');
}

/** Cuando el pie de página cubre la pantalla, el lienzo deja de dibujar. */
function pausarBajoElPie(escena: Escena): void {
  const pie = document.querySelector('[data-pie]');
  if (!pie || !('IntersectionObserver' in window)) return;

  new IntersectionObserver(
    ([entrada]) => ((entrada?.intersectionRatio ?? 0) > 0.95 ? escena.pausar() : escena.reanudar()),
    { threshold: [0, 0.95] }
  ).observe(pie);
}

/**
 * Posición continua en la secuencia de capítulos, medida en el centro de la
 * pantalla: 3.5 es "a mitad de camino del capítulo 4 al 5". La transición
 * hacia la figura siguiente ocurre en el último 40 % de cada capítulo.
 */
function posicionEnLaHistoria(capitulos: HTMLElement[], alto: number): number {
  const centro = alto * 0.5;
  let posicion = 0;

  for (let i = 0; i < capitulos.length; i += 1) {
    const caja = capitulos[i]!.getBoundingClientRect();
    if (caja.top > centro) break;
    const avance = limitar((centro - caja.top) / Math.max(caja.height, 1));
    posicion = i + limitar((avance - 0.6) / 0.4);
  }

  return Math.min(posicion, capitulos.length - 1);
}
