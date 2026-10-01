// Recetas de estilo: qué tipos de vía de OSM entran en cada nivel
// (principal / secundaria / menor), y color + grosor por nivel.
// Separado de la lógica de render para que agregar o ajustar un estilo
// sea editar este objeto, nada más.

import { PALETTE } from "./palette.js";

// Clasificación común de tags de OSM en los tres niveles de jerarquía.
const NIVELES_BASE = {
  principal: ["motorway", "trunk", "primary"],
  secundaria: ["secondary", "tertiary"],
  menor: ["residential", "unclassified", "living_street", "service"],
};

// El estilo "rural" suma caminos de tierra y senderos, que los demás
// estilos ignoran.
const NIVELES_RURAL = {
  ...NIVELES_BASE,
  menor: [...NIVELES_BASE.menor, "track", "path", "footway"],
};

export const ESTILOS = {
  turquesa: {
    nombre: "Turquesa",
    niveles: NIVELES_BASE,
    fondoColor: PALETTE.turquesaFondo,
    capas: [
      // De atrás hacia adelante: menores, luego principal (núcleo sobre contorno).
      { nivel: "menor", color: PALETTE.turquesaClaro, grosorPx: 1 },
      { nivel: "secundaria", color: PALETTE.turquesaClaro, grosorPx: 1 },
      { nivel: "principal", color: PALETTE.amarillo, grosorPx: 3 },
      { nivel: "principal", color: PALETTE.crema, grosorPx: 1 },
    ],
  },

  gris: {
    nombre: "Gris",
    niveles: NIVELES_BASE,
    fondoColor: PALETTE.grisFondo,
    capas: [
      { nivel: "menor", color: PALETTE.grisClaro, grosorPx: 1 },
      { nivel: "secundaria", color: PALETTE.amarillo, grosorPx: 1 },
      { nivel: "principal", color: PALETTE.negro, grosorPx: 3 },
      { nivel: "principal", color: PALETTE.blanco, grosorPx: 1 },
    ],
  },

  rural: {
    nombre: "Rural",
    niveles: NIVELES_RURAL,
    fondoColor: PALETTE.verdeClaroFondo,
    capas: [
      { nivel: "menor", color: PALETTE.beige, grosorPx: 1 },
      { nivel: "secundaria", color: PALETTE.beige, grosorPx: 1 },
      { nivel: "principal", color: PALETTE.beige, grosorPx: 1 },
    ],
  },

  natural: {
    nombre: "Natural",
    niveles: NIVELES_BASE,
    fondoColor: PALETTE.verdeTerrenoFondo,
    capas: [
      { nivel: "menor", color: PALETTE.verdeOscuro, grosorPx: 1 },
      { nivel: "secundaria", color: PALETTE.verdeOscuro, grosorPx: 1 },
      { nivel: "principal", color: PALETTE.verdeOscuro, grosorPx: 1 },
    ],
  },
};

// Dado el tag "highway" de OSM, devuelve su nivel ("principal" |
// "secundaria" | "menor") según la receta del estilo, o null si ese
// estilo no dibuja ese tipo de vía.
export function nivelDeVia(tagHighway, estilo) {
  for (const [nivel, tags] of Object.entries(estilo.niveles)) {
    if (tags.includes(tagHighway)) return nivel;
  }
  return null;
}
