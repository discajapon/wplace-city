// Paleta oficial de colores GRATUITOS de Wplace.
//
// CONFIRMADA: id, nombre y RGB verificados contra el código fuente del
// userscript Blue Marble (https://github.com/SwingTheVine/Wplace-BlueMarble,
// src/utils.js) y contrastados de forma independiente contra el userscript
// Wplace Overlay Pro (https://github.com/ShinkoNet/Wplace-Overlay-Pro,
// src/core/palette.ts): ambos proyectos, mantenidos por separado, listan
// exactamente los mismos 31 colores gratuitos en el mismo orden.
export const PALETA_CONFIRMADA = true;

// Todos los colores oficiales de Wplace, gratuitos y premium, con su id real
// (el id es el que usa el propio juego para identificar el color de un
// píxel). Solo se exponen los gratuitos (premium: false) para usar en los
// estilos, porque la receta #9 exige evitar colores premium.
export const WPLACE_COLORS = [
  { id: 0, name: "Transparent", premium: false, rgb: [0, 0, 0] },
  { id: 1, name: "Black", premium: false, rgb: [0, 0, 0] },
  { id: 2, name: "Dark Gray", premium: false, rgb: [60, 60, 60] },
  { id: 3, name: "Gray", premium: false, rgb: [120, 120, 120] },
  { id: 4, name: "Light Gray", premium: false, rgb: [210, 210, 210] },
  { id: 5, name: "White", premium: false, rgb: [255, 255, 255] },
  { id: 6, name: "Deep Red", premium: false, rgb: [96, 0, 24] },
  { id: 7, name: "Red", premium: false, rgb: [237, 28, 36] },
  { id: 8, name: "Orange", premium: false, rgb: [255, 127, 39] },
  { id: 9, name: "Gold", premium: false, rgb: [246, 170, 9] },
  { id: 10, name: "Yellow", premium: false, rgb: [249, 221, 59] },
  { id: 11, name: "Light Yellow", premium: false, rgb: [255, 250, 188] },
  { id: 12, name: "Dark Green", premium: false, rgb: [14, 185, 104] },
  { id: 13, name: "Green", premium: false, rgb: [19, 230, 123] },
  { id: 14, name: "Light Green", premium: false, rgb: [135, 255, 94] },
  { id: 15, name: "Dark Teal", premium: false, rgb: [12, 129, 110] },
  { id: 16, name: "Teal", premium: false, rgb: [16, 174, 166] },
  { id: 17, name: "Light Teal", premium: false, rgb: [19, 225, 190] },
  { id: 18, name: "Dark Blue", premium: false, rgb: [40, 80, 158] },
  { id: 19, name: "Blue", premium: false, rgb: [64, 147, 228] },
  { id: 20, name: "Cyan", premium: false, rgb: [96, 247, 242] },
  { id: 21, name: "Indigo", premium: false, rgb: [107, 80, 246] },
  { id: 22, name: "Light Indigo", premium: false, rgb: [153, 177, 251] },
  { id: 23, name: "Dark Purple", premium: false, rgb: [120, 12, 153] },
  { id: 24, name: "Purple", premium: false, rgb: [170, 56, 185] },
  { id: 25, name: "Light Purple", premium: false, rgb: [224, 159, 249] },
  { id: 26, name: "Dark Pink", premium: false, rgb: [203, 0, 122] },
  { id: 27, name: "Pink", premium: false, rgb: [236, 31, 128] },
  { id: 28, name: "Light Pink", premium: false, rgb: [243, 141, 169] },
  { id: 29, name: "Dark Brown", premium: false, rgb: [104, 70, 52] },
  { id: 30, name: "Brown", premium: false, rgb: [149, 104, 42] },
  { id: 31, name: "Beige", premium: false, rgb: [248, 178, 119] },
];

function aHex([r, g, b]) {
  const h = (n) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

const colorPorNombre = Object.fromEntries(WPLACE_COLORS.map((c) => [c.name, aHex(c.rgb)]));
const idPorNombre = Object.fromEntries(WPLACE_COLORS.map((c) => [c.name, c.id]));

// Nombres de rol usados por las recetas de estilo (src/styles.js), cada uno
// mapeado a un color GRATUITO real de Wplace.
export const PALETTE = {
  blanco: colorPorNombre.White,
  negro: colorPorNombre.Black,
  grisClaro: colorPorNombre["Light Gray"],
  crema: colorPorNombre["Light Yellow"],
  amarillo: colorPorNombre.Yellow,
  beige: colorPorNombre.Beige,
  turquesaClaro: colorPorNombre["Light Teal"],
  turquesaFondo: colorPorNombre["Dark Teal"],
  verdeClaroFondo: colorPorNombre["Light Green"],
  verdeOscuro: colorPorNombre["Dark Brown"],
  verdeTerrenoFondo: colorPorNombre["Dark Green"],
  grisFondo: colorPorNombre["Dark Gray"],
};

// Id real de Wplace para cada color de rol (lo necesita el exportador
// .wplace, que identifica colores por id, no por RGB).
export const PALETTE_IDS = {
  blanco: idPorNombre.White,
  negro: idPorNombre.Black,
  grisClaro: idPorNombre["Light Gray"],
  crema: idPorNombre["Light Yellow"],
  amarillo: idPorNombre.Yellow,
  beige: idPorNombre.Beige,
  turquesaClaro: idPorNombre["Light Teal"],
  turquesaFondo: idPorNombre["Dark Teal"],
  verdeClaroFondo: idPorNombre["Light Green"],
  verdeOscuro: idPorNombre["Dark Brown"],
  verdeTerrenoFondo: idPorNombre["Dark Green"],
  grisFondo: idPorNombre["Dark Gray"],
};
