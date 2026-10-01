import { consultarCalles } from "./overpass.js";
import { calcularAnclaYTamano, pixelMundoALonLat } from "./projection.js";
import { seleccionExcedeLimite, LADO_MAXIMO_PX, AREA_MAXIMA_PX } from "./limites.js";
import { ESTILOS } from "./styles.js";
import { renderizarEstilo, contarPixelesPintados } from "./render.js";
import { construirArchivoWplace, descargarArchivoWplace } from "./exporter.js";

// --- Mapa ---------------------------------------------------------------

const mapa = L.map("mapa", { zoomControl: true }).setView([35.681, 139.767], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(mapa);

// Selección de rectángulo a mano (sin plugin extra): click y arrastre.
let dibujando = false;
let esquinaInicial = null;
let rectanguloActual = null;
let bboxSeleccionado = null; // { south, west, north, east }

const btnConsultar = document.getElementById("btnConsultar");
const avisoLimite = document.getElementById("avisoLimite");
const infoSeleccion = document.getElementById("infoSeleccion");

mapa.on("mousedown", (e) => {
  // Solo iniciar selección con el botón derecho libre; click normal navega el mapa.
  if (e.originalEvent.button !== 0 || !e.originalEvent.shiftKey) return;
  dibujando = true;
  esquinaInicial = e.latlng;
  mapa.dragging.disable();
  if (rectanguloActual) mapa.removeLayer(rectanguloActual);
  rectanguloActual = L.rectangle([esquinaInicial, esquinaInicial], {
    color: "#ff6bd6",
    weight: 2,
    fillOpacity: 0.12,
  }).addTo(mapa);
});

mapa.on("mousemove", (e) => {
  if (!dibujando) return;
  rectanguloActual.setBounds([esquinaInicial, e.latlng]);
  actualizarInfoSeleccion(e.latlng);
});

mapa.on("mouseup", () => {
  if (!dibujando) return;
  dibujando = false;
  mapa.dragging.enable();
  const bounds = rectanguloActual.getBounds();
  bboxSeleccionado = {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
});

function actualizarInfoSeleccion(latlngActual) {
  if (!esquinaInicial) return;
  const bounds = L.latLngBounds([esquinaInicial, latlngActual]);
  const bbox = {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
  const { anchoPx, altoPx } = calcularAnclaYTamano(bbox);
  const excede = seleccionExcedeLimite(anchoPx, altoPx);

  infoSeleccion.textContent = `Selección: ${anchoPx} × ${altoPx} px`;
  avisoLimite.style.display = excede ? "block" : "none";
  btnConsultar.disabled = excede;
}

// --- Estado de la plantilla generada -------------------------------------

let viasActuales = null;
let geometriaActual = null; // { anclaPixelMundo, anchoPx, altoPx, zoom }
let anclaLonLat = null; // { lat, lon } de la esquina superior izquierda, ya snappeada

const selectorEstilo = document.getElementById("selectorEstilo");
const checkFondo = document.getElementById("checkFondo");
const previewCanvasWrap = document.getElementById("previewWrap");
const statusEl = document.getElementById("status");
const statsEl = document.getElementById("stats");
const btnDescargarWplace = document.getElementById("btnDescargarWplace");
const btnDescargarPng = document.getElementById("btnDescargarPng");

function setStatus(texto, esError = false) {
  statusEl.textContent = texto;
  statusEl.classList.toggle("is-error", esError);
}

async function consultarYPrevisualizar() {
  if (!bboxSeleccionado) {
    setStatus("Primero dibuja una selección en el mapa (shift + arrastrar).", true);
    return;
  }

  btnConsultar.disabled = true;
  setStatus("Consultando Overpass...");

  try {
    geometriaActual = calcularAnclaYTamano(bboxSeleccionado);
    if (seleccionExcedeLimite(geometriaActual.anchoPx, geometriaActual.altoPx)) {
      setStatus(
        `La selección excede el tope permitido (máx ${LADO_MAXIMO_PX}px de lado, ${AREA_MAXIMA_PX}px² de área).`,
        true
      );
      return;
    }

    viasActuales = await consultarCalles(bboxSeleccionado);
    const [lonAncla, latAncla] = pixelMundoALonLat(
      geometriaActual.anclaPixelMundo[0],
      geometriaActual.anclaPixelMundo[1],
      geometriaActual.zoom
    );
    anclaLonLat = { lat: latAncla, lon: lonAncla };

    setStatus(`${viasActuales.length} vías encontradas.`);
    renderizarPreview();
    btnDescargarWplace.disabled = false;
    btnDescargarPng.disabled = false;
  } catch (error) {
    setStatus(`Error consultando Overpass: ${error.message}`, true);
  } finally {
    btnConsultar.disabled = false;
  }
}

function renderizarPreview() {
  if (!viasActuales || !geometriaActual) return;

  const estilo = ESTILOS[selectorEstilo.value];
  const canvas = renderizarEstilo(viasActuales, estilo, geometriaActual, checkFondo.checked);

  previewCanvasWrap.textContent = "";
  canvas.classList.add("preview-canvas");
  previewCanvasWrap.appendChild(canvas);

  const pintados = contarPixelesPintados(canvas);
  statsEl.textContent =
    `Estilo: ${estilo.nombre} · Tamaño: ${canvas.width} × ${canvas.height} px · ` +
    `Píxeles a pintar: ${pintados}`;

  previewCanvasWrap.dataset.canvasListo = "true";
}

btnConsultar.addEventListener("click", consultarYPrevisualizar);
selectorEstilo.addEventListener("change", renderizarPreview);
checkFondo.addEventListener("change", renderizarPreview);

btnDescargarPng.addEventListener("click", () => {
  const canvas = previewCanvasWrap.querySelector("canvas");
  if (!canvas) return;
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `wplacecity-${selectorEstilo.value}.png`;
  a.click();
});

btnDescargarWplace.addEventListener("click", () => {
  const canvas = previewCanvasWrap.querySelector("canvas");
  if (!canvas || !anclaLonLat) return;
  const contenido = construirArchivoWplace(canvas, anclaLonLat, `wplacecity-${selectorEstilo.value}`);
  descargarArchivoWplace(contenido, `wplacecity-${selectorEstilo.value}`);
});
