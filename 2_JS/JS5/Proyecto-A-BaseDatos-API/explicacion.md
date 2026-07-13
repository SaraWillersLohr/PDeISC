# JS5 - Proyecto A: Bases de datos y API - Gestión de Alumnos

## Documentación para defensa del Trabajo Práctico

---

## 1. Descripción general

Este proyecto es la **Parte A** del Trabajo Práctico JS5. Consiste en un sistema web completo que permite registrar alumnos en una base de datos MySQL y exponer esos datos mediante una API REST en formato JSON.

El sistema corre en el **puerto 3000** y utiliza Node.js con Express como servidor backend, MySQL2 para la conexión a la base de datos, y JavaScript vanilla en el frontend con Bootstrap para el diseño.

---

## 2. Arquitectura del sistema

El proyecto sigue una arquitectura en capas (MVC simplificado):

```
Frontend (HTML + CSS + JS)
        ↓ POST
   Express (server.js)
        ↓
   Routes (alumnosRoutes.js)
        ↓
   Controller (alumnosController.js)
        ↓
   Database (conexion.js → MySQL)
```

### Archivos y responsabilidades

| Archivo | Responsabilidad |
|---------|----------------|
| `server.js` | Punto de entrada. Configura Express, CORS, archivos estáticos y rutas. |
| `database/conexion.js` | Pool de conexiones a MySQL (base `Estanga`). |
| `controllers/alumnosController.js` | Lógica de negocio: validación e inserción/consulta. |
| `routes/alumnosRoutes.js` | Define los endpoints POST de la API. |
| `pages/index.html` | Interfaz visual con formulario, tabla y panel educativo. |
| `scripts/app.js` | Lógica del frontend: validaciones, fetch, renderizado. |
| `context/tema.js` | Gestión del modo claro/oscuro con localStorage. |
| `styles/light.css` / `dark.css` | Estilos visuales del ecosistema Bases de datos y API. |

---

## 3. Base de datos

- **Nombre:** Estanga
- **Tabla:** alumnos
- **Campos:**
  - `id` — INT, AUTO_INCREMENT, PRIMARY KEY
  - `nombre` — VARCHAR(100)
  - `apellido` — VARCHAR(100)
  - `edad` — INT

La base de datos ya existe. No se generan scripts SQL. La conexión se realiza desde `database/conexion.js` usando un pool de MySQL2 con los parámetros:

- Host: localhost
- Usuario: root
- Contraseña: (vacía por defecto, configurable)
- Base: Estanga

---

## 4. API REST

La API utiliza **únicamente POST** (no GET), como indica la consigna.

### POST /api/alumnos

Registra un alumno nuevo.

**Request body (JSON):**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "edad": 20
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "id": 5
}
```

**Respuesta con error de validación (400):**
```json
{
  "success": false,
  "errores": {
    "nombre": "El nombre es obligatorio."
  }
}
```

### POST /api/listar-alumnos

Obtiene todos los alumnos de la base de datos.

**Respuesta exitosa (200):**
```json
[
  { "id": 1, "nombre": "Juan", "apellido": "Pérez", "edad": 20 }
]
```

Los datos provienen directamente de MySQL mediante `SELECT id, nombre, apellido, edad FROM alumnos`.

---

## 5. Flujo de datos completo

### Al registrar un alumno:

1. El usuario completa el formulario (nombre, apellido, edad).
2. JavaScript valida los campos en tiempo real y al enviar.
3. Se envía una petición **POST** a `/api/alumnos` con los datos en JSON.
4. Express recibe la petición en `alumnosRoutes.js`.
5. El controller valida nuevamente en el backend.
6. Si es válido, ejecuta `INSERT INTO alumnos` en MySQL.
7. MySQL devuelve el ID generado.
8. Express responde con `{ success: true, id: X }`.
9. El frontend recibe la respuesta y llama a `cargarAlumnos()`.
10. Se hace POST a `/api/listar-alumnos` y se actualiza la tabla sin recargar la página.

Este flujo se visualiza en el **diagrama de flujo** del panel educativo y se registra en la **consola educativa**.

---

## 6. Frontend

### Formulario
- Campos: Nombre, Apellido, Edad.
- Validaciones HTML: `required`, `min="1"`, `max="120"`.

### Validaciones JavaScript (tiempo real)
- Nombre obligatorio, solo letras.
- Apellido obligatorio, solo letras.
- Edad obligatoria, entre 1 y 120.
- Mensajes de error debajo de cada campo.
- Input con borde rojo cuando hay error.
- Sin `alert()`.

### Tabla dinámica
- Se carga al iniciar la página.
- Se actualiza automáticamente después de cada inserción.
- Muestra: ID, Nombre, Apellido, Edad.

### Panel educativo
- **Consola visual:** registra cada acción con hora.
- **Diagrama de flujo:** anima los pasos al registrar.
- **¿Cómo funciona?:** explica frontend, Express, MySQL y API.

### Tema claro/oscuro
- Preferencia guardada en `localStorage`.
- Archivos CSS separados (`light.css` / `dark.css`).
- Tipografía Poppins, diseño Bootstrap responsive.

---

## 7. Validaciones backend

En `alumnosController.js` se validan:
- Nombre: obligatorio, solo letras y espacios.
- Apellido: obligatorio, solo letras y espacios.
- Edad: obligatoria, entero entre 1 y 120.

Si hay errores, responde con status 400 y JSON con los mensajes.

---

## 8. CORS

Se habilita CORS en `server.js` para que el **Proyecto B** (puerto 3001) pueda consumir esta API desde otro origen.

---

## 9. Cómo ejecutar

```bash
cd Proyecto-A-BaseDatos-API
npm install
node server.js
```

Abrir: http://localhost:3000

**Requisito previo:** MySQL corriendo con la base `Estanga` y la tabla `alumnos` creada.

---

## 10. Tecnologías utilizadas

- Node.js + Express (servidor)
- MySQL2 (conexión a base de datos)
- ES Modules (`import`/`export`, `"type": "module"`)
- Bootstrap 5 (diseño responsive)
- JavaScript Vanilla (frontend)
- Fetch API (peticiones HTTP desde el frontend)

---

## 11. Preguntas frecuentes para la defensa

**¿Por qué POST y no GET?**
Porque la consigna lo exige. POST permite enviar datos en el body y es coherente con operaciones que consultan o insertan datos de forma uniforme.

**¿Por qué validar en frontend Y backend?**
El frontend mejora la experiencia del usuario. El backend es obligatorio porque el frontend puede ser manipulado; la seguridad de los datos está en el servidor.

**¿Qué es un pool de conexiones?**
Es un grupo de conexiones reutilizables a MySQL. Evita abrir y cerrar conexiones en cada petición, mejorando el rendimiento.

**¿Qué hace express.static?**
Sirve archivos estáticos (HTML, CSS, JS) directamente desde el servidor, sin necesidad de rutas adicionales para cada archivo.
