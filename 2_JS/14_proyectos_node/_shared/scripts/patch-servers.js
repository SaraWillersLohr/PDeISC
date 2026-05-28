/**
 * ¡Hola! Este script lo uso para asegurarme de que todos mis servidores de Express 
 * tengan acceso a la carpeta compartida "_shared".
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
// Busco todas las carpetas que representan un TP.
const folders = fs.readdirSync(root).filter((f) => /^\d{2}_/.test(f));

// Este es el bloque de código que quiero inyectar en cada server.js.
const serverBlock = `
// módulos compartidos del TP (../../_shared)
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));
`;

// Recorro cada carpeta y parcheo el archivo server.js si es necesario.
folders.forEach((folder) => {
  const serverPath = path.join(root, folder, "server.js");
  if (!fs.existsSync(serverPath)) return;

  let content = fs.readFileSync(serverPath, "utf8");
  // Si no tiene la ruta compartida, se la agrego después de la configuración de archivos estáticos básicos.
  if (!content.includes('"/_shared"')) {
    content = content.replace(
      /app\.use\(express\.static\(path\.join\(__dirname\)\)\);/,
      `app.use(express.static(path.join(__dirname)));${serverBlock}`,
    );
    fs.writeFileSync(serverPath, content);
    console.log("server.js →", folder);
  }
});

console.log("¡Servidores actualizados!");
