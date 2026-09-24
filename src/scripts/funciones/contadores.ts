/**
 * contadores.ts
 * Las cifras con data-contador cuentan desde 0 al entrar en pantalla.
 * El HTML ya trae el valor final: sin JavaScript o sin movimiento, se ve tal cual.
 */

import { hayMovimiento } from '../nucleo/preferencias';

const DURACION = 1400;

let iniciado = false;

/** Idempotente: cada componente con contadores puede llamarla. */
export function iniciarContadores(): void {
  if (iniciado) return;
  iniciado = true;

  const cifras = Array.from(document.querySelectorAll<HTMLElement>('[data-contador]'));
  if (!cifras.length || !hayMovimiento() || !('IntersectionObserver' in window)) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        contar(entrada.target as HTMLElement);
        observador.unobserve(entrada.target);
      }
    },
    { threshold: 0.6 }
  );

  cifras.forEach((cifra) => observador.observe(cifra));
}

function contar(elemento: HTMLElement): void {
  const destino = Number(elemento.dataset.contador) || 0;
  const sufijo = elemento.dataset.sufijo ?? '';
  const inicio = performance.now();

  const paso = (ahora: number): void => {
    const t = Math.min((ahora - inicio) / DURACION, 1);
    const suave = 1 - Math.pow(1 - t, 3);
    elemento.textContent = `${Math.round(destino * suave)}${sufijo}`;
    if (t < 1) requestAnimationFrame(paso);
  };

  requestAnimationFrame(paso);
}
