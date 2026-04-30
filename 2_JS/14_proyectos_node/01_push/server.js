const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Servir archivos estáticos desde la raíz del proyecto
app.use(express.static(path.join(__dirname)));

// Ruta principal para servir el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
    Servidor corriendo en: http://localhost:${PORT}
    Proyecto: push() - El Canasto
    `);
});
