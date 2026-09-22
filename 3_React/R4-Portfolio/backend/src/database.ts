import mysql from "mysql2/promise";
import "dotenv/config";

// El pool se comparte entre repositorios para no abrir una conexión por request.
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "sara_portfolio",
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false,
  },
});
