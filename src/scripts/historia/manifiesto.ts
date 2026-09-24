/**
 * manifiesto.ts
 * El vuelo "a través de la O" lo hace el CSS con --p. Este script solo mide,
 * al cargar y al redimensionar, dónde queda el anillo dentro de la palabra:
 *
 *   --origen-x / --origen-y  centro del anillo: punto fijo del zoom
 *   --hacia-x / --hacia-y    distancia del anillo al centro de la pantalla,
 *                            para que la cámara lo lleve hasta ahí al acercarse
 *
 * Se usan offsetLeft/offsetTop, que ignoran las transformaciones: la medida
 * es la misma en cualquier punto del scroll.
 */

import { hayMovimiento } from '../nucleo/preferencias';

export function iniciarManifiesto(): void {
  const palabra = document.querySelector<HTMLElement>('[data-portal]');
  const anillo = palabra?.querySelector<HTMLElement>('[data-anillo]');
  if (!palabra || !anillo || !hayMovimiento()) return;

  const medir = (): void => {
    const centroX = anillo.offsetLeft + anillo.offsetWidth / 2;
    const centroY = anillo.offsetTop + anillo.offsetHeight / 2;

    palabra.style.setProperty('--origen-x', `${centroX}px`);
    palabra.style.setProperty('--origen-y', `${centroY}px`);
    palabra.style.setProperty('--hacia-x', `${palabra.offsetWidth / 2 - centroX}px`);
    palabra.style.setProperty('--hacia-y', `${palabra.offsetHeight / 2 - centroY}px`);
  };

  medir();
  window.addEventListener('resize', medir);
  // Con la fuente definitiva cambian los anchos de las letras.
  document.fonts?.ready.then(medir);
}
