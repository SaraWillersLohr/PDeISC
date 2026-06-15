# Informe de archivos no utilizados — NSJ3 (P1 a P6)

Revisión realizada sobre la cadena de ejecución activa de cada proyecto.  
**No se eliminó ningún archivo** (según consigna).

Cadena activa común:

```
index.html → theme.js (head) + app.js (module)
app.js → consola.js + eventos.js + ui.js
P6 además: terminos.js, validaciones.js
```

---

## P1 — Manipulación DOM (H1 e imágenes)

| Archivo | Propósito aparente | ¿Participa en ejecución actual? |
|---|---|---|
| `server.js` | Servidor Express estático | **Sí** |
| `package.json` / `package-lock.json` | Dependencias npm | **Sí** (instalación) |
| `README.md` | Documentación del punto | No (solo lectura) |
| `public/pages/index.html` | Vista principal | **Sí** |
| `public/scripts/app.js` | Punto de entrada | **Sí** |
| `public/scripts/eventos.js` | Eventos DHTML del playground | **Sí** |
| `public/scripts/consola.js` | Consola visual | **Sí** |
| `public/scripts/ui.js` | Volver arriba + avisos | **Sí** |
| `public/scripts/theme.js` | Tema claro/oscuro | **Sí** |
| `public/styles/light.css` | Estilos modo claro | **Sí** |
| `public/styles/dark.css` | Estilos modo oscuro | **Sí** |
| `public/styles/responsive.css` | Media queries | **Sí** |
| `public/modules/map.js` | Polyfill educativo de `Array.map` | **No** |
| `public/modules/filter.js` | Polyfill de `Array.filter` | **No** |
| `public/modules/reduce.js` | Polyfill de `Array.reduce` | **No** |
| `public/modules/forEach.js` | Polyfill de `Array.forEach` | **No** |
| `public/modules/push.js` | Polyfill de `Array.push` | **No** |
| `public/modules/pop.js` | Polyfill de `Array.pop` | **No** |
| `public/modules/shift.js` | Polyfill de `Array.shift` | **No** |
| `public/modules/unshift.js` | Polyfill de `Array.unshift` | **No** |
| `public/modules/splice.js` | Polyfill de `Array.splice` | **No** |
| `public/modules/slice.js` | Polyfill de `Array.slice` | **No** |
| `public/modules/sort.js` | Polyfill de `Array.sort` | **No** |
| `public/modules/reverse.js` | Polyfill de `Array.reverse` | **No** |
| `public/modules/indexOf.js` | Polyfill de `Array.indexOf` | **No** |
| `public/modules/includes.js` | Polyfill de `Array.includes` | **No** |

---

## P2 — Navegación y eventos

| Archivo | Propósito aparente | ¿Participa en ejecución actual? |
|---|---|---|
| `server.js` | Servidor Express | **Sí** |
| `public/pages/index.html` | Vista con templates embebidos | **Sí** |
| `public/scripts/app.js` | Punto de entrada | **Sí** |
| `public/scripts/eventos.js` | Navegación y eventos por sección | **Sí** |
| `public/scripts/consola.js` | Consola visual | **Sí** |
| `public/scripts/ui.js` | Volver arriba + `cargarSeccion()` | **Sí** |
| `public/scripts/theme.js` | Tema claro/oscuro | **Sí** |
| `public/styles/light.css` / `dark.css` / `responsive.css` | Sistema visual | **Sí** |
| `public/pages/inicio.html` | Fragmento HTML legacy | **No** (reemplazado por `#tpl-inicio`) |
| `public/pages/perfil.html` | Fragmento HTML legacy | **No** |
| `public/pages/config.html` | Fragmento HTML legacy | **No** |
| `public/pages/stats.html` | Fragmento HTML legacy | **No** |
| `public/pages/ayuda.html` | Fragmento HTML legacy | **No** |
| `public/scripts/main.js` | Entrada antigua con `router.js` | **No** |
| `public/modules/router.js` | Router fetch a páginas parciales | **No** |
| `public/modules/logger.js` | Logger del stack anterior | **No** |
| `public/modules/notifications.js` | Toasts del stack anterior | **No** |
| `public/styles/main.css` | Estilos del diseño anterior (Inter) | **No** |

---

## P3 — Conteo de hijos DOM

| Archivo | Propósito aparente | ¿Participa en ejecución actual? |
|---|---|---|
| `server.js` | Servidor Express | **Sí** |
| `public/pages/index.html` | Vista principal | **Sí** |
| `public/scripts/app.js` | Punto de entrada | **Sí** |
| `public/scripts/eventos.js` | Conteo `children.length` | **Sí** |
| `public/scripts/consola.js` | Consola visual | **Sí** |
| `public/scripts/ui.js` | Volver arriba | **Sí** |
| `public/scripts/theme.js` | Tema claro/oscuro | **Sí** |
| `public/styles/light.css` / `dark.css` / `responsive.css` | Sistema visual | **Sí** |
| `public/scripts/main.js` | Wizard de 3 pasos (versión anterior) | **No** |
| `public/modules/validator.js` | Validaciones del wizard anterior | **No** |
| `public/modules/state.js` | Estado del wizard anterior | **No** |
| `public/modules/notifications.js` | Notificaciones del stack anterior | **No** |
| `public/styles/main.css` | Estilos del diseño anterior | **No** |

---

## P4 — Creación y modificación de nodos

| Archivo | Propósito aparente | ¿Participa en ejecución actual? |
|---|---|---|
| `server.js` | Servidor Express | **Sí** |
| `public/pages/index.html` | Vista principal | **Sí** |
| `public/scripts/app.js` | Punto de entrada | **Sí** |
| `public/scripts/eventos.js` | Crear/modificar enlaces | **Sí** |
| `public/scripts/consola.js` | Consola visual | **Sí** |
| `public/scripts/ui.js` | Volver arriba + log de atributos | **Sí** |
| `public/scripts/theme.js` | Tema claro/oscuro | **Sí** |
| `public/styles/light.css` / `dark.css` / `responsive.css` | Sistema visual | **Sí** |
| `public/scripts/main.js` | Consola de nodos (versión anterior) | **No** |
| `public/modules/nodes.js` | Módulo de nodos del stack anterior | **No** |
| `public/modules/notifications.js` | Notificaciones del stack anterior | **No** |
| `public/styles/main.css` | Estilos del diseño anterior | **No** |

---

## P5 — Inserción dinámica con innerHTML

| Archivo | Propósito aparente | ¿Participa en ejecución actual? |
|---|---|---|
| `server.js` | Servidor Express | **Sí** |
| `public/pages/index.html` | Vista principal | **Sí** |
| `public/scripts/app.js` | Punto de entrada | **Sí** |
| `public/scripts/eventos.js` | Inserción innerHTML | **Sí** |
| `public/scripts/consola.js` | Consola visual | **Sí** |
| `public/scripts/ui.js` | Volver arriba | **Sí** |
| `public/scripts/theme.js` | Tema claro/oscuro | **Sí** |
| `public/styles/light.css` / `dark.css` / `responsive.css` | Sistema visual | **Sí** |
| `public/scripts/main.js` | E-commerce TechStore (versión anterior) | **No** |
| `public/modules/renderer.js` | Render de productos | **No** |
| `public/modules/cart.js` | Carrito de compras | **No** |
| `public/modules/notifications.js` | Notificaciones del stack anterior | **No** |
| `data/products.json` | Catálogo JSON del e-commerce anterior | **No** (sin ruta `/api/products`) |
| `public/styles/main.css` | Estilos del e-commerce anterior | **No** |

---

## P6 — Formulario de registro

| Archivo | Propósito aparente | ¿Participa en ejecución actual? |
|---|---|---|
| `server.js` | Servidor Express | **Sí** |
| `public/pages/index.html` | Vista + modal de términos | **Sí** |
| `public/scripts/app.js` | Punto de entrada | **Sí** |
| `public/scripts/eventos.js` | Bind del formulario | **Sí** |
| `public/scripts/validaciones.js` | Validación en tiempo real | **Sí** |
| `public/scripts/terminos.js` | Modal y checkbox de términos | **Sí** |
| `public/scripts/consola.js` | Consola visual | **Sí** |
| `public/scripts/ui.js` | Volver arriba | **Sí** |
| `public/scripts/theme.js` | Tema claro/oscuro | **Sí** |
| `public/styles/light.css` / `dark.css` / `responsive.css` | Sistema visual base | **Sí** |
| `public/styles/terminos.css` | Estilos del modal de términos | **Sí** |
| `public/scripts/main.js` | Formulario de una sola página (anterior) | **No** |
| `public/modules/form-validator.js` | Validador modular anterior | **No** |
| `public/modules/result-renderer.js` | Render de resultados anterior | **No** |
| `public/modules/notifications.js` | Notificaciones del stack anterior | **No** |
| `public/styles/main.css` | Estilos del diseño anterior | **No** |

---

## Carpeta raíz NSJ3

| Archivo | Propósito aparente | ¿Participa en ejecución actual? |
|---|---|---|
| `README_PROJECTS.md` | Guía oral de los 6 proyectos | No (documentación) |
| `njs3/package.json` | Posible contenedor npm raíz | **No** en la ejecución de P1–P6 |
| `njs3/package-lock.json` | Lockfile del contenedor raíz | **No** |

---

## Resumen

- **Archivos activos:** `index.html`, `app.js`, `eventos.js`, `consola.js`, `ui.js`, `theme.js`, `light.css`, `dark.css`, `responsive.css` (+ `terminos.js`, `validaciones.js`, `terminos.css` en P6).
- **Archivos legacy conservados:** principalmente `main.js`, `main.css`, módulos de dominio y fragmentos HTML de versiones anteriores.
- **Motivo probable del legacy:** migración al shell glassmorphism unificado sin borrar el código previo de cada consigna.
