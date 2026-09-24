/**
 * parallax.ts
 * Los elementos con data-parallax="0.06" se desplazan un poco más lento que
 * el scroll. Se escribe la variable --desfase; el CSS la aplica con `translate`
 * para no pisar otras transformaciones del elemento.
 */

import { elementosCercanos, registrarTarea } from '../nucleo/bucle';
import { hayMovimiento } from '../nucleo/preferencias';

let iniciado = false;

/** Idempotente: cada componente con data-parallax puede llamarla. */
export function iniciarParallax(): void {
  if (iniciado || !hayMovimiento()) return;
  iniciado = true;

  const capas = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!capas.length) return;

  const cercanas = elementosCercanos(capas, '10%');

  registrarTarea({
    leer: (alto) =>
      Array.from(cercanas as Set<HTMLElement>, (capa) => {
        const caja = capa.getBoundingClientRect();
        const fuerza = Number(capa.dataset.parallax) || 0.1;
        return [capa, (caja.top + caja.height / 2 - alto / 2) * fuerza] as const;
      }),
    escribir: (desfases) => {
      for (const [capa, desfase] of desfases) {
        capa.style.setProperty('--desfase', `${desfase.toFixed(1)}px`);
      }
    }
  });
}
