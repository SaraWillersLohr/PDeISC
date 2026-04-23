const express = require('express');
const path = require('path');
const app = express();
const PORT = 3004;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`P4 corriendo en http://localhost:${PORT}`);
});
