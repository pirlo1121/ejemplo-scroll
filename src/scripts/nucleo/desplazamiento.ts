/**
 * desplazamiento.ts
 * Scroll suave con Lenis y saltos a anclas.
 *
 * Lenis solo se activa con puntero fino (rueda o trackpad) y sin "reducir
 * movimiento". En pantallas táctiles el scroll nativo ya es el más fluido
 * posible y no se toca. Lenis mueve el scroll real de la ventana, así que
 * position: sticky, el bucle de scroll y los anclajes siguen funcionando.
 */

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { hayMovimiento, tienePunteroFino } from './preferencias';

let lenis: Lenis | null = null;

export function iniciarDesplazamiento(): void {
  if (hayMovimiento() && tienePunteroFino()) {
    lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
  }
  document.addEventListener('click', alHacerClicEnAncla);
}

/** Detiene el scroll de la página (por ejemplo, con el menú abierto). */
export function pausarDesplazamiento(): void {
  lenis?.stop();
  document.body.classList.add('sin-scroll');
}

export function reanudarDesplazamiento(): void {
  lenis?.start();
  document.body.classList.remove('sin-scroll');
}

/**
 * Lleva a un elemento y le pasa el foco. El margen para la cabecera fija lo
 * define el CSS (scroll-padding-top en base.css), que respetan tanto Lenis
 * como el scroll nativo: no se calcula aquí.
 */
export function desplazarHasta(destino: HTMLElement): void {
  if (lenis) {
    lenis.scrollTo(destino);
  } else {
    destino.scrollIntoView({ behavior: hayMovimiento() ? 'smooth' : 'auto', block: 'start' });
  }

  // El foco acompaña al salto para que el teclado no se quede arriba.
  if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1');
  destino.focus({ preventScroll: true });
}

function alHacerClicEnAncla(evento: MouseEvent): void {
  const enlace = (evento.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
  const id = enlace?.getAttribute('href')?.slice(1);
  if (!id) return;

  const destino = document.getElementById(decodeURIComponent(id));
  if (!destino) return;

  evento.preventDefault();
  desplazarHasta(destino);
  history.replaceState(null, '', `#${id}`);
}
