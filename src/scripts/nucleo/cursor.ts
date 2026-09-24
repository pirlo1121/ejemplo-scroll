/**
 * cursor.ts
 * Cursor a medida, botones magnéticos y brillo que sigue al puntero.
 * Solo con mouse o trackpad y con movimiento permitido; en táctil no hace nada.
 */

import { hayMovimiento, tienePunteroFino } from './preferencias';

const ACCIONABLE = 'a, button, input, textarea, select, summary, [data-cursor-crece]';

export function iniciarCursor(): void {
  if (!tienePunteroFino() || !hayMovimiento()) return;

  const punto = document.querySelector<HTMLElement>('[data-cursor]');
  const halo = document.querySelector<HTMLElement>('[data-cursor-halo]');
  if (!punto || !halo) return;

  document.body.classList.add('cursor-activo');

  const raton = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const estela = { ...raton };
  let cuadro = 0;

  const bucle = (): void => {
    // El punto va pegado al puntero; el halo lo persigue con inercia.
    estela.x += (raton.x - estela.x) * 0.16;
    estela.y += (raton.y - estela.y) * 0.16;
    punto.style.transform = `translate3d(${raton.x}px, ${raton.y}px, 0)`;
    halo.style.transform = `translate3d(${estela.x}px, ${estela.y}px, 0)`;
    cuadro = requestAnimationFrame(bucle);
  };

  window.addEventListener(
    'pointermove',
    (evento) => {
      if (evento.pointerType !== 'mouse') return;
      raton.x = evento.clientX;
      raton.y = evento.clientY;
    },
    { passive: true }
  );

  document.addEventListener('pointerover', (evento) => {
    halo.classList.toggle('es-enlace', Boolean((evento.target as Element).closest(ACCIONABLE)));
  });

  document.documentElement.addEventListener('pointerleave', () =>
    document.body.classList.remove('cursor-activo')
  );
  document.documentElement.addEventListener('pointerenter', () =>
    document.body.classList.add('cursor-activo')
  );

  // Con la pestaña oculta el bucle se detiene para no gastar batería.
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(cuadro);
    if (!document.hidden) cuadro = requestAnimationFrame(bucle);
  });

  cuadro = requestAnimationFrame(bucle);
  iniciarMagnetismo();
  iniciarBrillo();
}

/** Los elementos con data-magnetico se acercan levemente al puntero. */
function iniciarMagnetismo(): void {
  document.querySelectorAll<HTMLElement>('[data-magnetico]').forEach((elemento) => {
    const fuerza = Number(elemento.dataset.magnetico) || 0.28;

    elemento.addEventListener('pointermove', (evento) => {
      const caja = elemento.getBoundingClientRect();
      const dx = evento.clientX - (caja.left + caja.width / 2);
      const dy = evento.clientY - (caja.top + caja.height / 2);
      elemento.style.translate = `${dx * fuerza}px ${dy * fuerza}px`;
    });

    elemento.addEventListener('pointerleave', () => {
      elemento.style.translate = '';
    });
  });
}

/** En los elementos con data-brillo, un halo de color sigue al puntero (--mx, --my). */
function iniciarBrillo(): void {
  document.querySelectorAll<HTMLElement>('[data-brillo]').forEach((elemento) => {
    elemento.addEventListener('pointermove', (evento) => {
      const caja = elemento.getBoundingClientRect();
      elemento.style.setProperty('--mx', `${evento.clientX - caja.left}px`);
      elemento.style.setProperty('--my', `${evento.clientY - caja.top}px`);
    });
  });
}
