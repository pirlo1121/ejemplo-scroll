/**
 * manifiesto.ts
 * Entinta cada cláusula del manifiesto ([data-clausula]) cuando cruza la
 * línea de lectura, a un 30 % del borde inferior de la pantalla. La
 * transición la hace el CSS con .esta-entintada; una vez entintada, se queda.
 *
 * Si varias cláusulas llegan en el mismo cuadro (scroll rápido o salto a un
 * ancla), se entintan escalonadas, en orden de lectura.
 */

import { hayMovimiento } from '../nucleo/preferencias';

const ESCALON = 0.14;

export function iniciarManifiesto(): void {
  const clausulas = Array.from(document.querySelectorAll<HTMLElement>('[data-clausula]'));
  if (!clausulas.length || !hayMovimiento()) return;

  const entintar = (clausula: HTMLElement, orden: number): void => {
    clausula.style.setProperty('--retardo', `${orden * ESCALON}s`);
    clausula.classList.add('esta-entintada');
  };

  if (!('IntersectionObserver' in window)) {
    clausulas.forEach(entintar);
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      const listas = entradas
        .filter(
          // También las que ya quedaron por encima (se llegó por un ancla).
          (entrada) => entrada.isIntersecting || entrada.boundingClientRect.bottom < 0
        )
        .map((entrada) => entrada.target as HTMLElement)
        .sort((a, b) => clausulas.indexOf(a) - clausulas.indexOf(b));

      listas.forEach((clausula, orden) => {
        entintar(clausula, orden);
        observador.unobserve(clausula);
      });
    },
    { threshold: 0.6, rootMargin: '0px 0px -30% 0px' }
  );

  clausulas.forEach((clausula) => observador.observe(clausula));
}
