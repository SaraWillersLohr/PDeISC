// conexión con la base de datos para usar mysql en el proyecto.
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "Estanga",
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
