// Comentarios claros: este archivo explica la lógica paso a paso.

/**
 * ¡Hola! Este script lo uso para resetear o limpiar los archivos de estilos locales de cada TP.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
// Busco todas las carpetas que representan un TP.
const folders = fs
  .readdirSync(root)
  .filter((f) => /^\d{2}_/.test(f) && fs.statSync(path.join(root, f)).isDirectory());

// Un comentario básico para indicar que aquí van los estilos locales si hacen falta.
const styleContent = `/* Overrides locales del ejercicio (si hace falta) */
`;

// Recorro cada carpeta y sobreescribo el archivo style.css local.
folders.forEach((folder) => {
  const stylePath = path.join(root, folder, "styles", "style.css");
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (fs.existsSync(stylePath)) {
    fs.writeFileSync(stylePath, styleContent);
    console.log("style.css →", folder);
  }
});

console.log("¡Estilos locales reseteados!");