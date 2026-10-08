import express, { type Request, type Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "./database.js";
import { requireAdmin } from "./middlewares/auth.js";
// Este archivo configura las rutas públicas y administrativas de la API.
// Crea la aplicación que recibirá las solicitudes HTTP.
const app = express();
// Define el puerto del servidor o usa el puerto local por defecto.
const port = Number(process.env.PORT || 3001);
// Lee los orígenes permitidos y limpia cada dirección antes de validarla.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, "")))
        return callback(null, true);
      callback(new Error("Origen no permitido por CORS."));
    },
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));
// Configuración de Multer para subir imágenes
//multer es un middleware para manejar la subida de archivos en Express.
// Aquí se configura para almacenar imágenes en la carpeta "uploads" con un nombre único generado por crypto.randomUUID() y
//  una extensión basada en el nombre original del archivo.
// Configura el almacenamiento, el tamaño máximo y los formatos de imagen aceptados.
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads",
    filename: (_req, file, cb) =>
      cb(
        null,
        `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`,
      ),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});
// Lista las colecciones a las que puede acceder la API.
const allowed = [
  "projects",
  "photography",
  "education",
  "skills",
  "timeline_events",
  "learning_items",
  "objectives",
  "social_links",
  "site_settings",
] as const;
type Collection = (typeof allowed)[number];
// Comprueba si el nombre recibido corresponde a una colección permitida.
const collection = (value: string | string[]): Collection | null =>
  typeof value === "string" && allowed.includes(value as Collection)
    ? (value as Collection)
    : null;

// Lectura pública: una respuesta única evita cascadas de peticiones en la landing.
//llama a la base de datos para obtener todos los datos necesarios para mostrar el portfolio en la página principal.
app.get("/api/portfolio", async (_req, res) => {
  try {
    // Consulta en paralelo los datos necesarios para todas las secciones públicas.
    const [
      settings,
      photos,
      projects,
      education,
      skills,
      timeline,
      learning,
      objectives,
      links,
    ] = await Promise.all([
      db.query("SELECT setting_key, setting_value FROM site_settings"),
      db.query("SELECT * FROM photography WHERE active=1 ORDER BY sort_order"),
      db.query("SELECT * FROM projects WHERE active=1 ORDER BY sort_order"),
      db.query("SELECT * FROM education WHERE active=1 ORDER BY sort_order"),
      db.query(
        "SELECT s.*, c.name category FROM skills s JOIN skill_categories c ON c.id=s.category_id WHERE s.active=1 ORDER BY c.sort_order,s.sort_order",
      ),
      db.query(
        "SELECT * FROM timeline_events WHERE active=1 ORDER BY sort_order",
      ),
      db.query(
        "SELECT * FROM learning_items WHERE active=1 ORDER BY sort_order",
      ),
      db.query("SELECT * FROM objectives WHERE active=1 ORDER BY sort_order"),
      db.query("SELECT * FROM social_links WHERE active=1 ORDER BY sort_order"),
    ]);
    res.json({
      settings: Object.fromEntries(
        // Convierte la lista de ajustes en un objeto de clave y valor.
        (
          settings[0] as Array<{ setting_key: string; setting_value: string }>
        ).map((x) => [x.setting_key, x.setting_value]),
      ),
      photos: photos[0],
      projects: projects[0],
      education: education[0],
      skills: skills[0],
      timeline: timeline[0],
      learning: learning[0],
      objectives: objectives[0],
      links: links[0],
    });
  } catch {
    res
      .status(503)
      .json({ message: "No se pudo conectar con la base de datos." });
  }
});
app.get("/api/:collection", async (req, res) => {
  // Valida el nombre de la colección solicitada.
  const name = collection(req.params.collection);
  if (!name) return res.sendStatus(404);
  try {
    // Obtiene los elementos activos de la colección validada.
    const [rows] = await db.query(
      `SELECT * FROM ${name} WHERE active=1 ORDER BY sort_order`,
    );
    res.json(rows);
  } catch {
    res.sendStatus(503);
  }
});
//ruta de login del admin
//valida el email y la contraseña del administrador,
//genera un token JWT si son correctos y devuelve el token junto con un indicador de si es el primer inicio de sesión.
app.post("/api/admin/login", async (req: Request, res: Response) => {
  // Valida el formato del email y la longitud mínima de la contraseña.
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(8) })
    .safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Completá un email y contraseña válidos." });
  // Busca la cuenta activa que corresponde al email recibido.
  const [rows] = await db.query(
    "SELECT id, password_hash, first_login FROM users WHERE email=? AND active=1",
    [parsed.data.email],
  );
  // Lee el usuario encontrado, si existe.
  const user = (
    rows as Array<{ id: number; password_hash: string; first_login: number }>
  )[0];
  if (
    !user ||
    !(await bcrypt.compare(parsed.data.password, user.password_hash))
  )
    return res.status(401).json({ message: "Email o contraseña incorrectos." });
  // Crea un token temporal para las siguientes solicitudes administrativas.
  const token = jwt.sign(
    { sub: user.id },
    process.env.JWT_SECRET ||
      process.env.ADMIN_SECRET ||
      "development-only-secret",
    { expiresIn: "8h" },
  );
  res.json({ token, firstLogin: Boolean(user.first_login) });
});
app.post("/api/admin/change-password", requireAdmin, async (req, res) => {
  // Comprueba que la nueva contraseña tenga la longitud mínima.
  const parsed = z.object({ password: z.string().min(10) }).safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "La contraseña debe tener al menos 10 caracteres." });
  // Guarda la contraseña en formato hash para no almacenar texto plano.
  const hash = await bcrypt.hash(parsed.data.password, 12);
  await db.query("UPDATE users SET password_hash=?,first_login=0 WHERE id=?", [
    hash,
    (req as import("./middlewares/auth.js").AuthRequest).adminId,
  ]);
  res.json({ message: "Contraseña actualizada." });
});
app.get("/api/admin/:collection", requireAdmin, async (req, res) => {
  // Valida la colección solicitada por el administrador.
  const name = collection(req.params.collection);
  if (!name) return res.sendStatus(404);
  // Elige el campo de orden adecuado para esta colección.
  const order = name === "site_settings" ? "setting_key" : "sort_order";
  // Recupera todos los registros de la colección seleccionada.
  const [rows] = await db.query(`SELECT * FROM ${name} ORDER BY ${order}`);
  res.json(rows);
});
app.post(
  "/api/admin/upload",
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ message: "Elegí una imagen JPG, PNG o WebP de hasta 5 MB." });
    res.status(201).json({ path: `/uploads/${req.file.filename}` });
  },
);
app.post("/api/admin/:collection", requireAdmin, async (req, res) => {
  // Valida el nombre de colección y los datos enviados por el formulario.
  const name = collection(req.params.collection);
  if (!name) return res.sendStatus(404);
  // Comprueba que los datos recibidos tengan el formato esperado.
  const data = z.record(z.string(), z.unknown()).safeParse(req.body);
  if (!data.success)
    return res.status(400).json({ message: "Datos inválidos." });
  // Conserva solo las claves que pueden guardarse en la tabla.
  const keys = Object.keys(data.data).filter(
    (k) => !["id", "created_at", "updated_at"].includes(k),
  );
  if (!keys.length)
    return res.status(400).json({ message: "Completá los campos requeridos." });
  // Inserta los campos y valores seleccionados en la base de datos.
  const [result] = await db.query(
    `INSERT INTO ${name} (${keys.map((k) => `\`${k}\``).join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
    keys.map((k) => data.data[k]),
  );
  res.status(201).json({
    id: (result as { insertId: number }).insertId,
    message: "Elemento creado.",
  });
});
app.put("/api/admin/:collection/:id", requireAdmin, async (req, res) => {
  // Valida el nombre de colección y los datos que se quieren actualizar.
  const name = collection(req.params.collection);
  if (!name) return res.sendStatus(404);
  // Comprueba que los datos recibidos tengan el formato esperado.
  const data = z.record(z.string(), z.unknown()).safeParse(req.body);
  if (!data.success)
    return res.status(400).json({ message: "Datos inválidos." });
  // Conserva solo los campos que se pueden modificar.
  const keys = Object.keys(data.data).filter(
    (k) => !["id", "created_at", "updated_at"].includes(k),
  );
  if (!keys.length)
    return res.status(400).json({ message: "No hay cambios para guardar." });
  // Actualiza el registro indicado con los campos recibidos.
  await db.query(
    `UPDATE ${name} SET ${keys.map((k) => `\`${k}\`=?`).join(",")} WHERE id=?`,
    [...keys.map((k) => data.data[k]), req.params.id],
  );
  res.json({ message: "Cambios guardados." });
});
app.delete("/api/admin/:collection/:id", requireAdmin, async (req, res) => {
  // Comprueba la colección antes de eliminar el registro solicitado.
  const name = collection(req.params.collection);
  if (!name) return res.sendStatus(404);
  await db.query(`DELETE FROM ${name} WHERE id=?`, [req.params.id]);
  res.status(204).end();
});
app.use((_req, res) =>
  res.status(404).json({ message: "Ruta no encontrada." }),
);
app.listen(port, () => console.log(`API en http://localhost:${port}`));
