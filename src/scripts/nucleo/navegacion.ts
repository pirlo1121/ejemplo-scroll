/**
 * navegacion.ts
 * La barra de progreso de lectura y la cabecera que se condensa al bajar.
 */

import { registrarTarea } from './bucle';

export function iniciarNavegacion(): void {
  const barra = document.querySelector<HTMLElement>('[data-barra-progreso]');
  const cabecera = document.querySelector<HTMLElement>('[data-cabecera]');
  if (!barra && !cabecera) return;

  let fija: boolean | null = null;

  registrarTarea({
    leer: (alto) => {
      const recorrido = document.documentElement.scrollHeight - alto;
      return {
        avance: recorrido > 0 ? Math.min(Math.max(window.scrollY / recorrido, 0), 1) : 0,
        fija: window.scrollY > 40
      };
    },
    escribir: ({ avance, fija: debeFijarse }) => {
      barra?.style.setProperty('transform', `scaleX(${avance.toFixed(4)})`);
      if (cabecera && debeFijarse !== fija) {
        fija = debeFijarse;
        cabecera.classList.toggle('esta-fija', debeFijarse);
      }
    }
  });
}
