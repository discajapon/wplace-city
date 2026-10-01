// Topes de tamaño de selección, en una constante fácil de cambiar.
// Limitan tanto el costo de la consulta a Overpass como el peso del
// archivo final.

// Con WPLACE_ZOOM_HIPOTESIS en projection.js, cada píxel cubre ~0.15 m
// reales, así que estos topes ahora cubren un par de cuadras por lado
// (antes, con el zoom viejo, 512px cubrían ~20 km: toda una ciudad de un
// saque, demasiado grueso para que las calles se vieran como líneas finas).
export const LADO_MAXIMO_PX = 1500; // ancho/alto máximo de la plantilla, en píxeles
export const AREA_MAXIMA_PX = 1500000; // ancho * alto máximo (evita rectángulos muy alargados)

export function seleccionExcedeLimite(anchoPx, altoPx) {
  if (anchoPx > LADO_MAXIMO_PX || altoPx > LADO_MAXIMO_PX) return true;
  if (anchoPx * altoPx > AREA_MAXIMA_PX) return true;
  return false;
}
