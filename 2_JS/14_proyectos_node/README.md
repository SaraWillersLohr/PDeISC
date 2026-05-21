# TP — Arrays y métodos de JavaScript

Hola. Este repo es mi trabajo práctico sobre **métodos de arrays en JavaScript**. No es un proyecto nuevo aparte: son **14 mini-apps** (una por método), con la misma estructura que pidió la consigna.

## Cómo está organizado

```
14_proyectos_node/
├── _shared/          ← CSS, consola visual, tema, helpers (modular)
├── 01_push/
│   ├── pages/index.html
│   ├── scripts/script.js
│   ├── styles/style.css
│   └── server.js
├── 02_pop/
│   …
└── 14_reverse/
```

Cada carpeta es independiente: abrís `pages/index.html` con **Live Server** o corrés `node server.js` dentro de la carpeta.

## Qué aprendí en general

- Un **array** es una lista ordenada. Puedo leer por índice (`arr[0]`), recorrerla y mutarla según el método.
- **DOM + eventos**: cada botón dispara lógica real; el resultado se **pinta en pantalla**, no solo en `console.log`.
- **Modularización**: lo repetido vive en `_shared/` (tema, consola, visualización ANTES → OPERACIÓN → RESULTADO).
- **Responsive**: Bootstrap + CSS propio con `clamp()`, flex/grid, sin overflow horizontal.
- **Dark mode**: `data-theme` en `<html>`, guardado en `localStorage`.

## Consola visual de eventos

En cada ejercicio hay una **consola fija** (abajo en mobile, lateral en desktop) que registra acciones reales, por ejemplo:

```
[12:30:22] push() agregó 3 frutas al final
```

- Historial de la sesión
- Autoscroll
- Botón para limpiar

## Mutan vs no mutan (lo que más me confundía)

| Método | ¿Modifica el original? | Devuelve |
|--------|------------------------|----------|
| push, pop, unshift, shift, splice, sort, reverse | **Sí** | Varía (longitud, elemento, etc.) |
| slice, indexOf, includes, forEach, map, filter, reduce | **No*** | Nuevo array, índice, boolean, valor, etc. |

\* `forEach` no cambia el array, pero podés hacer efectos secundarios adentro del callback.

### Cuándo usar cada uno (mi regla práctica)

- **push / pop** → final de la lista (pila).
- **unshift / shift** → inicio (cola FIFO).
- **splice** → insertar, borrar o reemplazar en un índice concreto.
- **slice** → copiar un tramo sin tocar el original.
- **indexOf / includes** → buscar (posición vs sí/no).
- **forEach** → solo recorrer y hacer algo por elemento.
- **map** → necesito **otro array** transformado.
- **filter** → necesito **otro array** más chico según condición.
- **reduce** → un solo resultado (suma, producto, total).
- **sort** → ordenar **el mismo array** (con comparador si son números).
- **reverse** → invertir **el mismo array**.

## Errores que me pasaron (y cómo los evité)

1. **sort() con números** — Sin comparador ordena como strings: `[1, 100, 25]` queda mal. Uso `(a, b) => a - b`.
2. **Confundir map y forEach** — map **devuelve** array nuevo; forEach **no**.
3. **Pensar que slice modifica** — No. El original sigue igual.
4. **reverse en strings** — Primero `split("")`, después `reverse()`, después `join("")`.
5. **splice vs slice** — splice muta; slice copia.

## Los 14 métodos (una carpeta cada uno)

| Carpeta | Método | Qué demuestro |
|---------|--------|----------------|
| 01_push | push() | Frutas, amigos, número condicional |
| 02_pop | pop() | Sacar último, mostrar eliminado, vaciar con while |
| 03_unshift | unshift() | Colores al inicio, tarea urgente, usuario en cola |
| 04_shift | shift() | Enteros, mensajes, cola de clientes |
| 05_splice | splice() | Borrar, insertar, reemplazar |
| 06_slice | slice() | Copias sin mutar el original |
| 07_indexof | indexOf() | Buscar índice (-1 si no está) |
| 08_includes | includes() | true/false + validar antes de push |
| 09_foreach | forEach() | Recorrer y mostrar en panel de logs |
| 10_map | map() | ×3, mayúsculas, IVA 21% |
| 11_filter | filter() | Números, palabras largas, usuarios activos |
| 12_reduce | reduce() | Suma, producto, total carrito |
| 13_sort | sort() | Números, palabras, objetos por edad |
| 14_reverse | reverse() | Letras, números, string invertido |

En **cada pantalla** veo:

1. **ANTES** — array inicial  
2. **OPERACIÓN** — el método literal  
3. **RESULTADO** — lo que quedó (o el array nuevo)  
4. Banner si **muta o no** el original  

## Cómo correr un ejercicio

```bash
cd 01_push
node server.js
```

Abrís la URL que muestra la terminal (suele ser `http://localhost:3000` o similar según `server.js`).

O con **Live Server** en VS Code/Cursor: abrí la carpeta **`14_proyectos_node`** como workspace (no solo `01_push`), clic derecho en `01_push/pages/index.html` → *Open with Live Server*.

> Los módulos ES (`import`) necesitan servidor; no abras el HTML como `file://`. Las rutas son relativas (`../../_shared`, `../scripts`) para que funcionen con Live Server y con `node server.js`.

## Archivos compartidos (`_shared/`)

| Archivo | Para qué sirve |
|---------|----------------|
| `css/base.css` | Tema, glass, responsive, consola, flujo visual |
| `js/boot.js` | Arranca tema + consola |
| `js/setupPage.js` | Banner del método |
| `js/eventConsole.js` | Consola de eventos |
| `js/arrayDisplay.js` | ANTES / OPERACIÓN / RESULTADO |
| `js/theme.js` | Dark/light + localStorage |
| `js/methodMeta.js` | Textos de estudio por método |

Cada `styles/style.css` solo importa la base:

```css
@import url("../../_shared/css/base.css");
```

## DOM y eventos (resumen para estudiar)

- En `script.js` guardo referencias: `document.getElementById('btnFrutas')`.
- `onclick` (o `addEventListener`) ejecuta la lógica del TP.
- Después de mutar o calcular, **actualizo el DOM** con `paintFlow()` o badges.
- La consola usa `log('mensaje')` para dejar traza legible.

## Tecnologías

- HTML5, CSS3 (variables, media queries, glass suave)
- JavaScript ES modules
- Bootstrap 5 (grid y utilidades, no “Bootstrap crudo”)
- Font Awesome + Animate.css (detalle visual)
- Node + Express solo como servidor estático (`server.js`)

---

Si repaso esto en un par de meses, con leer el README y abrir un ejercicio con la consola abierta me alcanza para recordar **qué hace cada método** y **si toca el array original o no**.
