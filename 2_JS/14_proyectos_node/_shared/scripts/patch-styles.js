const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const folders = fs
  .readdirSync(root)
  .filter((f) => /^\d{2}_/.test(f) && fs.statSync(path.join(root, f)).isDirectory());

const styleContent = `@import url("/_shared/css/base.css");

/* Overrides locales del ejercicio (si hace falta) */
`;

folders.forEach((folder) => {
  const stylePath = path.join(root, folder, "styles", "style.css");
  if (fs.existsSync(stylePath)) {
    fs.writeFileSync(stylePath, styleContent);
    console.log("style.css →", folder);
  }
});
