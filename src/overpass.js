// Consulta a la API Overpass: trae las vías (highways) dentro de un bbox.
// Devuelve datos vectoriales (coordenadas), nunca imágenes del mapa.

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const TIMEOUT_MS = 25000;
const MAX_REINTENTOS = 1;

// Tags de OSM que nos interesan. Se filtra aquí para no traer de más.
const HIGHWAY_TAGS_RELEVANTES = [
  "motorway", "trunk", "primary", "secondary", "tertiary",
  "residential", "unclassified", "living_street", "service",
  "track", "path", "footway", "pedestrian", "cycleway",
];

function construirQuery(bbox) {
  const { south, west, north, east } = bbox;
  const filtroTags = HIGHWAY_TAGS_RELEVANTES.join("|");
  return `
    [out:json][timeout:25];
    (
      way["highway"~"^(${filtroTags})$"](${south},${west},${north},${east});
    );
    out geom;
  `;
}

async function unaConsulta(bbox, signal) {
  const query = construirQuery(bbox);
  const respuesta = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    body: new URLSearchParams({ data: query }),
    signal,
  });

  if (!respuesta.ok) {
    throw new Error(`Overpass respondió con estado ${respuesta.status}`);
  }

  return respuesta.json();
}

// Consulta las vías del bbox dado, con timeout y un reintento simple.
// bbox = { south, west, north, east } en grados decimales.
// Devuelve un array de vías: [{ tipo: "primary", puntos: [[lat, lon], ...] }, ...]
export async function consultarCalles(bbox) {
  let ultimoError = null;

  for (let intento = 0; intento <= MAX_REINTENTOS; intento++) {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);

    try {
      const datos = await unaConsulta(bbox, controlador.signal);
      clearTimeout(temporizador);
      return normalizarRespuesta(datos);
    } catch (error) {
      clearTimeout(temporizador);
      ultimoError = error;
      // Si fue el usuario quien abortó (no el timeout), no tiene sentido reintentar.
      if (error.name === "AbortError" && intento === MAX_REINTENTOS) break;
    }
  }

  throw new Error(
    `No se pudo consultar Overpass tras ${MAX_REINTENTOS + 1} intento(s): ${ultimoError?.message ?? ultimoError}`
  );
}

function normalizarRespuesta(datos) {
  const elementos = datos.elements || [];
  return elementos
    .filter((el) => el.type === "way" && Array.isArray(el.geometry))
    .map((el) => ({
      tipo: el.tags?.highway || "unclassified",
      puntos: el.geometry.map((p) => [p.lat, p.lon]),
    }));
}
