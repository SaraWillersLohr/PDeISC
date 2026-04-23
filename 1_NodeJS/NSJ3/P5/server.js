const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3005;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

// Endpoint para obtener datos con un retraso simulado
app.get('/api/products', (req, res) => {
    setTimeout(() => {
        const dataPath = path.join(__dirname, 'data', 'products.json');
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'No se pudieron cargar los datos' });
            }
            res.json(JSON.parse(data));
        });
    }, 1500); // 1.5 segundos de retraso
});

app.listen(PORT, () => {
    console.log(`P5 corriendo en http://localhost:${PORT}`);
});
