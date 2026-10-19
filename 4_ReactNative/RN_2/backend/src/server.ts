import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import mariadb, { PoolConnection } from "mariadb";
import { integer, productInput } from "./utils/validation";

// Crea el servidor HTTP que recibe las solicitudes de la aplicación móvil.
const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));
// Administra conexiones reutilizables sin exponer los datos de acceso al frontend.
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "scanstock",
  connectionLimit: 5,
  decimalAsNumber: true,
});

type ApiError = Error & { status?: number };
// Ejecuta una consulta y entrega siempre una conexión de vuelta al pool.
async function query<T>(sql: string, values: unknown[] = []): Promise<T> {
  let connection: PoolConnection | undefined;
  try {
    connection = await pool.getConnection();
    return (await connection.query(sql, values)) as T;
  } finally {
    connection?.release();
  }
}
// Convierte los errores conocidos de la API en respuestas JSON seguras.
function fail(message: string, status = 400): never {
  const error = new Error(message) as ApiError;
  error.status = status;
  throw error;
}
// Responde con la disponibilidad de la API y la base de datos.
app.get("/api/health", async (_req, res, next) => {
  try {
    await query("SELECT 1");
    res.json({ api: "ok", database: "ok" });
  } catch (e) {
    next(e);
  }
});

// Lista productos activos con sus categorías y filtros opcionales.
app.get("/api/productos", async (req, res, next) => {
  try {
    const activo =
      req.query.incluirInactivos === "true" ? "" : "WHERE p.activo = 1";
    const rows = await query<Record<string, unknown>[]>(
      `SELECT p.*, GROUP_CONCAT(DISTINCT c.id) categoria_ids, GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') categorias FROM productos p LEFT JOIN producto_categorias pc ON pc.producto_id=p.id LEFT JOIN categorias c ON c.id=pc.categoria_id ${activo} GROUP BY p.id ORDER BY p.nombre`,
    );
    const filtered = rows.filter(
      (p) =>
        (!req.query.categoria ||
          String(p.categoria_ids || "")
            .split(",")
            .includes(String(req.query.categoria))) &&
        (!req.query.q ||
          `${p.nombre} ${p.codigo}`
            .toLowerCase()
            .includes(String(req.query.q).toLowerCase())),
    );
    res.json(filtered);
  } catch (e) {
    next(e);
  }
});
// Busca un producto por identificador interno.
app.get("/api/productos/:id", async (req, res, next) => {
  try {
    const rows = await query<Record<string, unknown>[]>(
      `SELECT p.*, GROUP_CONCAT(pc.categoria_id) categoria_ids FROM productos p LEFT JOIN producto_categorias pc ON pc.producto_id=p.id WHERE p.id=? GROUP BY p.id`,
      [integer(req.params.id, "ID", 1)],
    );
    if (!rows.length) fail("Producto no encontrado.", 404);
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});
// Busca por código comercial, conservando ceros iniciales.
app.get("/api/productos/codigo/:codigo", async (req, res, next) => {
  try {
    const rows = await query<Record<string, unknown>[]>(
      "SELECT * FROM productos WHERE codigo=?",
      [req.params.codigo],
    );
    if (!rows.length) fail("Producto no encontrado.", 404);
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});
// Crea el producto y su saldo inicial en una única transacción.
app.post("/api/productos", async (req, res, next) => {
  let c: PoolConnection | undefined;
  try {
    const v = productInput(req.body);
    c = await pool.getConnection();
    await c.beginTransaction();
    const result = await c.query(
      "INSERT INTO productos(codigo,nombre,descripcion,precio,stock_actual,stock_minimo,fecha_vencimiento) VALUES(?,?,?,?,?,?,?)",
      [v.codigo, v.nombre, v.descripcion, v.precio, v.stock, v.minimo, v.fecha],
    );
    const id = Number(result.insertId);
    // Guarda cada relación del producto con una categoría elegida.
    for (const categoriaId of v.categorias)
      await c.query(
        "INSERT INTO producto_categorias(producto_id,categoria_id) VALUES(?,?)",
        [id, categoriaId],
      );
    if (v.stock > 0)
      await c.query(
        "INSERT INTO movimientos(producto_id,tipo,cantidad,stock_anterior,stock_posterior) VALUES(?,'entrada',?,0,?)",
        [id, v.stock, v.stock],
      );
    await c.commit();
    res.status(201).json({ id });
  } catch (e) {
    await c?.rollback();
    next(e);
  } finally {
    c?.release();
  }
});
// Actualiza datos generales y asociaciones sin tocar el stock ni el historial.
app.put("/api/productos/:id", async (req, res, next) => {
  let c: PoolConnection | undefined;
  try {
    const id = integer(req.params.id, "ID", 1),
      v = productInput(req.body);
    c = await pool.getConnection();
    await c.beginTransaction();
    const result = await c.query(
      "UPDATE productos SET codigo=?,nombre=?,descripcion=?,precio=?,stock_minimo=?,fecha_vencimiento=? WHERE id=? AND activo=1",
      [v.codigo, v.nombre, v.descripcion, v.precio, v.minimo, v.fecha, id],
    );
    if (!result.affectedRows) fail("Producto no encontrado o inactivo.", 404);
    await c.query("DELETE FROM producto_categorias WHERE producto_id=?", [id]);
    // Vuelve a crear únicamente las asociaciones seleccionadas en la edición.
    for (const cat of v.categorias)
      await c.query(
        "INSERT INTO producto_categorias(producto_id,categoria_id) VALUES(?,?)",
        [id, cat],
      );
    await c.commit();
    res.json({ ok: true });
  } catch (e) {
    await c?.rollback();
    next(e);
  } finally {
    c?.release();
  }
});
// Desactiva un producto y preserva todos sus movimientos.
app.delete("/api/productos/:id", async (req, res, next) => {
  try {
    const r = await query<{ affectedRows: number }>(
      "UPDATE productos SET activo=0 WHERE id=?",
      [integer(req.params.id, "ID", 1)],
    );
    if (!r.affectedRows) fail("Producto no encontrado.", 404);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
// Desactiva varios productos de forma atómica.
app.post("/api/productos/eliminar-multiples", async (req, res, next) => {
  let c: PoolConnection | undefined;
  try {
    const ids = Array.isArray(req.body.ids)
      ? req.body.ids.map((x: unknown) => integer(x, "ID", 1))
      : [];
    if (!ids.length) fail("Seleccioná al menos un producto.");
    c = await pool.getConnection();
    await c.beginTransaction();
    // Desactiva cada identificador dentro de la misma transacción.
    for (const id of ids)
      await c.query("UPDATE productos SET activo=0 WHERE id=?", [id]);
    await c.commit();
    res.json({ cantidad: ids.length });
  } catch (e) {
    await c?.rollback();
    next(e);
  } finally {
    c?.release();
  }
});
// Reactiva un producto previamente desactivado.
app.patch("/api/productos/:id/reactivar", async (req, res, next) => {
  try {
    const r = await query<{ affectedRows: number }>(
      "UPDATE productos SET activo=1 WHERE id=?",
      [integer(req.params.id, "ID", 1)],
    );
    if (!r.affectedRows) fail("Producto no encontrado.", 404);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Devuelve las categorías existentes ordenadas por nombre.
app.get("/api/categorias", async (_req, res, next) => {
  try {
    res.json(await query("SELECT id,nombre FROM categorias ORDER BY nombre"));
  } catch (e) {
    next(e);
  }
});
// Crea una categoría y evita duplicados ignorando mayúsculas y espacios.
app.post("/api/categorias", async (req, res, next) => {
  try {
    const nombre = String(req.body.nombre || "")
      .trim()
      .replace(/\s+/g, " ");
    if (!nombre) fail("El nombre es obligatorio.");
    const r = await query<{ insertId: number }>(
      "INSERT INTO categorias(nombre,nombre_normalizado) VALUES(?,?)",
      [nombre, nombre.toLocaleLowerCase()],
    );
    res.status(201).json({ id: r.insertId, nombre });
  } catch (e) {
    next(e);
  }
});
// Cambia el nombre y su clave normalizada.
app.put("/api/categorias/:id", async (req, res, next) => {
  try {
    const nombre = String(req.body.nombre || "")
      .trim()
      .replace(/\s+/g, " ");
    if (!nombre) fail("El nombre es obligatorio.");
    await query(
      "UPDATE categorias SET nombre=?,nombre_normalizado=? WHERE id=?",
      [nombre, nombre.toLocaleLowerCase(), integer(req.params.id, "ID", 1)],
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
// Elimina categoría; la clave foránea elimina solo las asociaciones.
app.delete("/api/categorias/:id", async (req, res, next) => {
  try {
    await query("DELETE FROM categorias WHERE id=?", [
      integer(req.params.id, "ID", 1),
    ]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Registra una entrada o salida actualizando el saldo bajo bloqueo transaccional.
app.post("/api/movimientos", async (req, res, next) => {
  let c: PoolConnection | undefined;
  try {
    const productoId = integer(req.body.producto_id, "Producto", 1),
      cantidad = integer(req.body.cantidad, "Cantidad", 1),
      tipo = req.body.tipo;
    if (tipo !== "entrada" && tipo !== "salida")
      fail("Tipo de movimiento inválido.");
    c = await pool.getConnection();
    await c.beginTransaction();
    const rows = await c.query(
      "SELECT stock_actual,activo FROM productos WHERE id=? FOR UPDATE",
      [productoId],
    );
    if (!rows.length) fail("Producto no encontrado.", 404);
    if (!rows[0].activo) fail("El producto está inactivo.", 409);
    const antes = Number(rows[0].stock_actual),
      despues = antes + (tipo === "entrada" ? cantidad : -cantidad);
    if (despues < 0) fail("No hay stock suficiente.", 409);
    await c.query("UPDATE productos SET stock_actual=? WHERE id=?", [
      despues,
      productoId,
    ]);
    const m = await c.query(
      "INSERT INTO movimientos(producto_id,tipo,cantidad,stock_anterior,stock_posterior) VALUES(?,?,?,?,?)",
      [productoId, tipo, cantidad, antes, despues],
    );
    await c.commit();
    res
      .status(201)
      .json({
        id: m.insertId,
        stock_anterior: antes,
        stock_posterior: despues,
      });
  } catch (e) {
    await c?.rollback();
    next(e);
  } finally {
    c?.release();
  }
});
// Lista movimientos recientes, opcionalmente limitados a un producto.
app.get("/api/movimientos", async (req, res, next) => {
  try {
    const id = req.query.producto_id
      ? integer(req.query.producto_id, "Producto", 1)
      : null;
    res.json(
      await query(
        "SELECT m.*,p.nombre producto,p.codigo FROM movimientos m JOIN productos p ON p.id=m.producto_id WHERE (? IS NULL OR m.producto_id=?) ORDER BY m.created_at DESC,m.id DESC LIMIT 500",
        [id, id],
      ),
    );
  } catch (e) {
    next(e);
  }
});
// Devuelve los movimientos de un producto, del más reciente al más antiguo.
app.get("/api/productos/:id/movimientos", async (req, res, next) => {
  try {
    res.json(
      await query(
        "SELECT m.*,p.nombre producto FROM movimientos m JOIN productos p ON p.id=m.producto_id WHERE m.producto_id=? ORDER BY m.created_at DESC,m.id DESC",
        [integer(req.params.id, "ID", 1)],
      ),
    );
  } catch (e) {
    next(e);
  }
});
// Calcula indicadores del inventario en MariaDB.
app.get("/api/dashboard", async (_req, res, next) => {
  try {
    const rows = await query<Record<string, number>[]>(
      "SELECT COUNT(*) productos, COALESCE(SUM(stock_actual),0) unidades, COALESCE(SUM(stock_actual <= stock_minimo),0) stock_bajo, COALESCE(SUM(fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(),INTERVAL 7 DAY)),0) proximos_vencer, COALESCE(SUM(fecha_vencimiento < CURDATE()),0) vencidos FROM productos WHERE activo=1",
    );
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

// Oculta detalles SQL y credenciales, manteniendo mensajes seguros.
app.use((err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  const code =
    err.status ||
    ((err as unknown as { code?: string }).code === "ER_DUP_ENTRY" ? 409 : 500);
  const message =
    code === 500
      ? "No se pudo completar la operación. Revisá la conexión con el servidor."
      : err.message;
  res.status(code).json({ error: message });
});
// Inicia el servidor escuchando en todas las interfaces para permitir el acceso desde la red local.
const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`ScanStock API disponible en el puerto ${port}`);
});
