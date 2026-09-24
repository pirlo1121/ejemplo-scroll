/**
 * capitulos.ts
 * Índice lateral de la portada: marca el capítulo que cruza el centro de la
 * pantalla y se retira sobre el pie de página para no tapar sus enlaces.
 */

export function iniciarCapitulos(): void {
  const indice = document.querySelector<HTMLElement>('[data-capitulos]');
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
          if (enlace.hash === `#${entrada.target.id}`) enlace.setAttribute('aria-current', 'step');
          else enlace.removeAttribute('aria-current');
        }
      }
    },
    // Una línea horizontal a media pantalla decide el capítulo activo.
    { rootMargin: '-50% 0px -50% 0px' }
  );
  secciones.forEach((seccion) => observador.observe(seccion));

  const pie = document.querySelector('[data-pie]');
  if (pie) {
    new IntersectionObserver(([entrada]) => {
      indice.classList.toggle('esta-oculto', Boolean(entrada?.isIntersecting));
    }).observe(pie);
  }
}
