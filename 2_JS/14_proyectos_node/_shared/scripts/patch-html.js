// Comentarios claros: este archivo explica la lógica paso a paso.

/**
 * ¡Hola! Este script lo uso para inyectar etiquetas y clases comunes en todos mis archivos HTML.
 * Así me aseguro de que todos los TPs tengan la misma fuente, los mismos estilos compartidos y animaciones.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

// Un mapeo de mis carpetas a los IDs de los métodos.
const methodMap = {
  "01_push": "push",
  "02_pop": "pop",
  "03_unshift": "unshift",
  "04_shift": "shift",
  "05_splice": "splice",
  "06_slice": "slice",
  "07_indexof": "indexOf",
  "08_includes": "includes",
  "09_foreach": "forEach",
  "10_map": "map",
  "11_filter": "filter",
  "12_reduce": "reduce",
  "13_sort": "sort",
  "14_reverse": "reverse",
};

// Estos son los links que quiero inyectar en el <head> de cada HTML.
const sharedLinks = `
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../_shared/css/base.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />`;

const folders = Object.keys(methodMap);

// Recorro cada carpeta y aplico los parches.
folders.forEach((folder) => {
  const htmlPath = path.join(root, folder, "pages", "index.html");
  // Comprueba si la condición es verdadera y, si lo es, ejecuta este bloque.
if (!fs.existsSync(htmlPath)) return;

  let html = fs.readFileSync(htmlPath, "utf8");
  const methodId = methodMap[folder];

  // Le agrego un atributo data-method al body para saber qué método estamos viendo.
  if (!html.includes('data-method="')) {
    html = html.replace(/<body([^>]*)>/, `<body$1 data-method="${methodId}">`);
  }

  // Inyecto los links compartidos si no están ya.
  if (!html.includes("_shared/css/base.css")) {
    html = html.replace(
      /<link rel="stylesheet" href="\.\.\/styles\/style\.css">/,
      `${sharedLinks}
    <link rel="stylesheet" href="../styles/style.css">`,
    );
  }

  // Agrego una clase especial al header para poder darle estilos comunes.
  if (!html.includes('class="tp-header"')) {
    html = html.replace(
      /<header class="text-center/g,
      '<header class="tp-header text-center',
    );
  }

  // Limpio algunas clases de Bootstrap que me molestan con el modo oscuro.
  html = html.replace(/\btext-dark\b/g, "");

  fs.writeFileSync(htmlPath, html);
  console.log("index.html →", folder);
});

console.log("¡HTMLs parcheados y listos!");