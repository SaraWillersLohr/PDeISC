const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
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

const sharedLinks = `
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../_shared/css/base.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />`;

const folders = Object.keys(methodMap);

folders.forEach((folder) => {
  const htmlPath = path.join(root, folder, "pages", "index.html");
  if (!fs.existsSync(htmlPath)) return;

  let html = fs.readFileSync(htmlPath, "utf8");
  const methodId = methodMap[folder];

  if (!html.includes('data-method="')) {
    html = html.replace(/<body([^>]*)>/, `<body$1 data-method="${methodId}">`);
  }

  if (!html.includes("_shared/css/base.css")) {
    html = html.replace(
      /<link rel="stylesheet" href="\.\.\/styles\/style\.css">/,
      `${sharedLinks}
    <link rel="stylesheet" href="../styles/style.css">`,
    );
  }

  if (!html.includes('class="tp-header"')) {
    html = html.replace(
      /<header class="text-center/g,
      '<header class="tp-header text-center',
    );
  }

  html = html.replace(/\btext-dark\b/g, "");

  fs.writeFileSync(htmlPath, html);
  console.log("index.html →", folder);
});
