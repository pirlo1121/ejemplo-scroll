/**
 * revelado.ts
 * Marca con .es-visible los elementos [data-revelar] y los titulares
 * [data-lineas] cuando entran en pantalla. El CSS (base.css) hace la
 * transición, y solo oculta el contenido si hay movimiento permitido.
 */

import { hayMovimiento } from './preferencias';

export function iniciarRevelado(): void {
  const piezas = Array.from(
    document.querySelectorAll<HTMLElement>('[data-revelar], [data-lineas]')
  );
  if (!piezas.length) return;

  if (!hayMovimiento() || !('IntersectionObserver' in window)) {
    piezas.forEach((pieza) => pieza.classList.add('es-visible'));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('es-visible');
        observador.unobserve(entrada.target);
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
  );

  for (const pieza of piezas) {
    // Los hermanos que entran juntos lo hacen escalonados.
    if (pieza.hasAttribute('data-revelar')) {
      const hermanos = Array.from(pieza.parentElement?.children ?? []).filter((hermano) =>
        hermano.hasAttribute('data-revelar')
      );
      pieza.style.setProperty('--retardo', `${Math.max(hermanos.indexOf(pieza), 0) * 0.08}s`);
    }
    observador.observe(pieza);
  }
}
