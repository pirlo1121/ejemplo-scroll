/**
 * escena.ts
 * Dibuja las partículas de fondo de la portada en un <canvas> 2D.
 *
 * Cada capítulo tiene una figura (formas.ts); las partículas viajan de una a
 * otra según la posición que le entrega el cargador. La sensación de volumen
 * sale de una proyección en perspectiva sencilla, sin Three.js.
 *
 * Este módulo no lee el scroll: solo dibuja. Así se puede probar y
 * reemplazar sin tocar la lógica de la página.
 */

import { limitar, mezclar, suavizar } from '../../nucleo/matematica';
import { crearAzar, FORMAS, type NombreDeForma } from './formas';

/** Índigo, azul, cian y hielo: los pigmentos de tokens.css. */
const TINTAS = ['#5b6bff', '#2f7dff', '#5ad2ff', '#bfe9ff'] as const;
const PERSPECTIVA = 3.4;
const ANCHO_ESTRECHO = 760;

interface Encuadre {
  /** Desplazamiento del centro, en fracción de la mitad del lienzo (solo en pantallas anchas). */
  centro: [number, number];
  escala: number;
  inclinacion: number;
  /** Cuánto se deja ver detrás del contenido de ese capítulo. */
  opacidad: number;
}

const ENCUADRES: Record<NombreDeForma, Encuadre> = {
  nube: { centro: [0.42, -0.05], escala: 1.15, inclinacion: 0.2, opacidad: 1 },
  esfera: { centro: [0, 0], escala: 1.05, inclinacion: 0.35, opacidad: 0.7 },
  constelacion: { centro: [0, 0], escala: 1.25, inclinacion: 0.6, opacidad: 0.5 },
  rejilla: { centro: [-0.45, 0.05], escala: 0.9, inclinacion: 0.55, opacidad: 0.55 },
  onda: { centro: [0, 0.45], escala: 1.3, inclinacion: 0.3, opacidad: 0.38 },
  anillo: { centro: [0.35, 0], escala: 1.05, inclinacion: 1.05, opacidad: 0.9 }
};

export interface OpcionesDeEscena {
  /** Figura de cada capítulo, en el orden del documento. */
  secuencia: NombreDeForma[];
  particulas: number;
  dprMaximo: number;
  /** Sin animación: se dibuja un solo cuadro (reducir movimiento). */
  estatica: boolean;
}

export interface Escena {
  /** Posición continua en la secuencia: 2.4 = 40 % del paso del capítulo 3 al 4. */
  actualizar(posicion: number): void;
  pausar(): void;
  reanudar(): void;
}

export function crearEscena(lienzo: HTMLCanvasElement, opciones: OpcionesDeEscena): Escena | null {
  const contexto = lienzo.getContext('2d');
  if (!contexto || !opciones.secuencia.length) return null;
  const ctx: CanvasRenderingContext2D = contexto;

  const { secuencia, particulas: n, dprMaximo, estatica } = opciones;

  const formas = new Map<NombreDeForma, Float32Array>();
  for (const nombre of new Set(secuencia)) {
    formas.set(nombre, FORMAS[nombre](n, crearAzar(nombre.length * 31)));
  }

  // Datos fijos por partícula: tinta, retraso en la transición y fase del vaivén.
  const azar = crearAzar(7);
  const retraso = new Float32Array(n);
  const fase = new Float32Array(n);
  const grupos: number[][] = TINTAS.map(() => []);
  for (let i = 0; i < n; i += 1) {
    grupos[Math.floor(azar() * TINTAS.length)]?.push(i);
    retraso[i] = azar();
    fase[i] = azar() * Math.PI * 2;
  }

  // Resultado de la proyección de cada cuadro (se reutiliza, sin crear objetos).
  const px = new Float32Array(n);
  const py = new Float32Array(n);
  const lado = new Float32Array(n);
  const alfa = new Float32Array(n);

  const puntero = { x: 0, y: 0, suaveX: 0, suaveY: 0 };
  let ancho = 0;
  let alto = 0;
  let objetivo = 0;
  let posicion = 0;
  let cuadro = 0;
  let activa = false;
  const inicio = performance.now();

  function dimensionar(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, dprMaximo);
    ancho = lienzo.clientWidth;
    alto = lienzo.clientHeight;
    lienzo.width = Math.round(ancho * dpr);
    lienzo.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (estatica) dibujar(performance.now());
  }

  function dibujar(ahora: number): void {
    const tiempo = estatica ? 0 : (ahora - inicio) / 1000;

    // El lienzo persigue a la posición del scroll: nunca salta de golpe.
    posicion += (objetivo - posicion) * (estatica ? 1 : 0.075);

    const ultimo = secuencia.length - 1;
    const base = Math.min(Math.max(Math.floor(posicion), 0), ultimo);
    const siguiente = Math.min(base + 1, ultimo);
    const bruto = limitar(posicion - base);
    const mezcla = suavizar(bruto);

    const nombreA = secuencia[base]!;
    const nombreB = secuencia[siguiente]!;
    const a = ENCUADRES[nombreA];
    const b = ENCUADRES[nombreB];
    const formaA = formas.get(nombreA)!;
    const formaB = formas.get(nombreB)!;

    const angosto = ancho < ANCHO_ESTRECHO;
    const cx = ancho / 2 + (angosto ? 0 : mezclar(a.centro[0], b.centro[0], mezcla)) * ancho * 0.5;
    const cy = alto / 2 + mezclar(a.centro[1], b.centro[1], mezcla) * alto * 0.5;
    const radio =
      Math.min(ancho, alto) * (angosto ? 0.36 : 0.3) * mezclar(a.escala, b.escala, mezcla);
    const opacidad = mezclar(a.opacidad, b.opacidad, mezcla);

    // Giro: deriva lenta, un giro por capítulo y un leve seguimiento del puntero.
    puntero.suaveX += (puntero.x - puntero.suaveX) * 0.05;
    puntero.suaveY += (puntero.y - puntero.suaveY) * 0.05;
    const giro = tiempo * 0.06 + posicion * 0.85 + puntero.suaveX * 0.25;
    const inclinacion = mezclar(a.inclinacion, b.inclinacion, mezcla) + puntero.suaveY * 0.15;
    const cosG = Math.cos(giro);
    const senG = Math.sin(giro);
    const cosI = Math.cos(inclinacion);
    const senI = Math.sin(inclinacion);

    const pesoOnda = (nombreA === 'onda' ? 1 - mezcla : 0) + (nombreB === 'onda' ? mezcla : 0);

    for (let i = 0; i < n; i += 1) {
      // Cada partícula viaja con su propio retraso: la transformación se siente orgánica.
      const m = suavizar(limitar(bruto * 1.6 - retraso[i]! * 0.6));
      const k = i * 3;
      const x = formaA[k]! + (formaB[k]! - formaA[k]!) * m;
      let y = formaA[k + 1]! + (formaB[k + 1]! - formaA[k + 1]!) * m;
      const z = formaA[k + 2]! + (formaB[k + 2]! - formaA[k + 2]!) * m;

      if (!estatica) {
        y += Math.sin(tiempo * 0.7 + fase[i]!) * 0.018;
        if (pesoOnda > 0) y += Math.sin(x * 1.7 + z * 1.3 + tiempo * 0.8) * 0.14 * pesoOnda;
      }

      // Giro sobre Y, luego inclinación sobre X, luego perspectiva.
      const x1 = x * cosG - z * senG;
      const z1 = x * senG + z * cosG;
      const y2 = y * cosI - z1 * senI;
      const z2 = y * senI + z1 * cosI;
      const escala = PERSPECTIVA / (PERSPECTIVA + z2);

      px[i] = cx + x1 * escala * radio;
      py[i] = cy + y2 * escala * radio;
      lado[i] = 0.7 + escala * 1.1;
      // Las partículas cercanas brillan más que las del fondo.
      alfa[i] = Math.min(Math.max((escala - 0.62) * 1.5, 0.08), 1) * opacidad;
    }

    const c = ctx;
    c.clearRect(0, 0, ancho, alto);
    c.globalCompositeOperation = 'lighter';

    // Un solo fillStyle por grupo de tinta en cada cuadro.
    grupos.forEach((indices, t) => {
      c.fillStyle = TINTAS[t]!;
      for (const i of indices) {
        const l = lado[i]!;
        c.globalAlpha = alfa[i]!;
        c.fillRect(px[i]! - l / 2, py[i]! - l / 2, l, l);
      }
    });

    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
  }

  function bucle(ahora: number): void {
    if (!activa) return;
    dibujar(ahora);
    cuadro = requestAnimationFrame(bucle);
  }

  function reanudar(): void {
    if (estatica || activa || document.hidden) return;
    activa = true;
    cuadro = requestAnimationFrame(bucle);
  }

  function pausar(): void {
    activa = false;
    cancelAnimationFrame(cuadro);
  }

  window.addEventListener('resize', dimensionar);
  document.addEventListener('visibilitychange', () => (document.hidden ? pausar() : reanudar()));

  if (!estatica && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener(
      'pointermove',
      (evento) => {
        puntero.x = (evento.clientX / window.innerWidth) * 2 - 1;
        puntero.y = (evento.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true }
    );
  }

  dimensionar();
  reanudar();

  return {
    actualizar(nuevaPosicion) {
      objetivo = nuevaPosicion;
      if (estatica) {
        posicion = nuevaPosicion;
        dibujar(performance.now());
      }
    },
    pausar,
    reanudar
  };
}
