import mysql from "mysql2/promise";
//la conexion se reliza con mysql2/promise para poder usar async/await y manejar las consultas de manera asíncrona.
// Esto permite que el código sea más limpio y fácil de leer, evitando el uso de callbacks y promesas explícitas.
// Acá creo el pool de conexiones para reutilizar la conexión con MySQL sin abrir y cerrar cada vez
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "alumnosDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
