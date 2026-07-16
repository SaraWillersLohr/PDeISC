import mysql from 'mysql2/promise';

// Acá creo el pool de conexiones para reutilizar la conexión con MySQL sin abrir y cerrar cada vez
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Estanga',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
