/**
 * carril.ts
 * Carril horizontal de la página de servicios.
 *
 * - Escritorio con movimiento: el CSS fija el marco (sticky) desde la primera
 *   pintura. Aquí solo se calcula cuánto debe recorrer la pista (--recorrido);
 *   el CSS alarga la sección esa distancia y desplaza la pista con --p.
 * - Móvil o sin movimiento: la pista es un scroll horizontal nativo con
 *   ajuste por tarjeta. Con mouse, además, se puede arrastrar.
 */

import { programarCuadro } from '../nucleo/bucle';
import { hayMovimiento } from '../nucleo/preferencias';

/** Debe coincidir con la media query de CarrilDeServicios.astro. */
const ESCRITORIO = '(min-width: 60rem)';

export function iniciarCarril(): void {
  const carril = document.querySelector<HTMLElement>('[data-carril]');
  const pista = carril?.querySelector<HTMLElement>('[data-carril-pista]');
  if (!carril || !pista) return;

  activarArrastre(pista);

  const escritorio = window.matchMedia(ESCRITORIO);

  const ajustar = (): void => {
    const fijado = hayMovimiento() && escritorio.matches;
    // Distancia horizontal que sobra: es lo que la pista debe recorrer.
    const recorrido = fijado ? Math.max(pista.scrollWidth - window.innerWidth, 0) : 0;
    carril.style.setProperty('--recorrido', `${recorrido}px`);
    programarCuadro();
  };

  escritorio.addEventListener('change', ajustar);
  window.addEventListener('resize', ajustar);
  ajustar();
}

/** Arrastre con mouse dentro del carril (en táctil ya existe el gesto nativo). */
function activarArrastre(pista: HTMLElement): void {
  let activo = false;
  let inicioX = 0;
  let inicioScroll = 0;

  pista.addEventListener('pointerdown', (evento) => {
    if (evento.pointerType !== 'mouse') return;
    activo = true;
    inicioX = evento.clientX;
    inicioScroll = pista.scrollLeft;
    pista.classList.add('arrastrando');
  });

  pista.addEventListener('pointermove', (evento) => {
    if (!activo) return;
    pista.scrollLeft = inicioScroll - (evento.clientX - inicioX) * 1.25;
  });

  const soltar = (): void => {
    activo = false;
    pista.classList.remove('arrastrando');
  };

  ['pointerup', 'pointerleave', 'pointercancel'].forEach((tipo) =>
    pista.addEventListener(tipo, soltar)
  );
}
