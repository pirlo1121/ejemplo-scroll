/**
 * iniciar.ts
 * Punto de entrada del núcleo, cargado en todas las páginas desde Base.astro.
 * Cada módulo se arranca aislado: si uno falla, lo registra y los demás siguen.
 * Los comportamientos de una sola página los carga el componente que los usa.
 */

import { iniciarCursor } from './cursor';
import { iniciarDesplazamiento } from './desplazamiento';
import { iniciarMenu } from './menu';
import { iniciarNavegacion } from './navegacion';
import { iniciarProgreso } from './progreso';
import { iniciarRevelado } from './revelado';

const MODULOS: Array<[string, () => void]> = [
  ['desplazamiento', iniciarDesplazamiento],
  ['menu', iniciarMenu],
  ['navegacion', iniciarNavegacion],
  ['revelado', iniciarRevelado],
  ['progreso', iniciarProgreso],
  ['cursor', iniciarCursor]
];

for (const [nombre, iniciar] of MODULOS) {
  try {
    iniciar();
  } catch (error) {
    console.error(`[JAPH] El módulo "${nombre}" no pudo iniciarse:`, error);
  }
}
