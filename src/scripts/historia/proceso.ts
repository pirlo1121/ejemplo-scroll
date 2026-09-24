/**
 * proceso.ts
 * La fase que cruza el 55 % de la pantalla queda activa (junto con las
 * anteriores) y el contador grande muestra su número.
 */

import { registrarTarea } from '../nucleo/bucle';
import { hayMovimiento } from '../nucleo/preferencias';

export function iniciarProceso(): void {
  const lista = document.querySelector<HTMLElement>('[data-proceso]');
  const pasos = Array.from(lista?.querySelectorAll<HTMLElement>('[data-paso]') ?? []);
  const contador = document.querySelector<HTMLElement>('[data-proceso-actual]');
  if (!pasos.length || !hayMovimiento()) return;

  let actual = -1;

  registrarTarea({
    leer: (alto) => {
      const linea = alto * 0.55;
      let indice = 0;
      pasos.forEach((paso, i) => {
        if (paso.getBoundingClientRect().top < linea) indice = i;
      });
      return indice;
    },
    escribir: (indice) => {
      if (indice === actual) return;
      actual = indice;
      pasos.forEach((paso, i) => paso.classList.toggle('esta-activo', i <= indice));
      if (contador) contador.textContent = String(indice + 1);
    }
  });
}
