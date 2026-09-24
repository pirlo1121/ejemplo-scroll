/**
 * preferencias.ts
 * Qué pidió la persona y qué aguanta su dispositivo. Todos los scripts
 * consultan aquí en lugar de repetir sus propias media queries.
 */

/** Hay JavaScript y no se pidió reducir movimiento (clase puesta en el <head>). */
export function hayMovimiento(): boolean {
  return document.documentElement.classList.contains('movimiento');
}

/** Mouse o trackpad: habilita cursor a medida, magnetismo y scroll suave. */
export function tienePunteroFino(): boolean {
  return window.matchMedia('(pointer: fine)').matches;
}

/** Datos que algunos navegadores exponen sobre el equipo y la conexión. */
interface NavegadorConCapacidades extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

export interface CapacidadGrafica {
  particulas: number;
  dprMaximo: number;
}

/**
 * Decide si el dispositivo puede con la escena de partículas y con cuánto
 * detalle. Devuelve null cuando conviene no dibujarla.
 */
export function capacidadGrafica(): CapacidadGrafica | null {
  const navegador = navigator as NavegadorConCapacidades;
  if (navegador.connection?.saveData) return null;

  const memoria = navegador.deviceMemory ?? 4;
  const nucleos = navegador.hardwareConcurrency || 4;
  if (memoria <= 2 || nucleos <= 2) return null;

  const modesto = memoria <= 4 || nucleos <= 4;
  const tactilOEstrecho = !tienePunteroFino() || window.innerWidth < 760;

  if (tactilOEstrecho) return { particulas: modesto ? 420 : 650, dprMaximo: 1.5 };
  return { particulas: modesto ? 900 : 1400, dprMaximo: modesto ? 1.25 : 1.75 };
}
