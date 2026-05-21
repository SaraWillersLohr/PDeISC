const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const folders = fs.readdirSync(root).filter((f) => /^\d{2}_/.test(f));

const serverBlock = `
// módulos compartidos del TP (../../_shared)
app.use("/_shared", express.static(path.join(__dirname, "..", "_shared")));
`;

folders.forEach((folder) => {
  const serverPath = path.join(root, folder, "server.js");
  if (!fs.existsSync(serverPath)) return;

  let content = fs.readFileSync(serverPath, "utf8");
  if (!content.includes('"/_shared"')) {
    content = content.replace(
      /app\.use\(express\.static\(path\.join\(__dirname\)\)\);/,
      `app.use(express.static(path.join(__dirname)));${serverBlock}`,
    );
    fs.writeFileSync(serverPath, content);
    console.log("server.js →", folder);
  }

  // No tocar rutas en HTML/JS: deben ser relativas (Live Server + node server.js)
});

console.log("Listo.");
