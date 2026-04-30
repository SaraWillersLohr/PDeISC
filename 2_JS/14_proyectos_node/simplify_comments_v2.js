const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

const simplifyScriptComments = (content, projectName) => {
    // Remove block comments at the top
    content = content.replace(/\/\*\*[\s\S]*?\*\//, `// proyecto ${projectName}`);
    
    // Replace section headers
    content = content.replace(/\/\/ --- DATOS INICIALES ---/g, '// constantes');
    content = content.replace(/\/\/ --- ESTADO ---/g, '// variables');
    content = content.replace(/\/\/ --- DOM ---/g, '// elementos html');
    content = content.replace(/\/\/ --- RENDERERS ---/g, '// funciones para dibujar');
    content = content.replace(/\/\/ --- LÓGICA DE EJERCICIOS ---/g, '// logica de los botones');
    content = content.replace(/\/\/ --- LÓGICA ---/g, '// logica de los botones');
    content = content.replace(/\/\/ --- RESET ---/g, '// boton reiniciar');
    content = content.replace(/\/\/ --- INIT ---/g, '// inicio');
    content = content.replace(/\/\/ Init/g, '// inicio');
    
    // Simplifications inside logic
    content = content.replace(/\/\/ MÉTODO ARRAY:(.*?)( - Ejercicio \d+)?/g, (match, p1) => {
        return `// usando el metodo ${p1.trim().toLowerCase()}`;
    });
    content = content.replace(/\/\/ LÓGICA LITERAL:(.*?)/g, (match, p1) => {
        return `// usamos: ${p1.trim()}`;
    });
    content = content.replace(/\/\/ Usamos un pequeño delay para que el usuario vea el proceso académico/g, '// delay visual');
    content = content.replace(/\/\/ Deshabilitar si ya se cumplió la consigna literal/g, '// deshabilito si ya esta listo');
    content = content.replace(/\/\/ Deshabilitar botones si el array está vacío/g, '// deshabilito si no hay nada');

    return content;
};

const folders = fs.readdirSync(rootDir).filter(f => fs.statSync(path.join(rootDir, f)).isDirectory());

folders.forEach(folder => {
    const scriptPath = path.join(rootDir, folder, 'scripts', 'script.js');
    if (fs.existsSync(scriptPath)) {
        let content = fs.readFileSync(scriptPath, 'utf8');
        content = simplifyScriptComments(content, folder);
        fs.writeFileSync(scriptPath, content);
        console.log(`Updated JS comments in ${folder}`);
    }
});
console.log("Done!");
