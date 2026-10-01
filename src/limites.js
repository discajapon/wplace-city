// Topes de tamaño de selección, en una constante fácil de cambiar.
// Limitan tanto el costo de la consulta a Overpass como el peso del
// archivo final.

export const LADO_MAXIMO_PX = 512; // ancho/alto máximo de la plantilla, en píxeles
export const AREA_MAXIMA_PX = 150000; // ancho * alto máximo (evita rectángulos muy alargados)

export function seleccionExcedeLimite(anchoPx, altoPx) {
  if (anchoPx > LADO_MAXIMO_PX || altoPx > LADO_MAXIMO_PX) return true;
  if (anchoPx * altoPx > AREA_MAXIMA_PX) return true;
  return false;
}
