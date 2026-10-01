// Exportador del archivo .wplace.
//
// LEAD INVESTIGADO: no existe especificación pública oficial de Wplace para
// este archivo. El único formato con control de versión real que pude
// encontrar y verificar contra código fuente (no un blog ni una IA
// alucinando) es el esquema JSON de la herramienta Blue Marble
// (https://github.com/SwingTheVine/Wplace-BlueMarble, src/templateManager.js),
// que es justamente la que produce el error "Template version X is
// unsupported" cuando el campo `schemaVersion` del archivo no coincide con
// el que espera. Ese texto calza con el error reportado ("template
// fileversion no supported"), así que este exportador ahora genera ESE
// esquema (schemaVersion "2.0.0", whoami "BlueMarble").
//
// Si lo que de verdad importa el error no es Blue Marble sino otra
// herramienta, avisar: hace falta el nombre de la app/botón usado para
// importar, o un archivo .wplace real exportado desde ahí, para ajustar
// esto a su formato real.
import { PALETTE, PALETTE_IDS } from "./palette.js";
import { TILE_SIZE_WPLACE } from "./projection.js";

export const FORMATO_WPLACE_CONFIRMADO = false;
const SCHEMA_VERSION = "2.0.0";

// Mapa inverso: color hex (tal cual lo pinta render.js) -> id real de Wplace.
const hexAId = new Map(
  Object.keys(PALETTE).map((clave) => [PALETTE[clave].toLowerCase(), PALETTE_IDS[clave]])
);
const ID_TRANSPARENTE = 0;

function idDePixel(r, g, b, a) {
  if (a === 0) return ID_TRANSPARENTE;
  const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  return hexAId.get(hex) ?? ID_TRANSPARENTE;
}

// Calcula, para cada id de color presente en el canvas, cuántos píxeles tiene.
function contarColores(ctx, ancho, alto) {
  const { data } = ctx.getImageData(0, 0, ancho, alto);
  const colores = new Map();
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    const id = idDePixel(data[i], data[i + 1], data[i + 2], data[i + 3]);
    colores.set(id, (colores.get(id) || 0) + 1);
    if (id !== ID_TRANSPARENTE) total++;
  }

  return { total, colores };
}

// Devuelve, para el rectángulo [xMundo, yMundo, ancho, alto] (en píxeles de
// la cuadrícula de Wplace), la lista de tiles de 1000x1000 que toca, con el
// sub-rectángulo exacto que le corresponde a cada uno.
function tilesCubiertos(xMundo, yMundo, ancho, alto) {
  const tileSize = TILE_SIZE_WPLACE;
  const tileXIni = Math.floor(xMundo / tileSize);
  const tileXFin = Math.floor((xMundo + ancho - 1) / tileSize);
  const tileYIni = Math.floor(yMundo / tileSize);
  const tileYFin = Math.floor((yMundo + alto - 1) / tileSize);

  const resultado = [];
  for (let tileY = tileYIni; tileY <= tileYFin; tileY++) {
    for (let tileX = tileXIni; tileX <= tileXFin; tileX++) {
      const tileXPx0 = tileX * tileSize;
      const tileYPx0 = tileY * tileSize;

      const interXIni = Math.max(xMundo, tileXPx0);
      const interYIni = Math.max(yMundo, tileYPx0);
      const interXFin = Math.min(xMundo + ancho, tileXPx0 + tileSize);
      const interYFin = Math.min(yMundo + alto, tileYPx0 + tileSize);

      resultado.push({
        tileX,
        tileY,
        pixelX: interXIni - tileXPx0,
        pixelY: interYIni - tileYPx0,
        origenX: interXIni - xMundo,
        origenY: interYIni - yMundo,
        ancho: interXFin - interXIni,
        alto: interYFin - interYIni,
      });
    }
  }
  return resultado;
}

function recortarCanvas(canvasOrigen, origenX, origenY, ancho, alto) {
  const recorte = document.createElement("canvas");
  recorte.width = ancho;
  recorte.height = alto;
  const ctx = recorte.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvasOrigen, origenX, origenY, ancho, alto, 0, 0, ancho, alto);
  return recorte;
}

function claveTile(tileX, tileY, pixelX, pixelY) {
  const pad = (n, largo) => String(n).padStart(largo, "0");
  return `${pad(tileX, 4)},${pad(tileY, 4)},${pad(pixelX, 3)},${pad(pixelY, 3)}`;
}

// canvas: el canvas ya rasterizado (imagen final).
// anclaPixelMundo: [x, y] de la esquina superior izquierda, en píxeles de
//   la cuadrícula de Wplace (ver projection.js).
// nombre: nombre legible para el overlay (lo elige la persona que exporta).
export function construirArchivoWplace(canvas, anclaPixelMundo, nombre) {
  const ctx = canvas.getContext("2d");
  const { total, colores } = contarColores(ctx, canvas.width, canvas.height);

  const tiles = {};
  for (const t of tilesCubiertos(anclaPixelMundo[0], anclaPixelMundo[1], canvas.width, canvas.height)) {
    const recorte = recortarCanvas(canvas, t.origenX, t.origenY, t.ancho, t.alto);
    const dataUrl = recorte.toDataURL("image/png");
    tiles[claveTile(t.tileX, t.tileY, t.pixelX, t.pixelY)] = dataUrl.split(",")[1];
  }

  const contenido = {
    whoami: "BlueMarble",
    scriptVersion: "wplacecity-1.0.0",
    schemaVersion: SCHEMA_VERSION,
    templates: {
      "0 wplacecity": {
        name: nombre,
        enabled: true,
        pixels: {
          total,
          colors: Object.fromEntries(colores),
        },
        tiles,
      },
    },
  };

  return JSON.stringify(contenido);
}

export function descargarArchivoWplace(contenidoTexto, nombreArchivo) {
  const nombreLimpio = (nombreArchivo || "wplacecity").trim() || "wplacecity";
  const blob = new Blob([contenidoTexto], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreLimpio.endsWith(".wplace") ? nombreLimpio : `${nombreLimpio}.wplace`;
  a.click();
  URL.revokeObjectURL(url);
}
