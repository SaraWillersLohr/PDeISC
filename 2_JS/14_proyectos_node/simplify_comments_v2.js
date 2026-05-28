/**
 * ¡Hola! Este script lo usé en algún momento para simplificar los comentarios de mis scripts.
 * Básicamente, busca patrones y los reemplaza por otros más cortitos y fáciles de leer.
 */
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

// Esta función recibe el contenido de un archivo y el nombre del proyecto, y devuelve el contenido con comentarios simplificados.
const simplifyScriptComments = (content, projectName) => {
    // Primero, reemplazo los comentarios de bloque del principio por uno más simple con el nombre del proyecto.
    content = content.replace(/\/\*\*[\s\S]*?\*\//, `// proyecto ${projectName}`);
    
    // Luego, voy simplificando los encabezados de cada sección.
    content = content.replace(/\/\/ --- DATOS INICIALES ---/g, '// constantes');
    content = content.replace(/\/\/ --- ESTADO ---/g, '// variables');
    content = content.replace(/\/\/ --- DOM ---/g, '// elementos html');
    content = content.replace(/\/\/ --- RENDERERS ---/g, '// funciones para dibujar');
    content = content.replace(/\/\/ --- LÓGICA DE EJERCICIOS ---/g, '// logica de los botones');
    content = content.replace(/\/\/ --- LÓGICA ---/g, '// logica de los botones');
    content = content.replace(/\/\/ --- RESET ---/g, '// boton reiniciar');
    content = content.replace(/\/\/ --- INIT ---/g, '// inicio');
    content = content.replace(/\/\/ Init/g, '// inicio');
    
    // También simplifico algunos comentarios específicos dentro de la lógica.
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

// Busco todas las carpetas en el directorio raíz.
const folders = fs.readdirSync(rootDir).filter(f => fs.statSync(path.join(rootDir, f)).isDirectory());

// Recorro cada carpeta y, si tiene un script.js, le aplico la simplificación.
folders.forEach(folder => {
    const scriptPath = path.join(rootDir, folder, 'scripts', 'script.js');
    if (fs.existsSync(scriptPath)) {
        let content = fs.readFileSync(scriptPath, 'utf8');
        content = simplifyScriptComments(content, folder);
        fs.writeFileSync(scriptPath, content);
        console.log(`Updated JS comments in ${folder}`);
    }
});

console.log("¡Listo! Comentarios simplificados en todos los proyectos.");
