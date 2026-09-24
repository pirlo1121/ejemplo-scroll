/**
 * menu.ts
 * El menú de navegación móvil: abrir, cerrar, foco atrapado y Escape.
 * La página actual ya viene marcada con aria-current desde el servidor.
 */

import { pausarDesplazamiento, reanudarDesplazamiento } from './desplazamiento';

const ENFOCABLES = 'a[href], button:not([disabled])';

export function iniciarMenu(): void {
  const boton = document.querySelector<HTMLButtonElement>('[data-menu-boton]');
  const panel = document.querySelector<HTMLElement>('[data-menu]');
  if (!boton || !panel) return;

  const enlaces = Array.from(panel.querySelectorAll<HTMLAnchorElement>('a'));
  let abierto = false;

  const aplicar = (estado: boolean): void => {
    abierto = estado;
    panel.dataset.abierto = String(estado);
    panel.inert = !estado;
    boton.setAttribute('aria-expanded', String(estado));
    boton.setAttribute('aria-label', estado ? 'Cerrar menú' : 'Abrir menú');
    if (estado) pausarDesplazamiento();
    else reanudarDesplazamiento();
  };

  const abrir = (): void => {
    aplicar(true);
    enlaces[0]?.focus({ preventScroll: true });
  };

  const cerrar = ({ devolverFoco = false } = {}): void => {
    aplicar(false);
    if (devolverFoco) boton.focus();
  };

  boton.addEventListener('click', () => (abierto ? cerrar() : abrir()));

  panel.addEventListener('click', (evento) => {
    if ((evento.target as Element).closest('a')) cerrar();
  });

  document.addEventListener('keydown', (evento) => {
    if (!abierto) return;

    if (evento.key === 'Escape') {
      evento.preventDefault();
      cerrar({ devolverFoco: true });
      return;
    }

    if (evento.key !== 'Tab') return;

    // El foco da la vuelta dentro del panel (y el botón de cerrar) mientras está abierto.
    const enfocables = [boton, ...panel.querySelectorAll<HTMLElement>(ENFOCABLES)];
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo?.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero?.focus();
    }
  });

  // El panel es solo para pantallas pequeñas: al ensanchar la ventana se cierra.
  window.matchMedia('(min-width: 60rem)').addEventListener('change', (evento) => {
    if (evento.matches && abierto) cerrar();
  });

  aplicar(false);
}
