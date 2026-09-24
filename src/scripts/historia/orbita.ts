/**
 * orbita.ts
 * Los siete servicios forman un anillo 3D que gira con el scroll. El giro se
 * detiene en cada servicio: en cada tramo, la primera y la última parte son
 * de pausa y solo el centro hace girar el anillo. Así cada ficha se lee de frente.
 *
 * Escribe --giro (0 a 6, en "fichas") en el escenario; el CSS convierte ese
 * número en la rotación del anillo y en el brillo de cada ficha.
 */

import { registrarTarea } from '../nucleo/bucle';
import { limitar, suavizar } from '../nucleo/matematica';
import { hayMovimiento } from '../nucleo/preferencias';
import { medirProgreso } from '../nucleo/progreso';

/** Parte de cada tramo en la que el anillo gira; el resto es pausa. */
const INICIO_GIRO = 0.3;
const FIN_GIRO = 0.7;

export function iniciarOrbita(): void {
  const escenario = document.querySelector<HTMLElement>('[data-orbita]');
  const cartas = Array.from(escenario?.querySelectorAll<HTMLElement>('[data-carta]') ?? []);
  const puntos = Array.from(escenario?.querySelectorAll<HTMLElement>('[data-punto]') ?? []);
  const contador = escenario?.querySelector<HTMLElement>('[data-orbita-actual]');
  if (!escenario || cartas.length < 2 || !hayMovimiento()) return;

  const ultima = cartas.length - 1;
  let activa = -1;

  registrarTarea({
    leer: (alto) => medirProgreso(escenario.getBoundingClientRect(), alto, 'fija'),
    escribir: (p) => {
      const tramo = p * ultima;
      const indice = Math.min(Math.floor(tramo), ultima);
      const giro = Math.min(
        indice + suavizar(limitar((tramo - indice - INICIO_GIRO) / (FIN_GIRO - INICIO_GIRO))),
        ultima
      );
      escenario.style.setProperty('--giro', giro.toFixed(4));

      const alFrente = Math.round(giro);
      if (alFrente === activa) return;
      activa = alFrente;
      cartas.forEach((carta, i) => carta.classList.toggle('esta-al-frente', i === alFrente));
      puntos.forEach((punto, i) => punto.classList.toggle('esta-activo', i === alFrente));
      if (contador) contador.textContent = String(alFrente + 1).padStart(2, '0');
    }
  });
}
