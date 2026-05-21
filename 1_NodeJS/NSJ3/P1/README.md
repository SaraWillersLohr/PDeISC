# P1 — DHTML Básico

Descripción

- Laboratorio DHTML: manipulación real del DOM (H1 e imagen) desde el cliente.

Cómo usa Node

- `server.js` (Express) sirve la carpeta `public` y entrega la página principal.

Ejecutar localmente

```bash
cd P1
npm install
npm start
# Abrir http://localhost:3006
```

Archivos clave

- [server.js](server.js)
- [public/pages/index.html](public/pages/index.html)
- [public/scripts/app.js](public/scripts/app.js)
- [public/scripts/eventos.js](public/scripts/eventos.js) — lógica DHTML (add-h1, add-img, etc.)
- [public/scripts/consola.js](public/scripts/consola.js) — consola visual
- [public/scripts/theme.js](public/scripts/theme.js) — control de tema

# P1 — DHTML Básico (H1 e imagen)

**Estudiante:** Sara Willers Lohr · **Puerto:** 3000

## Consigna 1

Express + index con botones que manipulan el DOM:

- Agregar H1 «Hola DOM»
- Cambiar texto a «Chau DOM»
- Cambiar color del H1
- Agregar imagen
- Cambiar imagen
- Cambiar tamaño de imagen

## Estructura

```
public/pages/index.html
public/scripts/app.js | eventos.js | ui.js | consola.js | theme.js
public/styles/light.css | dark.css | responsive.css
```

## Ejecutar

```bash
npm install && npm start
```

Abrir http://localhost:3000
