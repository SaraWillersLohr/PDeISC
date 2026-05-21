/**
 * Restaura rutas relativas para que funcionen con Live Server y node server.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const folders = fs.readdirSync(root).filter((f) => /^\d{2}_/.test(f));

const styleContent = `/* Overrides locales del ejercicio (si hace falta) */
`;

folders.forEach((folder) => {
  const htmlPath = path.join(root, folder, "pages", "index.html");
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, "utf8");
    html = html.replace(/href="\/_shared\//g, 'href="../../_shared/');
    html = html.replace(/href="\/styles\//g, 'href="../styles/');
    html = html.replace(/src="\/scripts\//g, 'src="../scripts/');
    fs.writeFileSync(htmlPath, html);
    console.log("index.html →", folder);
  }

  const scriptPath = path.join(root, folder, "scripts", "script.js");
  if (fs.existsSync(scriptPath)) {
    let script = fs.readFileSync(scriptPath, "utf8");
    script = script.replace(/from "\/_shared\//g, 'from "../../_shared/');
    fs.writeFileSync(scriptPath, script);
    console.log("script.js →", folder);
  }

  const stylePath = path.join(root, folder, "styles", "style.css");
  if (fs.existsSync(stylePath)) {
    fs.writeFileSync(stylePath, styleContent);
    console.log("style.css →", folder);
  }
});

console.log("Rutas relativas restauradas.");
