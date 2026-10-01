# wplacecity

Generador de plantillas de calles para [Wplace](https://wplace.live), a partir
de datos de [OpenStreetMap](https://www.openstreetmap.org). Es una página web
estática: no hay backend, no hay build, no se conecta a Wplace de ninguna
forma. Solo genera un archivo descargable.

Vive publicada en `discajapon.com/wplacecity` (página no listada: no tiene
enlaces desde el resto del sitio ni aparece en el sitemap).

## Qué hace

1. Mostrás un mapa (Leaflet + teselas de OpenStreetMap).
2. Mantenés **shift** y arrastrás para dibujar un rectángulo sobre la zona
   que te interesa.
3. Se consultan las calles de esa zona a la [API Overpass](https://overpass-api.de/).
4. Elegís uno de 4 estilos visuales; la vista previa en píxeles se actualiza
   al instante (sin volver a consultar Overpass).
5. Descargás el archivo `.wplace` (para importarlo en Wplace desde el ícono
   de Overlays) o un PNG de la misma plantilla.

## Cómo correrlo en local

No hace falta build ni instalar nada. Como usa módulos de JavaScript
(`<script type="module">`), el navegador no puede abrir `index.html`
directamente con `file://` — hay que servirlo con cualquier servidor
estático simple, por ejemplo:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Los 4 estilos

- **Turquesa** — calles menores finas en turquesa claro; vía principal en
  amarillo con núcleo crema. Fondo opcional turquesa.
- **Gris** — calles menores en gris claro; vía principal con contorno negro
  y núcleo blanco; intermedias en amarillo fino. Fondo opcional gris.
- **Rural** — líneas finas beige; es el único estilo que incluye caminos de
  tierra y senderos. Fondo opcional verde claro.
- **Natural** — líneas oscuras y delgadas, densas, pensado para un fondo
  verde de terreno.

Cada estilo es una receta editable en [`src/styles.js`](src/styles.js): qué
tipos de vía de OSM entran en cada nivel (principal / secundaria / menor) y
qué color y grosor les corresponde.

## Estructura del código

```
index.html          página
styles.css           estilos de la página (paleta del sitio principal)
src/
  main.js            wiring: mapa, selección, botones
  overpass.js         consulta a Overpass (con timeout y reintento)
  projection.js        proyección y snap a la cuadrícula de Wplace
  limites.js           topes de tamaño de selección
  styles.js             recetas de los 4 estilos
  render.js              rasterización a canvas
  exporter.js              exportador del archivo .wplace
  palette.js                colores predeterminados de Wplace
```

## Limitaciones conocidas (estado real del proyecto)

- **El exportador `.wplace` sigue siendo PROVISIONAL**, aunque ya no es una
  estructura inventada. No existe especificación pública oficial de Wplace
  para este archivo; lo único con control de versión real que se pudo
  verificar contra código fuente (no contra un blog ni una suposición) es el
  esquema JSON de la herramienta [Blue Marble](https://github.com/SwingTheVine/Wplace-BlueMarble)
  (`schemaVersion`, `whoami: "BlueMarble"`, tiles en base64 recortados por
  tile de 1000×1000). `src/exporter.js` ahora genera ese esquema, porque es
  el que produce justamente el error *"Template version X is unsupported"*
  que se reportó al importar. **Si la herramienta usada para importar no es
  Blue Marble, esto no va a funcionar**: hace falta el nombre de esa
  herramienta/botón, o un archivo real exportado desde ahí, para ajustar el
  exportador a su formato real.
- **La proyección y el snap a la cuadrícula de Wplace siguen siendo una
  hipótesis**, aunque se corrigió un error grueso: el zoom inicial (10) hacía
  que cada píxel cubriera ~39 m reales, por lo que calles cercanas caían
  en los mismos píxeles y se veían como manchones anchos en vez de líneas
  finas. Ahora usa zoom 18 (~0.15 m/px), mucho más cerca de la resolución a
  la que Wplace permite pintar. Sigue sin confirmarse contra una muestra
  real (overlay mínimo de 3×3 px exportado desde Wplace en un punto
  conocido), así que no hay garantía de alineación píxel a píxel.
- **La paleta de colores sí está verificada**: `src/palette.js` usa los 31
  colores gratuitos oficiales de Wplace (id, nombre y RGB), contrastados de
  forma independiente contra el código fuente de Blue Marble y de Wplace
  Overlay Pro (dos proyectos separados que coinciden exactamente).
- Solo dibuja calles. No hay agua, edificios, bosques ni etiquetas.
- Pensado para uso esporádico y de bajo tráfico (un grupo chico). No tiene
  caché ni servidor propio para Overpass/teselas.

## Atribución

Los datos de calles son de © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright),
disponibles bajo licencia [ODbL](https://opendatacommons.org/licenses/odbl/).

## Licencia

[GPL-3.0](LICENSE)
