# JS5 - Proyecto B: Bases de datos y API - Portal Académico

## Documentación para defensa del Trabajo Práctico

---

## 1. Descripción general

Este proyecto es la **Parte B** del Trabajo Práctico JS5. Consiste en un portal web que **consume la API REST** creada en el Proyecto A para mostrar los alumnos registrados en la base de datos MySQL.

El sistema corre en el **puerto 3001** (distinto al Proyecto A) y es completamente independiente: tiene su propio `server.js`, su propia carpeta `context`, y no comparte archivos con el Proyecto A.

---

## 2. Arquitectura del sistema

```
Frontend (HTML + CSS + JS) — Puerto 3001
        ↓ POST (Fetch o Axios)
   API del Proyecto A — Puerto 3000
        ↓
   MySQL (base Estanga)
        ↓
   Respuesta JSON
        ↓
   Renderizado en tabla (DOM)
```

### Archivos y responsabilidades

| Archivo | Responsabilidad |
|---------|----------------|
| `server.js` | Servidor Express simple que sirve archivos estáticos en puerto 3001. |
| `pages/index.html` | Interfaz con botones Fetch/Axios, buscador, tabla y panel educativo. |
| `scripts/app.js` | Lógica: cargar con Fetch, cargar con Axios, filtrar, renderizar. |
| `context/tema.js` | Gestión del modo claro/oscuro con localStorage. |
| `styles/light.css` / `dark.css` | Estilos visuales (misma identidad que Proyecto A). |

---

## 3. Relación con el Proyecto A

El Proyecto B **no tiene base de datos propia**. Todos los datos provienen de la API del Proyecto A:

- **URL:** `http://localhost:3000/api/listar-alumnos`
- **Método:** POST (no GET)
- **Respuesta:** Array JSON con los alumnos

Para que funcione, el Proyecto A debe estar corriendo en el puerto 3000 antes de usar este portal.

---

## 4. Fetch vs Axios

### Fetch (nativo del navegador)

```javascript
const respuesta = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const datos = await respuesta.json();
```

- Viene incluido en todos los navegadores modernos.
- No requiere instalación.
- Devuelve una Promise.
- Hay que convertir la respuesta a JSON manualmente con `.json()`.

### Axios (biblioteca externa)

```javascript
const respuesta = await axios.post(API_URL);
const datos = respuesta.data;
```

- Se instala con npm (incluido en el CDN para el frontend).
- Sintaxis más simple y legible.
- Convierte JSON automáticamente (`respuesta.data`).
- Manejo de errores más conveniente.

### ¿Cuándo usar cada uno?

- **Fetch:** proyectos simples, sin dependencias extra, APIs nativas.
- **Axios:** proyectos más grandes, interceptores, cancelación de peticiones, mejor DX.

En este TP usamos **ambos** para demostrar que logran el mismo resultado.

---

## 5. Flujo de datos

### Al cargar con Fetch:

1. El usuario presiona "Cargar con Fetch" (o se ejecuta automáticamente al iniciar).
2. JavaScript usa `fetch()` con method POST.
3. La petición va a `http://localhost:3000/api/listar-alumnos`.
4. El Proyecto A consulta MySQL y responde con JSON.
5. Fetch recibe la respuesta y la convierte con `.json()`.
6. Los datos se guardan en `alumnosCompletos`.
7. Se renderiza la tabla con DOM.
8. La consola educativa registra cada paso.

### Al cargar con Axios:

1. El usuario presiona "Cargar con Axios".
2. JavaScript usa `axios.post(API_URL)`.
3. Mismo endpoint, misma respuesta.
4. Axios devuelve los datos directamente en `respuesta.data`.
5. Se renderiza la tabla igual que con Fetch.
6. La consola indica que se usó Axios.

---

## 6. Búsqueda dinámica

El buscador filtra alumnos **en tiempo real** mientras el usuario escribe:

- Busca coincidencias en **nombre** o **apellido** (case insensitive).
- No hace peticiones al servidor; filtra el array `alumnosCompletos` en memoria.
- Re-renderiza la tabla con los resultados filtrados.
- Registra la cantidad de resultados en la consola educativa.

---

## 7. Frontend

### Botones de carga
- **Cargar con Fetch:** usa la API nativa del navegador.
- **Cargar con Axios:** usa la librería externa vía CDN.

### Al iniciar
- Se carga automáticamente con **Fetch** para demostrar consumo inmediato de la API.
- El usuario puede luego probar **Axios** con el botón correspondiente.

### Tabla
- Muestra: ID, Nombre, Apellido, Edad.
- Renderizado dinámico con manipulación del DOM (`innerHTML` / template strings).
- Contador de alumnos visible.

### Panel educativo
- **Consola visual:** hora + mensaje de cada acción.
- **Comparador Fetch vs Axios:** tarjetas con diferencias y ejemplos de código.
- **¿Cómo funciona?:** explica el flujo de consumo de API.

### Tema claro/oscuro
- Misma identidad visual que el Proyecto A (Bases de datos y API).
- Preferencia en localStorage.
- Bootstrap responsive: desktop lado a lado, móvil apilado.

---

## 8. CORS

Como el Proyecto B (localhost:3001) hace peticiones al Proyecto A (localhost:3000), son **orígenes distintos**. El Proyecto A tiene CORS habilitado en su `server.js` para permitir estas peticiones cross-origin.

---

## 9. Cómo ejecutar

**Terminal 1 — Proyecto A (obligatorio primero):**
```bash
cd Proyecto-A-BaseDatos-API
npm install
node server.js
```

**Terminal 2 — Proyecto B:**
```bash
cd Proyecto-B-ConsumoAPI
npm install
node server.js
```

Abrir: http://localhost:3001

---

## 10. Tecnologías utilizadas

- Node.js + Express (servidor estático)
- Axios (npm + CDN en el HTML)
- Fetch API (nativo del navegador)
- ES Modules (`import`/`export`)
- Bootstrap 5
- JavaScript Vanilla
- localStorage (tema)

---

## 11. Preguntas frecuentes para la defensa

**¿Por qué dos proyectos separados?**
Para demostrar la independencia entre quien **expone** una API (Proyecto A) y quien la **consume** (Proyecto B). En la vida real, suelen ser equipos o servicios distintos.

**¿Por qué Fetch al iniciar y botones para ambos?**
La consigna pide demostrar ambas tecnologías. Al iniciar se usa Fetch automáticamente; los botones permiten al usuario comparar ambos métodos manualmente.

**¿El buscador consulta la API?**
No. Filtra localmente el array ya cargado. Esto es más eficiente para búsquedas instantáneas en datasets pequeños.

**¿Qué pasa si el Proyecto A no está corriendo?**
La consola educativa muestra un error de conexión y la explicación indica que hay que activar el Proyecto A en el puerto 3000.

**¿Cuál es la diferencia principal entre Fetch y Axios?**
Fetch es nativo y requiere convertir JSON manualmente. Axios es una librería que simplifica la sintaxis y parsea JSON automáticamente.
