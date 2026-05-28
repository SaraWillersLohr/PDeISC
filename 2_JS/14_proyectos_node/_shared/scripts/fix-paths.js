/**
 * ¡Hola! Este es un script de mantenimiento que hice para arreglar las rutas de mis archivos.
 * A veces, cuando muevo cosas de lugar, las rutas relativas se rompen, y este amiguito me ayuda a restaurarlas.
 */
const fs = require("fs");
const path = require("path");

// Defino dónde está la raíz de mis proyectos y busco todas las carpetas que empiezan con números (mis 14 TPs).
const root = path.join(__dirname, "..", "..");
const folders = fs.readdirSync(root).filter((f) => /^\d{2}_/.test(f));

// Un contenido básico para mis archivos de estilo, por si necesito resetearlos.
const styleContent = `/* Overrides locales del ejercicio (si hace falta) */
`;

// Recorro cada carpeta de proyecto para aplicar los parches.
folders.forEach((folder) => {
  // Arreglo las rutas en el index.html.
  const htmlPath = path.join(root, folder, "pages", "index.html");
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, "utf8");
    html = html.replace(/href="\/_shared\//g, 'href="../../_shared/');
    html = html.replace(/href="\/styles\//g, 'href="../styles/');
    html = html.replace(/src="\/scripts\//g, 'src="../scripts/');
    fs.writeFileSync(htmlPath, html);
    console.log("index.html →", folder);
  }

  // Arreglo los imports en el script.js.
  const scriptPath = path.join(root, folder, "scripts", "script.js");
  if (fs.existsSync(scriptPath)) {
    let script = fs.readFileSync(scriptPath, "utf8");
    script = script.replace(/from "\/_shared\//g, 'from "../../_shared/');
    fs.writeFileSync(scriptPath, script);
    console.log("script.js →", folder);
  }

  // Limpio o reseteo el archivo de estilos locales.
  const stylePath = path.join(root, folder, "styles", "style.css");
  if (fs.existsSync(stylePath)) {
    fs.writeFileSync(stylePath, styleContent);
    console.log("style.css →", folder);
  }
});

console.log("¡Listo! Rutas relativas restauradas correctamente.");
