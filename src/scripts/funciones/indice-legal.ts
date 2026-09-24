/**
 * indice-legal.ts
 * Resalta en el índice lateral de las páginas legales la sección que se está leyendo.
 */

export function iniciarIndiceLegal(): void {
  const indice = document.querySelector<HTMLElement>('[data-indice-legal]');
  if (!indice || !('IntersectionObserver' in window)) return;

  const enlaces = Array.from(indice.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  const secciones = enlaces
    .map((enlace) => document.getElementById(enlace.hash.slice(1)))
    .filter((seccion): seccion is HTMLElement => seccion !== null);

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        for (const enlace of enlaces) {
          const esActual = enlace.hash === `#${entrada.target.id}`;
          if (esActual) enlace.setAttribute('aria-current', 'location');
          else enlace.removeAttribute('aria-current');
        }
      }
    },
    { rootMargin: '-20% 0px -70% 0px' }
  );

  secciones.forEach((seccion) => observador.observe(seccion));
}
