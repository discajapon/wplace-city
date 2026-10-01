// Rasterización de las calles sobre un canvas, a la escala exacta de la
// cuadrícula de Wplace: 1 píxel de canvas = 1 píxel de plantilla.
// Líneas duras (sin antialiasing), fondo transparente salvo que se pida
// "incluir fondo".

import { lonLatAPixelRelativo } from "./projection.js";
import { nivelDeVia } from "./styles.js";

// Dibuja un segmento grueso sin antialiasing: por cada píxel de la línea
// (Bresenham), rellena un cuadrado de lado "grosorPx" centrado en ese
// píxel. Es deliberadamente "bloque", no una línea suavizada.
function dibujarSegmentoGrueso(ctx, x0, y0, x1, y1, grosorPx) {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);

  const medio = Math.floor(grosorPx / 2);

  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;

  // Límite de seguridad por si el segmento es absurdamente largo.
  let pasosRestantes = 4096;

  while (pasosRestantes-- > 0) {
    ctx.fillRect(x0 - medio, y0 - medio, grosorPx, grosorPx);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * error;
    if (e2 >= dy) {
      error += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      error += dx;
      y0 += sy;
    }
  }
}

// Renderiza las vías sobre un canvas nuevo.
//
// vias: salida de consultarCalles() -> [{ tipo, puntos: [[lat, lon], ...] }]
// estilo: una entrada de ESTILOS (ver styles.js)
// ancla / zoom: resultado de calcularAnclaYTamano()
// incluirFondo: boolean
export function renderizarEstilo(vias, estilo, { anclaPixelMundo, anchoPx, altoPx, zoom }, incluirFondo) {
  const canvas = document.createElement("canvas");
  canvas.width = anchoPx;
  canvas.height = altoPx;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  if (incluirFondo) {
    ctx.fillStyle = estilo.fondoColor;
    ctx.fillRect(0, 0, anchoPx, altoPx);
  }

  // Agrupa las vías por nivel una sola vez.
  const viasPorNivel = { principal: [], secundaria: [], menor: [] };
  for (const via of vias) {
    const nivel = nivelDeVia(via.tipo, estilo);
    if (nivel) viasPorNivel[nivel].push(via);
  }

  // Dibuja capa por capa, en el orden definido por la receta del estilo
  // (así el núcleo de una vía principal queda sobre su contorno).
  for (const capa of estilo.capas) {
    ctx.fillStyle = capa.color;
    for (const via of viasPorNivel[capa.nivel]) {
      const puntosPx = via.puntos.map(([lat, lon]) =>
        lonLatAPixelRelativo(lon, lat, anclaPixelMundo, zoom)
      );
      for (let i = 0; i < puntosPx.length - 1; i++) {
        const [x0, y0] = puntosPx[i];
        const [x1, y1] = puntosPx[i + 1];
        dibujarSegmentoGrueso(ctx, x0, y0, x1, y1, capa.grosorPx);
      }
    }
  }

  return canvas;
}

// Cuenta los píxeles no transparentes de un canvas (cuánto trabajo
// implica pintar la plantilla).
export function contarPixelesPintados(canvas) {
  const ctx = canvas.getContext("2d");
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let contador = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 0) contador++;
  }
  return contador;
}
