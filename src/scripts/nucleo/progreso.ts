/**
 * progreso.ts
 * Escribe en cada elemento con data-progreso la variable CSS --p (0 a 1)
 * según su posición en pantalla. El CSS decide qué transformar con ella.
 *
 *   fija       0 cuando la sección alta llega arriba, 1 cuando su marco sticky se suelta
 *   salida     0 con la pieza arriba del todo, 1 cuando salió por arriba
 *   entrada    0 cuando asoma por abajo, 1 cuando llega al 35 % superior
 *   recorrido  0 cuando su borde superior cruza el 55 % de la pantalla,
 *              1 cuando lo cruza el inferior
 */

import { elementosCercanos, registrarTarea } from './bucle';
import { limitar } from './matematica';
import { hayMovimiento } from './preferencias';

export type ModoDeProgreso = 'fija' | 'salida' | 'entrada' | 'recorrido';

/** Progreso de una caja según el modo. Exportada para quien necesite el número sin la variable. */
export function medirProgreso(caja: DOMRect, alto: number, modo: ModoDeProgreso): number {
  switch (modo) {
    case 'fija':
      return limitar(-caja.top / Math.max(caja.height - alto, 1));
    case 'salida':
      return limitar(-caja.top / Math.max(caja.height, 1));
    case 'entrada':
      return limitar((alto - caja.top) / (alto * 0.65));
    case 'recorrido':
      return limitar((alto * 0.55 - caja.top) / Math.max(caja.height, 1));
  }
}

export function iniciarProgreso(): void {
  if (!hayMovimiento()) return;

  const piezas = Array.from(document.querySelectorAll<HTMLElement>('[data-progreso]'));
  if (!piezas.length) return;

  const cercanas = elementosCercanos(piezas);
  const ultimo = new WeakMap<HTMLElement, number>();

  registrarTarea({
    leer: (alto) =>
      Array.from(cercanas as Set<HTMLElement>, (pieza) => {
        const modo = pieza.dataset.progreso as ModoDeProgreso;
        return [pieza, medirProgreso(pieza.getBoundingClientRect(), alto, modo)] as const;
      }),
    escribir: (valores) => {
      for (const [pieza, p] of valores) {
        const redondeado = Math.round(p * 1000) / 1000;
        if (ultimo.get(pieza) === redondeado) continue;
        ultimo.set(pieza, redondeado);
        pieza.style.setProperty('--p', String(redondeado));
      }
    }
  });
}
