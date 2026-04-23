const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal que redirige al index.html en pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`P1 corriendo en http://localhost:${PORT}`);
});
