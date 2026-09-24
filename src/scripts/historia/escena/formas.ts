/**
 * formas.ts
 * Las figuras que adoptan las partículas en cada capítulo de la portada.
 * Cada una devuelve un Float32Array [x, y, z, x, y, z, …] en unidades de
 * -1.5 a 1.5 aproximadamente. Todas producen la misma cantidad de puntos,
 * así la escena puede interpolar partícula por partícula entre dos figuras.
 */

export type NombreDeForma = 'nube' | 'esfera' | 'constelacion' | 'rejilla' | 'onda' | 'anillo';

type Azar = () => number;
type GeneradorDeForma = (cantidad: number, azar: Azar) => Float32Array;

/** Ideas dispersas: una nube ancha y desigual. */
function nube(n: number, azar: Azar): Float32Array {
  const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 1) {
    const r = Math.pow(azar(), 0.6) * 1.5;
    const [x, y, z] = puntoEnEsfera(azar);
    p[i * 3] = x * r * 1.35;
    p[i * 3 + 1] = y * r * 0.75;
    p[i * 3 + 2] = z * r;
  }
  return p;
}

/** Un todo coherente: esfera de Fibonacci, con los puntos repartidos por igual. */
function esfera(n: number): Float32Array {
  const p = new Float32Array(n * 3);
  const anguloDeOro = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i += 1) {
    const y = 1 - (i / (n - 1)) * 2;
    const radio = Math.sqrt(1 - y * y);
    const t = anguloDeOro * i;
    p[i * 3] = Math.cos(t) * radio;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = Math.sin(t) * radio;
  }
  return p;
}

/** Siete capacidades: siete cúmulos sobre un anillo, unidos por su órbita. */
function constelacion(n: number, azar: Azar): Float32Array {
  const p = new Float32Array(n * 3);
  const nodos = 7;
  const radioOrbita = 1.2;

  for (let i = 0; i < n; i += 1) {
    // Una de cada cinco partículas dibuja la órbita que une los cúmulos.
    if (i % 5 === 0) {
      const t = azar() * Math.PI * 2;
      p[i * 3] = Math.cos(t) * radioOrbita;
      p[i * 3 + 1] = (azar() - 0.5) * 0.04;
      p[i * 3 + 2] = Math.sin(t) * radioOrbita;
      continue;
    }
    const angulo = ((i % nodos) / nodos) * Math.PI * 2;
    const r = Math.pow(azar(), 0.5) * 0.2;
    const [x, y, z] = puntoEnEsfera(azar);
    p[i * 3] = Math.cos(angulo) * radioOrbita + x * r;
    p[i * 3 + 1] = y * r;
    p[i * 3 + 2] = Math.sin(angulo) * radioOrbita + z * r;
  }
  return p;
}

/** Cuatro fases: cuatro capas apiladas, como una arquitectura. */
function rejilla(n: number): Float32Array {
  const p = new Float32Array(n * 3);
  const capas = 4;
  const porCapa = Math.ceil(n / capas);
  const lado = Math.ceil(Math.sqrt(porCapa));

  for (let i = 0; i < n; i += 1) {
    const capa = Math.floor(i / porCapa);
    const j = i % porCapa;
    p[i * 3] = ((j % lado) / (lado - 1) - 0.5) * 1.7;
    p[i * 3 + 1] = (capa - (capas - 1) / 2) * 0.55;
    p[i * 3 + 2] = (Math.floor(j / lado) / (lado - 1) - 0.5) * 1.7;
  }
  return p;
}

/** Calma: un plano amplio. La ondulación se suma al dibujar (escena.ts). */
function onda(n: number): Float32Array {
  const p = new Float32Array(n * 3);
  const columnas = Math.ceil(Math.sqrt(n * 2));
  const filas = Math.ceil(n / columnas);

  for (let i = 0; i < n; i += 1) {
    p[i * 3] = ((i % columnas) / (columnas - 1) - 0.5) * 4;
    p[i * 3 + 1] = 0;
    p[i * 3 + 2] = (Math.floor(i / columnas) / Math.max(filas - 1, 1) - 0.5) * 2;
  }
  return p;
}

/** Cierre: un anillo que encierra el sistema, con un núcleo pequeño. */
function anillo(n: number, azar: Azar): Float32Array {
  const p = new Float32Array(n * 3);
  const radio = 1.15;

  for (let i = 0; i < n; i += 1) {
    if (i % 9 === 0) {
      const r = Math.pow(azar(), 2) * 0.22;
      const [x, y, z] = puntoEnEsfera(azar);
      p[i * 3] = x * r;
      p[i * 3 + 1] = y * r;
      p[i * 3 + 2] = z * r;
      continue;
    }
    const t = azar() * Math.PI * 2;
    const tubo = azar() * Math.PI * 2;
    const grosor = 0.06 + azar() * 0.05;
    p[i * 3] = (radio + Math.cos(tubo) * grosor) * Math.cos(t);
    p[i * 3 + 1] = Math.sin(tubo) * grosor;
    p[i * 3 + 2] = (radio + Math.cos(tubo) * grosor) * Math.sin(t);
  }
  return p;
}

export const FORMAS: Record<NombreDeForma, GeneradorDeForma> = {
  nube,
  esfera,
  constelacion,
  rejilla,
  onda,
  anillo
};

export function esNombreDeForma(valor: string | undefined): valor is NombreDeForma {
  return valor !== undefined && valor in FORMAS;
}

/* --- Utilidades ------------------------------------------------------------ */

/** Dirección aleatoria uniforme sobre la esfera unidad. */
function puntoEnEsfera(azar: Azar): [number, number, number] {
  const u = azar() * Math.PI * 2;
  const v = Math.acos(2 * azar() - 1);
  return [Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)];
}

/** Generador pseudoaleatorio con semilla (mulberry32): la escena es igual en cada visita. */
export function crearAzar(semilla: number): Azar {
  let estado = semilla >>> 0 || 1;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
