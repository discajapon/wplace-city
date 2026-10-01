// Proyección y snap a la cuadrícula de píxeles de Wplace.
//
// HIPÓTESIS POR VERIFICAR: se asume que el lienzo de Wplace usa una
// proyección Web Mercator estándar (como las teselas de OSM/Google Maps),
// con tiles de 1000×1000 píxeles en vez de los 256×256 habituales, y que
// cada píxel del lienzo corresponde a un píxel entero de esa proyección en
// un nivel de zoom fijo. Por eso el tamaño real de un píxel en metros varía
// con la latitud (como en cualquier Web Mercator).
//
// Todo esto hay que confirmarlo con una muestra real (un overlay mínimo de
// 3×3 colocado en un punto conocido y exportado desde Wplace). Mientras
// tanto, WPLACE_ZOOM_HIPOTESIS es un valor de prueba fácil de cambiar.

export const TILE_SIZE_WPLACE = 1000; // px por tile, según lo descrito por el usuario

// TODO: verificar con muestra real. En zoom 10 (valor anterior) cada píxel
// cubre ~39 m reales, lo que hace que calles cercanas caigan en el mismo
// puñado de píxeles y se vean como manchones gruesos en vez de líneas finas.
// Wplace permite pintar detalle a escala de vereda/edificio, así que subimos
// la hipótesis a zoom 18 (~0.15 m/px), mucho más cerca de esa resolución.
export const WPLACE_ZOOM_HIPOTESIS = 18;

const RAD = Math.PI / 180;

// Tamaño total del "mundo" proyectado, en píxeles, para el zoom dado.
function tamanoMundoPx(zoom) {
  return TILE_SIZE_WPLACE * 2 ** zoom;
}

// lon/lat (grados) -> coordenadas de píxel en el mundo completo (float).
export function lonLatAPixelMundo(lon, lat, zoom = WPLACE_ZOOM_HIPOTESIS) {
  const tam = tamanoMundoPx(zoom);
  const x = ((lon + 180) / 360) * tam;

  const latRad = lat * RAD;
  const y =
    (0.5 - Math.log(Math.tan(Math.PI / 4 + latRad / 2)) / (2 * Math.PI)) * tam;

  return [x, y];
}

// Inverso de lonLatAPixelMundo, por si hace falta para depurar.
export function pixelMundoALonLat(x, y, zoom = WPLACE_ZOOM_HIPOTESIS) {
  const tam = tamanoMundoPx(zoom);
  const lon = (x / tam) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / tam;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lon, lat];
}

// Ajusta (snap) un punto en píxeles de mundo al píxel entero más cercano
// de la cuadrícula de Wplace.
export function snapAPixel([x, y]) {
  return [Math.round(x), Math.round(y)];
}

// Dado un bbox geográfico, calcula el ancla superior-izquierda ya ajustada
// a la cuadrícula (en píxeles de mundo, enteros) y el tamaño en píxeles de
// la plantilla resultante.
export function calcularAnclaYTamano(bbox, zoom = WPLACE_ZOOM_HIPOTESIS) {
  const { north, west, south, east } = bbox;

  const [xIzqF, yArribaF] = lonLatAPixelMundo(west, north, zoom);
  const [xDerF, yAbajoF] = lonLatAPixelMundo(east, south, zoom);

  const [xIzq, yArriba] = snapAPixel([xIzqF, yArribaF]);
  const [xDer, yAbajo] = snapAPixel([xDerF, yAbajoF]);

  const anchoPx = Math.max(1, xDer - xIzq);
  const altoPx = Math.max(1, yAbajo - yArriba);

  return {
    anclaPixelMundo: [xIzq, yArriba],
    anchoPx,
    altoPx,
    zoom,
  };
}

// Convierte un punto lon/lat a coordenadas de píxel RELATIVAS al ancla de
// la plantilla (es decir, coordenadas dentro del canvas de salida).
export function lonLatAPixelRelativo(lon, lat, ancla, zoom = WPLACE_ZOOM_HIPOTESIS) {
  const [xMundo, yMundo] = lonLatAPixelMundo(lon, lat, zoom);
  return [xMundo - ancla[0], yMundo - ancla[1]];
}
