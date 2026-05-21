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

  const scriptPath = path.join(root, folder, "scripts", "script.js");
  if (fs.existsSync(scriptPath)) {
    let script = fs.readFileSync(scriptPath, "utf8");
    script = script.replace(/\.\.\/\.\.\/_shared\//g, "/_shared/");
    fs.writeFileSync(scriptPath, script);
  }

  const htmlPath = path.join(root, folder, "pages", "index.html");
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, "utf8");
    html = html.replace(/\.\.\/\.\.\/_shared\//g, "/_shared/");
    html = html.replace(/href="\.\.\/styles\//g, 'href="/styles/');
    html = html.replace(/src="\.\.\/scripts\//g, 'src="/scripts/');
    fs.writeFileSync(htmlPath, html);
  }
});

console.log("Listo.");
