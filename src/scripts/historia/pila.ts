/**
 * pila.ts
 * Pila de servicios: cada ficha queda fija (sticky, en CSS) y, cuando llega
 * la siguiente, se hunde un poco. Aquí se mide cuánto la ha tapado la
 * siguiente y se escribe como --hundido (0 a 1).
 */

import { registrarTarea } from '../nucleo/bucle';
import { limitar } from '../nucleo/matematica';
import { hayMovimiento } from '../nucleo/preferencias';

export function iniciarPila(): void {
  const cartas = Array.from(document.querySelectorAll<HTMLElement>('[data-pila] [data-carta]'));
  if (cartas.length < 2 || !hayMovimiento()) return;

  // Posición "top" de cada ficha cuando está fija; solo cambia al redimensionar.
  let topes: number[] = [];
  const medirTopes = (): void => {
    topes = cartas.map((carta) => parseFloat(getComputedStyle(carta).top) || 0);
  };
  medirTopes();
  window.addEventListener('resize', medirTopes);

  registrarTarea({
    leer: (alto) =>
      cartas.map((_, i) => {
        const siguiente = cartas[i + 1];
        if (!siguiente) return 0;
        const arriba = siguiente.getBoundingClientRect().top;
        return limitar((alto - arriba) / Math.max(alto - (topes[i + 1] ?? 0), 1));
      }),
    escribir: (hundimientos) => {
      cartas.forEach((carta, i) =>
        carta.style.setProperty('--hundido', (hundimientos[i] ?? 0).toFixed(3))
      );
    }
  });
}
