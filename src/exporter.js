// Exportador del archivo .wplace — PROVISIONAL, NO CONFIRMADO.
//
// No existe especificación pública oficial del formato .wplace. Lo único
// que se sabe (descrito por el usuario) es que es un archivo de texto que
// contiene la imagen en base64 más configuración: id, nombre, tamaño,
// opacidad, posición geográfica (lat/lon) y quizá ajustes avanzados.
//
// Este módulo queda aislado a propósito: cuando llegue una muestra real
// (un overlay mínimo de 3×3 exportado desde Wplace), hay que ajustar
// SOLO este archivo para que coincida con el formato real. Nada fuera de
// aquí debería asumir la forma exacta del archivo.
//
// NO afirmar en ninguna parte de la UI que el archivo generado es
// compatible con Wplace hasta confirmar el formato con esa muestra.

export const FORMATO_WPLACE_CONFIRMADO = false;

function generarIdProvisional() {
  return `wplacecity-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

// canvas: el canvas ya rasterizado (imagen final).
// ancla: { lat, lon } del punto de anclaje (esquina superior izquierda).
// nombre: nombre legible para el overlay.
export function construirArchivoWplace(canvas, ancla, nombre) {
  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];

  // Estructura PROVISIONAL: una suposición razonable, no una verificada.
  const contenido = {
    _provisional: true,
    _aviso: "Formato NO confirmado contra Wplace real. Ver src/exporter.js.",
    id: generarIdProvisional(),
    name: nombre,
    width: canvas.width,
    height: canvas.height,
    opacity: 1,
    lat: ancla.lat,
    lng: ancla.lon,
    image: `data:image/png;base64,${base64}`,
  };

  return JSON.stringify(contenido, null, 2);
}

export function descargarArchivoWplace(contenidoTexto, nombreArchivo) {
  const blob = new Blob([contenidoTexto], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo.endsWith(".wplace") ? nombreArchivo : `${nombreArchivo}.wplace`;
  a.click();
  URL.revokeObjectURL(url);
}
