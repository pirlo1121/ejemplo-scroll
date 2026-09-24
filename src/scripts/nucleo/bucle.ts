/**
 * bucle.ts
 * El único bucle de scroll del sitio. Toda animación ligada al scroll se
 * registra aquí como una tarea con dos fases:
 *
 *   leer(alto)   solo lecturas de layout (getBoundingClientRect, scrollY…)
 *   escribir(v)  solo escrituras (estilos, clases) con lo que se leyó
 *
 * En cada cuadro se ejecutan primero TODAS las lecturas y después TODAS las
 * escrituras. Intercalarlas obliga al navegador a recalcular el layout varias
 * veces por cuadro, que es la causa más común de un scroll trabado.
 */

export interface Tarea<T> {
  leer(alto: number): T;
  escribir(valor: T): void;
}

const tareas = new Set<Tarea<unknown>>();
let pendiente = false;
let escuchando = false;

function cuadro(): void {
  pendiente = false;
  const alto = window.innerHeight;
  const lecturas: Array<[Tarea<unknown>, unknown]> = [];

  for (const tarea of tareas) {
    try {
      lecturas.push([tarea, tarea.leer(alto)]);
    } catch (error) {
      console.error('[bucle] Falló la lectura de una tarea:', error);
    }
  }

  for (const [tarea, valor] of lecturas) {
    try {
      tarea.escribir(valor);
    } catch (error) {
      console.error('[bucle] Falló la escritura de una tarea:', error);
    }
  }
}

/** Pide un cuadro; varias peticiones en el mismo cuadro se agrupan en una. */
export function programarCuadro(): void {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(cuadro);
}

function escuchar(): void {
  if (escuchando) return;
  escuchando = true;
  window.addEventListener('scroll', programarCuadro, { passive: true });
  window.addEventListener('resize', programarCuadro);
  window.addEventListener('load', programarCuadro);
  // Cuando llegan las fuentes cambian las alturas: hay que volver a medir.
  document.fonts?.ready.then(programarCuadro);
}

/** Registra una tarea y la ejecuta una vez. Devuelve la función para retirarla. */
export function registrarTarea<T>(tarea: Tarea<T>): () => void {
  const generica = tarea as Tarea<unknown>;
  tareas.add(generica);
  escuchar();
  programarCuadro();
  return () => tareas.delete(generica);
}

/**
 * Conjunto de elementos que están cerca de la pantalla. Las tareas solo miden
 * estos, así una página larga no cuesta más que una corta.
 */
export function elementosCercanos(elementos: Element[], margen = '25%'): Set<Element> {
  if (!('IntersectionObserver' in window)) return new Set(elementos);

  const cercanos = new Set<Element>();
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) cercanos.add(entrada.target);
        else cercanos.delete(entrada.target);
      }
      programarCuadro();
    },
    { rootMargin: `${margen} 0px ${margen} 0px` }
  );

  elementos.forEach((elemento) => observador.observe(elemento));
  return cercanos;
}
