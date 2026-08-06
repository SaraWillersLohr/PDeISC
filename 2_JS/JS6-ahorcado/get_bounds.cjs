// este script calcula los límites de las partes del ahorcado y los imprime en la consola.
// se usa para obtener las dimensiones de las imágenes de las partes del ahorcado y poder posicionarlas correctamente en la interfaz.
const fs = require("fs");
const PNG = require("pngjs").PNG;
//el archivo es tipo .cjs para usar require en lugar de import, ya que pngjs no soporta import/export.
function getBoundingBox(imgPath) {
  const buf = fs.readFileSync(imgPath);
  const png = PNG.sync.read(buf);
  let minX = png.width,
    minY = png.height,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      const alpha = png.data[idx + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}
// se definen las partes del ahorcado y se calcula su bounding box.
const parts = [
  "cabeza",
  "cuerpo",
  "brazoizquierdo",
  "brazoderecho",
  "piernaizquierda",
  "piernaderecha",
];
// se recorre cada parte y se imprime su bounding box en la consola.
//bounding box es el rectángulo que rodea la parte del ahorcado, definido por sus coordenadas mínimas y máximas en x e y, así como su ancho y alto.
parts.forEach((name) => {
  try {
    const box = getBoundingBox(`assets/${name}.png`);
    console.log(
      `${name}: w=${box.width}, h=${box.height}, minX=${box.minX}, minY=${box.minY}, maxX=${box.maxX}, maxY=${box.maxY}`,
    );
  } catch (e) {
    console.error(e);
  }
});
