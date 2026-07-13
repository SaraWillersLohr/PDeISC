const fs = require('fs');
const PNG = require('pngjs').PNG;

function getBoundingBox(imgPath) {
  const buf = fs.readFileSync(imgPath);
  const png = PNG.sync.read(buf);
  let minX = png.width, minY = png.height, maxX = 0, maxY = 0;
  for(let y = 0; y < png.height; y++) {
    for(let x = 0; x < png.width; x++) {
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
  return { minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

const parts = [
  'cabeza',
  'cuerpo',
  'brazoizquierdo',
  'brazoderecho',
  'piernaizquierda',
  'piernaderecha'
];

parts.forEach(name => {
  try {
    const box = getBoundingBox(`assets/${name}.png`);
    console.log(`${name}: w=${box.width}, h=${box.height}, minX=${box.minX}, minY=${box.minY}, maxX=${box.maxX}, maxY=${box.maxY}`);
  } catch(e) {
    console.error(e);
  }
});
