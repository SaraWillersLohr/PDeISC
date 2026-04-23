const express = require('express');
const path = require('path');
const app = express();
const PORT = 3003;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`P3 corriendo en http://localhost:${PORT}`);
});
