# UserHub — Documentación completa

## Objetivo general

UserHub es una plataforma web educativa dividida en 4 proyectos independientes. Cada uno demuestra una forma distinta de trabajar con APIs y JavaScript del lado del cliente y del servidor. Todos usan Node.js, Express, HTML, CSS, JavaScript con ES Modules, y los dos métodos de petición HTTP: `fetch()` y `axios`.

---

## Arquitectura general

```
Frontend (HTML + CSS + JS)
    ↓
fetch() / axios()
    ↓
API externa (jsonplaceholder) — P1, P2, P3
API interna (Express + JSON) — P4
    ↓
Array en memoria
    ↓
DOM (renderizado)
```

### Frontend
Cada proyecto tiene:
- `pages/index.html` — estructura visible
- `scripts/app.js` — punto de entrada, inicializa todo
- `modules/api.js` — peticiones HTTP
- `modules/funciones.js` — renderizado y lógica de interfaz
- `modules/perfil.js` — panel lateral de perfil
- `modules/consola.js` — consola educativa
- `modules/scrollTop.js` — botón volver arriba
- `Context/tema.js` — modo claro/oscuro
- `styles/claro.css` y `styles/oscuro.css` — estilos

### Backend
- P1, P2, P3: servidor Express que solo sirve archivos estáticos
- P4: servidor Express con API propia en `/api/empleados`

### API externa
- JSONPlaceholder: `https://jsonplaceholder.typicode.com/users`
- Devuelve 10 usuarios con nombre, email, teléfono, empresa, dirección, etc.
- Los métodos POST y DELETE son simulados: no modifican datos reales

### API interna (P4)
- `GET /api/empleados` — devuelve todos los empleados del JSON
- `DELETE /api/empleados/:id` — elimina un empleado del JSON real

---

## Regla principal: todos los proyectos usan fetch() Y axios()

La diferencia entre proyectos **no es el método**, es la funcionalidad.

| Proyecto | Diferencia | fetch() | axios() |
|---|---|---|---|
| P1 Explorer | Comparar métodos | Carga inicial | Verifica los mismos datos |
| P2 Search | Buscar y filtrar | Carga inicial | Verifica los mismos datos |
| P3 Register | Enviar POST | Botón "Enviar con fetch()" | Botón "Enviar con axios" |
| P4 Enterprise | API propia | GET + DELETE | GET para verificar |

---

## Proyecto 1 — UserHub Explorer

**Objetivo:** consumir la API pública y comparar `fetch()` con `axios()`.

### Flujo completo
```
DOMContentLoaded
    → inicializarApp()
    → cargarUsuarios()
        → obtenerUsuariosConFetch()    // petición 1
        → procesarUsuarios()
        → obtenerUsuariosConAxios()    // petición 2 (verificación)
        → procesarUsuarios()
        → renderizarUsuarios()
        → DOM actualizado
```

### Funciones importantes

**`cargarUsuarios()`**
- No recibe parámetros
- Hace dos peticiones: primero fetch, después axios
- Compara si devolvieron la misma cantidad
- Si coinciden, muestra "Verificado con axios ✓"
- Llama a `renderizarUsuarios()` con el array final

**`procesarUsuarios(datos, metodo, contenedor)`**
- Recibe: array de usuarios, string del método, elemento HTML
- Valida con `validarUsuarios()`
- Actualiza el badge del método activo
- Actualiza el panel de flujo API → DOM
- Renderiza las cards

**`renderizarUsuarios(usuarios, contenedor, alSeleccionar, alEliminar)`**
- Recibe: array, contenedor HTML, función al hacer click, función al eliminar
- Genera HTML de cards con nombre, email, botones Perfil y Eliminar
- Asigna eventos de click a cada card y a cada botón
- El click en la card llama a `alSeleccionar()`
- El click en Eliminar llama a `alEliminar()` — que abre el modal

**`seleccionarUsuario(usuario, elemento)`**
- Quita la clase `selected` de todas las cards
- Agrega `selected` a la card presionada
- Llama a `renderPerfil(usuarioApiAPerfil(usuario), panel)`
- Escribe en la consola

**`pedirConfirmacionEliminar(usuario)`**
- Guarda el id en `idParaEliminar`
- Llena el modal con nombre y email del usuario
- Abre el modal de Bootstrap

**`confirmarEliminar()`**
- Corre `usuarios.filter(u => u.id !== idParaEliminar)`
- Cierra el modal
- Vuelve a renderizar con el array nuevo
- Limpia el perfil
- Escribe en la consola

---

## Proyecto 2 — UserHub Search

**Objetivo:** buscar y filtrar usuarios en tiempo real.

### Flujo completo
```
DOMContentLoaded
    → cargarUsuarios()
        → fetch() + axios() (carga y verificación)
        → usuarios[] listo
    → input "input-buscar"
        → actualizarResultados()
        → filtrarPorNombre()    // filter() sobre el array
        → renderizarTablaNombres()
        → DOM actualizado
```

### Funciones importantes

**`filtrarPorNombre(usuarios, busqueda)`**
- Recibe: array de usuarios, string de búsqueda
- Devuelve: array filtrado con los que coinciden en `name` o `username`
- Usa `toLowerCase()` para que la búsqueda no distinga mayúsculas
- Si el string está vacío, devuelve todos

```js
// ejemplo: buscar "bret" encuentra a "Leanne Graham" porque su username es "Bret"
const texto = busqueda.trim().toLowerCase();
usuarios.filter(u =>
  u.name.toLowerCase().includes(texto) ||
  u.username.toLowerCase().includes(texto)
)
```

**`actualizarResultados()`**
- Lee el valor del input
- Llama a `filtrarPorNombre()`
- Renderiza la tabla con los resultados filtrados
- Actualiza el contador de resultados

**`renderizarTablaNombres(usuarios, contenedor, alSeleccionar, alEliminar)`**
- Genera una tabla HTML con Nombre, Apodo y botón Eliminar
- Asigna eventos de click a cada fila y al botón

---

## Proyecto 3 — UserHub Register

**Objetivo:** enviar datos con POST usando validación en HTML y JavaScript.

### Flujo completo
```
DOMContentLoaded
    → input-nombre / input-email
        → validarEnTiempoReal()
        → validarCampoNombre() / validarCampoEmail()
        → mostrarErrorCampo() — pone el input en rojo o verde
        → actualizarBotonesEnvio() — habilita/deshabilita botones
    → click "Enviar con fetch()" o "Enviar con axios"
        → enviarUsuario(metodo)
        → validarFormulario() — validación final antes de enviar
        → crearUsuarioConFetch() o crearUsuarioConAxios()
        → mostrarResultadoCreacion()
        → renderPerfil() — muestra el usuario enviado en el panel
```

### Validaciones

**HTML:**
- `required` — campo obligatorio
- `type="email"` — formato de email
- `minlength="3"` / `maxlength="60"`
- `pattern` — solo letras y espacios

**JavaScript (validarCampoNombre):**
- Longitud entre 3 y 60 caracteres
- Solo letras y espacios (con acentos y ñ)
- Cada palabra debe tener al menos una vocal
- No permite más de 2 caracteres iguales seguidos

**JavaScript (validarCampoEmail):**
- Regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Verifica que tenga @ y dominio con punto

### Diferencia entre botones
- "Enviar con fetch()" llama a `crearUsuarioConFetch(datos)`
- "Enviar con axios" llama a `crearUsuarioConAxios(datos)`
- Ambos envían el mismo objeto `{ name, email }` al mismo endpoint
- La diferencia es el método HTTP que se usa internamente

---

## Proyecto 4 — UserHub API Enterprise

**Objetivo:** crear y consumir una API propia con Node.js + Express.

### Flujo completo
```
DOMContentLoaded
    → cargarEmpleados()
        → fetch GET /api/empleados    // Express lee empleados.json
        → axios GET /api/empleados    // verificación
        → renderizarTablaEmpleados()
        → renderizarEstadisticas()
    → click Eliminar
        → pedirConfirmacionEliminar()
        → modal de confirmación
        → confirmarEliminar()
        → fetch DELETE /api/empleados/:id
        → Express actualiza empleados.json
        → cargarEmpleados() — recarga
```

### Endpoints de la API

**GET /api/empleados**
- Lee el archivo `data/empleados.json`
- Valida que sea un array
- Devuelve el JSON al frontend

**DELETE /api/empleados/:id**
- Recibe el id en la URL
- Lee el JSON, busca el empleado
- Usa `filter()` para eliminarlo
- Sobreescribe el archivo con `writeFile()`
- Devuelve confirmación con el empleado eliminado

### Diferencia con P1 y P2
En P1 y P2 la eliminación es solo en sesión (en el array de JavaScript). Al recargar la página, los datos vuelven. En P4 la eliminación es real: se guarda en el archivo JSON del servidor y persiste aunque se recargue la página.

---

## Modo claro / oscuro

### Cómo funciona
1. En `Context/tema.js` se define `inicializarTema()`
2. Lee `localStorage.getItem("userhub-tema")`
3. Si no hay nada guardado, usa `"claro"` por defecto
4. Cambia el atributo `href` del link con `id="estilos-tema"` para cargar el CSS correcto
5. El botón `#btn-tema` alterna entre los dos temas

### Por qué persiste entre proyectos
Se usa `localStorage` con la clave `"userhub-tema"`. El localStorage es del dominio (`localhost`), no de la página. Entonces si activás oscuro en P1 (`localhost:3001`) y navegás a P3 (`localhost:3003`), la clave sigue existiendo y `inicializarTema()` la lee al cargar.

```js
// en Context/tema.js
export function obtenerTema() {
  return localStorage.getItem(CLAVE_TEMA) || TEMA_CLARO;
}

export function aplicarTema(tema) {
  const linkEstilos = document.getElementById("estilos-tema");
  linkEstilos.href = `../styles/${tema}.css`;
  localStorage.setItem(CLAVE_TEMA, tema);
}
```

---

## Consola dinámica UserHub

Está en `modules/consola.js`. Muestra en tiempo real qué está pasando en el código.

### Tipos de mensajes
- `[FETCH]` — cuando se ejecuta fetch()
- `[AXIOS]` — cuando se ejecuta axios.get()
- `[FILTER]` — cuando el usuario escribe en el buscador
- `[DELETE]` — cuando se elimina un usuario o empleado
- `[CLICK]` — cuando el usuario selecciona un registro
- `[POST]` — cuando se envía el formulario en P3
- `[EVENT]` — eventos del formulario
- `[INFO]` — mensajes de error o estado

### Funciones

**`initConsola(mensajeInicial)`**
- Agrega dinámicamente el botón "Limpiar consola" al DOM
- Pone el mensaje inicial en el panel

**`logConsola(tipo, mensajes)`**
- Recibe: string del tipo, string o array de strings
- Crea un elemento div con el tag coloreado y los mensajes
- Lo agrega al principio con `prepend()` para que el último mensaje aparezca arriba
- Limita a 50 entradas con el loop `while`

**`limpiarConsola()`**
- Vacía el contenido del panel
- El panel sigue visible (no se oculta)

---

## Eliminación de usuarios

### P1 y P2 (solo sesión)
```js
// filter devuelve un nuevo array sin el usuario con ese id
usuarios = usuarios.filter(u => u.id !== idParaEliminar);
// luego se vuelve a renderizar con el array nuevo
renderizarUsuarios(usuarios, contenedor, ...);
```
La eliminación no persiste: al recargar la página, `fetch()` trae todos los usuarios de nuevo.

### P4 (eliminación real)
```js
// en el frontend: petición DELETE al servidor
await eliminarEmpleadoConFetch(empleado.id);
// en el servidor: lee JSON, filtra, sobreescribe
const actualizados = empleados.filter(e => e.id !== id);
await writeFile(RUTA_EMPLEADOS, JSON.stringify(actualizados, null, 2));
```
La eliminación persiste en el archivo. Al recargar la página, el empleado ya no aparece.

### Modal de confirmación
En todos los proyectos, antes de eliminar se abre un modal con:
- Nombre del usuario/empleado a eliminar
- Email
- Botones: Cancelar (cierra el modal sin cambios) y Confirmar

---

## Diferencia fetch vs axios

| Característica | fetch() | axios |
|---|---|---|
| Origen | Nativo del browser | Librería externa (CDN) |
| Convertir respuesta | `await respuesta.json()` | `respuesta.data` ya es el objeto |
| Verificar errores HTTP | Hay que verificar `respuesta.ok` manualmente | Lanza error automáticamente si no es 2xx |
| Sintaxis POST | `{ method, headers, body: JSON.stringify(datos) }` | `axios.post(url, datos)` |
| Sintaxis DELETE | `{ method: "DELETE" }` | `axios.delete(url)` |

---

## Responsive

El layout usa CSS Grid con dos columnas:
```css
.userhub-layout-grid {
  grid-template-columns: minmax(0, 1fr) 340px;
}
```

En pantallas menores a 992px (tablet/mobile) cambia a una columna:
```css
@media (max-width: 992px) {
  .userhub-layout-grid {
    grid-template-columns: 1fr;
  }
}
```

El orden de aparición en mobile es:
1. Contenido principal (cards, tabla, formulario)
2. Perfil del usuario
3. Consola UserHub

---

## Preguntas posibles del profesor

**¿Por qué usás los dos métodos si el resultado es el mismo?**
Porque el objetivo es comparar. fetch es nativo y hay que manejar más cosas a mano (convertir JSON, verificar errores). axios simplifica eso pero requiere importar una librería. En P3, los dos botones sirven para ver claramente la diferencia de sintaxis al hacer POST.

**¿Qué es un ES Module?**
Es la forma moderna de organizar JavaScript con `import` y `export`. Cada archivo es un módulo separado. En el HTML se carga con `type="module"`. No se puede usar `require()` como en CommonJS.

**¿Qué hace `filter()`?**
Recorre un array y devuelve un nuevo array con solo los elementos que cumplen la condición. No modifica el original. Se usa para buscar usuarios (P2) y para eliminarlos del array en memoria (P1, P2).

**¿Por qué `localStorage` mantiene el tema entre páginas?**
Porque `localStorage` guarda datos asociados al dominio (`localhost`), no a la URL específica. Todos los proyectos corren en `localhost` (aunque en puertos distintos), pero el localStorage es compartido. Cuando cualquier proyecto llama a `localStorage.setItem("userhub-tema", "oscuro")`, ese valor está disponible en todos los demás.

**¿Qué pasa si jsonplaceholder está caído?**
El `try/catch` captura el error, muestra un mensaje en pantalla con `mostrarEstado()` y lo escribe en la consola con `logConsola()`. La app no se rompe.

**¿Por qué el DELETE de P4 persiste y el de P1/P2 no?**
En P1 y P2 el `filter()` modifica solo el array en memoria del navegador. Al recargar, `fetch()` vuelve a traer todos los datos de jsonplaceholder. En P4 el servidor usa `writeFile()` para sobreescribir el archivo `empleados.json`. Cuando se recarga, el GET lee ese archivo actualizado.

**¿Qué es `async/await`?**
Es la forma moderna de trabajar con Promesas. `async` marca una función como asíncrona. `await` pausa la ejecución hasta que la Promesa se resuelve. Es más legible que `.then()/.catch()`.

**¿Qué hace `usuarioApiAPerfil(usuario)`?**
Transforma el objeto que viene de la API (que tiene propiedades anidadas como `usuario.address.city`) al formato plano que espera `renderPerfil()` (que espera `datos.ciudad`). Así `renderPerfil` siempre recibe el mismo formato sin importar si los datos vienen de jsonplaceholder o de la API propia.

**¿Por qué no mostrás el id al usuario?**
El id es un dato interno del sistema. No tiene valor para el usuario final. Se usa solo en el código para identificar registros (en el `data-id` de los botones, en el `filter()`, en el endpoint DELETE). Mostrarlo sería un detalle técnico innecesario y confuso para quien usa la app.

**¿Cómo funciona la validación del nombre?**
Primero HTML verifica formato básico (longitud, patrón). Luego JavaScript hace validaciones lógicas más complejas: que cada palabra tenga al menos una vocal (para descartar "xzq" o teclas aleatorias), que no haya más de 2 letras iguales seguidas (para descartar "aaaa"), que solo tenga letras y espacios (para descartar números o símbolos).

**¿Para qué sirve `stopPropagation()`?**
Cuando se hace click en un botón que está dentro de una card o fila clickeable, el evento "sube" por el DOM y también activa el evento de la card. `stopPropagation()` detiene esa propagación para que el click en el botón Eliminar no también active el click de la card (que mostraría el perfil).
