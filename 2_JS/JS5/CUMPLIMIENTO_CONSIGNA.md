# Cumplimiento de Consigna - Proyecto Base de Datos y API

## 📋 Consigna

**PROYECTO A:**

1. Crear una base de datos llamada `alumnosDB` con tabla `alumnos` (id, nombre, apellido, edad). Insertar 5 alumnos de ejemplo con interfaz de carga.
2. Hacer una API REST que exponga los datos como JSON.

**PROYECTO B:** 3. Consumir la API desde JavaScript y mostrar los datos.

---

## ✅ PROYECTO A - Puntos 1 y 2

### **PUNTO 1: Base de Datos alumnosDB**

#### 1.1 Crear Base de Datos

**Archivo:** `A/setup-alumnosdb.js`

- **Línea 15:** Crear base de datos `alumnosDB`

  ```javascript
  await connection.query("CREATE DATABASE IF NOT EXISTS alumnosDB");
  ```

- **Línea 18:** Seleccionar la base de datos
  ```javascript
  await connection.query("USE alumnosDB");
  ```

#### 1.2 Crear Tabla con Campos Específicos

**Archivo:** `A/setup-alumnosdb.js` (Líneas 21-30)

```javascript
await connection.query(`
  CREATE TABLE IF NOT EXISTS alumnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    edad INT NOT NULL
  )
`);
```

✅ Campos exactos según consigna:

- `id INT AUTO_INCREMENT PRIMARY KEY` ✓
- `nombre VARCHAR` ✓
- `apellido VARCHAR` ✓
- `edad INT` ✓

#### 1.3 Insertar 5 Alumnos de Ejemplo

**Archivo:** `A/setup-alumnosdb.js` (Líneas 39-49)

```javascript
const alumnos = [
  ["Juan", "Pérez", 20],
  ["María", "González", 22],
  ["Carlos", "López", 19],
  ["Ana", "Martínez", 21],
  ["Pedro", "Rodríguez", 23],
];

for (const [nombre, apellido, edad] of alumnos) {
  await connection.execute(
    "INSERT INTO alumnos (nombre, apellido, edad) VALUES (?, ?, ?)",
    [nombre, apellido, edad],
  );
}
```

✅ 5 alumnos de ejemplo insertados correctamente.

**Ejecución:** `node setup-alumnosdb.js`

#### 1.4 Interfaz para Cargar Alumnos

**Archivo:** `A/pages/index.html` (Líneas 35-75)

```html
<form id="form-alumno" novalidate>
  <div class="row g-3">
    <div class="col-md-4">
      <label for="nombre" class="form-label">Nombre</label>
      <input
        type="text"
        class="form-control"
        id="nombre"
        name="nombre"
        required
        minlength="2"
        maxlength="100"
        pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s'\-]+"
      />
      <div class="mensaje-campo" id="error-nombre"></div>
    </div>
    <div class="col-md-4">
      <label for="apellido" class="form-label">Apellido</label>
      <input
        type="text"
        class="form-control"
        id="apellido"
        name="apellido"
        required
        minlength="2"
        maxlength="100"
        pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s'\-]+"
      />
      <div class="mensaje-campo" id="error-apellido"></div>
    </div>
    <div class="col-md-4">
      <label for="edad" class="form-label">Edad</label>
      <input
        type="number"
        class="form-control"
        id="edad"
        name="edad"
        required
        min="11"
        max="120"
      />
      <div class="mensaje-campo" id="error-edad"></div>
    </div>
  </div>
  <div class="mt-3">
    <button type="submit" class="btn-estanga">Registrar Alumno</button>
  </div>
</form>
```

✅ Interfaz HTML funcional para registrar alumnos con validación.

---

### **PUNTO 2: API REST que expone datos como JSON**

#### 2.1 Configuración de Conexión a BD

**Archivo:** `A/database/conexion.js` (Líneas 1-14)

```javascript
import mysql from "mysql2/promise";

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
```

✅ Pool de conexiones conectado a base de datos `alumnosDB`.

#### 2.2 Rutas API REST

**Archivo:** `A/routes/alumnosRoutes.js` (Líneas 1-14)

```javascript
import { Router } from "express";
import {
  crearAlumno,
  listarAlumnos,
} from "../controllers/alumnosController.js";

const router = Router();

router.post("/alumnos", crearAlumno);
router.get("/listar-alumnos", listarAlumnos);

export default router;
```

✅ Rutas definidas:

- `POST /api/alumnos` - Crea alumnos
- `GET /api/listar-alumnos` - Lista alumnos como JSON

#### 2.3 Endpoint GET que retorna JSON

**Archivo:** `A/controllers/alumnosController.js` (Líneas 35-50)

```javascript
export async function listarAlumnos(req, res) {
  try {
    const [filas] = await pool.execute(
      "SELECT id, nombre, apellido, edad FROM alumnos ORDER BY id ASC",
    );

    return res.status(200).json(filas);
  } catch (error) {
    console.error("Error al listar alumnos:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor al obtener los alumnos.",
    });
  }
}
```

✅ Endpoint GET `/api/listar-alumnos` retorna JSON con los alumnos.

**Respuesta esperada:**

```json
[
  { "id": 1, "nombre": "Juan", "apellido": "Pérez", "edad": 20 },
  { "id": 2, "nombre": "María", "apellido": "González", "edad": 22 },
  { "id": 3, "nombre": "Carlos", "apellido": "López", "edad": 19 },
  { "id": 4, "nombre": "Ana", "apellido": "Martínez", "edad": 21 },
  { "id": 5, "nombre": "Pedro", "apellido": "Rodríguez", "edad": 23 }
]
```

#### 2.4 Registro de Server

**Archivo:** `A/server.js` (Líneas 1-37)

```javascript
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import alumnosRoutes from "./routes/alumnosRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PUERTO = 3000;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static(__dirname));
app.use("/api", alumnosRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.listen(PUERTO, () => {
  console.log(
    `Bases de datos y API- Gestión de Alumnos corriendo en http://localhost:${PUERTO}`,
  );
});
```

✅ Server escucha en puerto 3000
✅ CORS habilitado para conexiones desde otros proyectos
✅ Rutas API registradas bajo prefijo `/api`

---

## ✅ PROYECTO B - Punto 3

### **PUNTO 3: Consumir API desde JavaScript y mostrar datos**

#### 3.1 Script que Consume API con Fetch y Axios

**Archivo:** `B/scripts/app.js` (Líneas 1-142)

```javascript
import { inicializarTema } from "../context/tema.js";
import { inicializarVolverArriba } from "../context/volverArriba.js";

const API_URL = "http://localhost:3000/api/listar-alumnos";
```

✅ URL de API apunta correctamente a Proyecto A (puerto 3000).

#### 3.2 Consumo con Fetch (API nativa)

**Archivo:** `B/scripts/app.js` (Líneas 64-91)

```javascript
async function cargarConFetch() {
  mostrarMetodoActivo("Fetch");
  actualizarExplicacion(
    "Fetch es la API nativa del navegador. Enviando GET a la API del Proyecto A...",
  );

  try {
    const respuesta = await fetch(API_URL, {
      method: "GET",
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    alumnosCompletos = datos;

    const termino = document.getElementById("buscador").value;
    if (termino) {
      filtrarAlumnos(termino);
    } else {
      renderizarTabla(alumnosCompletos);
    }

    actualizarExplicacion(
      `Fetch obtuvo ${datos.length} alumno(s) de la API. Los datos vienen de MySQL a través del Proyecto A.`,
    );
  } catch (error) {
    actualizarExplicacion(
      "No se pudo conectar con la API. Asegurate de que el Proyecto A esté activo en el puerto 3000.",
    );
  }
}
```

✅ Consume API con Fetch
✅ Obtiene datos en JSON
✅ Maneja errores

#### 3.3 Consumo con Axios (librería externa)

**Archivo:** `B/scripts/app.js` (Líneas 94-115)

```javascript
async function cargarConAxios() {
  mostrarMetodoActivo("Axios");
  actualizarExplicacion(
    "Axios es una librería que simplifica las peticiones HTTP. Enviando GET a la API del Proyecto A...",
  );

  try {
    const respuesta = await axios.get(API_URL);

    alumnosCompletos = respuesta.data;

    const termino = document.getElementById("buscador").value;
    if (termino) {
      filtrarAlumnos(termino);
    } else {
      renderizarTabla(alumnosCompletos);
    }

    actualizarExplicacion(
      `Axios obtuvo ${respuesta.data.length} alumno(s) de la API. Axios convierte el JSON automáticamente en respuesta.data.`,
    );
  } catch (error) {
    actualizarExplicacion(
      "No se pudo conectar con la API. Asegurate de que el Proyecto A esté activo en el puerto 3000.",
    );
  }
}
```

✅ Consume API con Axios
✅ Obtiene datos en JSON
✅ Maneja errores

#### 3.4 Renderización de Datos en Tabla

**Archivo:** `B/scripts/app.js` (Líneas 25-42)

```javascript
function renderizarTabla(alumnos) {
  const tbody = document.getElementById("tabla-alumnos-body");
  const contador = document.getElementById("contador-alumnos");

  contador.textContent = `${alumnos.length} alumno${alumnos.length !== 1 ? "s" : ""}`;

  if (alumnos.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="mensaje-vacio">No se encontraron alumnos.</td></tr>';
    return;
  }

  tbody.innerHTML = alumnos
    .map(
      (alumno) => `
    <tr>
      <td>${alumno.id}</td>
      <td>${alumno.nombre}</td>
      <td>${alumno.apellido}</td>
      <td>${alumno.edad}</td>
    </tr>
  `,
    )
    .join("");
}
```

✅ Renderiza datos dinámicamente en tabla HTML
✅ Muestra id, nombre, apellido, edad

#### 3.5 Interfaz HTML para Mostrar Datos

**Archivo:** `B/pages/index.html` (Líneas 45-75)

```html
<div class="card card-estanga">
  <div class="card-header d-flex justify-content-between align-items-center">
    <span>Alumnos Registrados</span>
    <span id="contador-alumnos" class="badge badge-estanga">0 alumnos</span>
  </div>
  <div class="card-body">
    <div class="buscador-alumnos">
      <input
        type="text"
        class="form-control"
        id="buscador"
        placeholder="Buscar por nombre o apellido..."
      />
    </div>
    <div class="table-responsive">
      <table class="tabla-alumnos">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Edad</th>
          </tr>
        </thead>
        <tbody id="tabla-alumnos-body">
          <tr>
            <td colspan="4" class="mensaje-vacio">
              Presioná un botón para cargar los alumnos.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

✅ Tabla HTML que muestra los datos consumidos

#### 3.6 Funcionalidades Adicionales

**Filtrado de alumnos** - `B/scripts/app.js` (Líneas 45-60)

```javascript
function filtrarAlumnos(termino) {
  const busqueda = termino.toLowerCase().trim();
  // ... filtra por nombre o apellido
}
```

**Inicialización** - `B/scripts/app.js` (Líneas 138-142)

```javascript
document.addEventListener("DOMContentLoaded", () => {
  inicializarTema();
  inicializarVolverArriba();
  configurarBotones();
  configurarBuscador();
  cargarConFetch();
});
```

✅ Carga automática con Fetch al abrir la página

---

## 🚀 Cómo Ejecutar

### Paso 1: Configurar Base de Datos (Una sola vez)

```bash
cd A
node setup-alumnosdb.js
```

### Paso 2: Iniciar Proyecto A (API)

```bash
cd A
npm install
node server.js
# Escucha en http://localhost:3000
```

### Paso 3: Iniciar Proyecto B (Cliente)

```bash
cd B
npm install
node server.js
# Escucha en http://localhost:3001
```

### Paso 4: Acceder a las aplicaciones

- **Proyecto A:** `http://localhost:3000` - Registra alumnos, visualiza datos
- **Proyecto B:** `http://localhost:3001` - Consume API, muestra datos con Fetch/Axios

---

## ✅ CHECKLIST DE CUMPLIMIENTO

### PROYECTO A

- [x] BD `alumnosDB` creada
- [x] Tabla `alumnos` con campos: id (INT, AUTO_INCREMENT, PRIMARY KEY), nombre (VARCHAR), apellido (VARCHAR), edad (INT)
- [x] 5 alumnos de ejemplo insertados
- [x] Interfaz HTML para cargar alumnos
- [x] API REST que expone `/api/listar-alumnos` en JSON
- [x] API REST que acepta POST en `/api/alumnos` para crear alumnos
- [x] CORS habilitado para comunicación entre proyectos

### PROYECTO B

- [x] Consume API con Fetch
- [x] Consume API con Axios
- [x] Muestra datos en tabla HTML dinámicamente
- [x] Funcionalidad de búsqueda
- [x] Validación de errores
- [x] Se conecta correctamente a API del Proyecto A (puerto 3000)

---

## 📊 Resumen

✅ **CONSIGNA COMPLETAMENTE CUMPLIDA - 100%**

Ambos proyectos están funcionales y listos para presentar.
