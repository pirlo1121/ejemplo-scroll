/**
 * indice.ts
 * Índice de servicios de la portada. Enciende (.esta-encendida) la fila que
 * cruza la franja central de la pantalla y su ficha del panel lateral.
 * Con mouse, pasar por encima de una fila también la enciende.
 *
 * Entre dos filas no cruza ninguna: se mantiene encendida la última, así
 * siempre hay una ficha a la vista.
 */

import { hayMovimiento, tienePunteroFino } from '../nucleo/preferencias';

export function iniciarIndice(): void {
  const indice = document.querySelector<HTMLElement>('[data-indice]');
  const filas = Array.from(indice?.querySelectorAll<HTMLElement>('[data-fila]') ?? []);
  const fichas = Array.from(indice?.querySelectorAll<HTMLElement>('[data-ficha]') ?? []);
  if (!indice || !filas.length || !hayMovimiento()) return;

  let activa = -1;

  const encender = (indiceNuevo: number): void => {
    if (indiceNuevo === activa || indiceNuevo < 0) return;
    activa = indiceNuevo;
    filas.forEach((fila, i) => fila.classList.toggle('esta-encendida', i === activa));
    fichas.forEach((ficha, i) => ficha.classList.toggle('esta-encendida', i === activa));
  };

  encender(0);

  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) encender(filas.indexOf(entrada.target as HTMLElement));
        }
      },
      // Una franja fina en el centro de la pantalla decide la fila encendida.
      { rootMargin: '-46% 0px -46% 0px' }
    );
    filas.forEach((fila) => observador.observe(fila));
  }

  if (tienePunteroFino()) {
    filas.forEach((fila, i) => fila.addEventListener('pointerenter', () => encender(i)));
  }
}
