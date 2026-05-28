# Proyecto 2 — Invitados y Arrays

> La carpeta se llama `02_mascotas` por el historial del repo, pero el contenido actual es el **registro de invitados** pedido en la consigna 2.

Con este proyecto practico **arrays en pantalla** y distintos métodos para guardar datos sin recargar la página.

## Qué cumple de la consigna

- Formulario de **invitados** con **9 campos** (nombre, apellido, email, teléfono, edad, mesa, menú, tipo de entrada, acompañantes + notas).
- Los datos se guardan en un **array** y se ven al instante en cards.
- Elegís el método de guardado:
  - `push()`
  - `unshift()`
  - spread `[...arr, item]`
  - `concat()`
- **Consola visual** que explica qué pasó (por ejemplo: “Array actualizado con push()”).
- **Visor JSON** del array actualizado en pantalla (no uso `console.log` como salida principal).

## Módulos

| Módulo            | Rol                                              |
| ----------------- | ------------------------------------------------ |
| `arrayStorage.js` | Lógica de cada método + render del array         |
| `render.js`       | Cards con todos los campos del invitado          |
| `validations.js`  | Nombres reales, mail, teléfono, edad, mesa, etc. |
| `eventConsole.js` | Historial de eventos de la sesión                |

## Diferencia entre métodos (resumen)

- **push:** agrega al final (el más común).
- **unshift:** agrega al inicio (útil si quiero ver lo último primero).
- **spread:** crea una copia nueva del array (no muta el original si armás bien la asignación).
- **concat:** une arrays/elementos en una copia nueva.

En la consola y en el visor dejo explícito cuál usé en cada carga.

## Cómo ejecutarlo

```bash
cd 02_mascotas
node server.js
```

Abrí `http://localhost:3027`

## Responsive

El visor del array tiene `max-height` y scroll interno para que en mobile no rompa el layout. Las cards van de 1 columna a 2 según el ancho.

## Explicación académica completa

En la raíz del TP: **`../EXPLICACION.md`**
