/**
 * manifiesto.ts
 * Mientras el marco del manifiesto está fijo, cada tramo de scroll enciende
 * una palabra más. Las palabras ya vienen separadas desde el servidor
 * (Manifiesto.astro); aquí solo se decide cuántas van encendidas.
 */

import { registrarTarea } from '../nucleo/bucle';
import { limitar } from '../nucleo/matematica';
import { hayMovimiento } from '../nucleo/preferencias';
import { medirProgreso } from '../nucleo/progreso';

/** Tramo del recorrido en el que se encienden las palabras; el resto es respiro. */
const INICIO = 0.08;
const FIN = 0.8;

export function iniciarManifiesto(): void {
  const seccion = document.querySelector<HTMLElement>('[data-manifiesto]');
  const palabras = Array.from(seccion?.querySelectorAll<HTMLElement>('.palabra') ?? []);
  if (!seccion || !palabras.length || !hayMovimiento()) return;

  let encendidas = -1;

  registrarTarea({
    leer: (alto) => {
      const p = medirProgreso(seccion.getBoundingClientRect(), alto, 'fija');
      return Math.round(limitar((p - INICIO) / (FIN - INICIO)) * palabras.length);
    },
    escribir: (corte) => {
      if (corte === encendidas) return;
      encendidas = corte;
      palabras.forEach((palabra, i) => palabra.classList.toggle('encendida', i < corte));
    }
  });
}
