/**
 * matematica.ts
 * Funciones puras de interpolación que comparten los scripts de movimiento.
 */

/** Recorta un valor al intervalo [0, 1]. */
export function limitar(valor: number): number {
  return Math.min(Math.max(valor, 0), 1);
}

/** Curva suave (smoothstep) para t en [0, 1]. */
export function suavizar(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Interpolación lineal entre a y b. */
export function mezclar(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
