# NSJ3 — Guía de Proyectos (Examen Oral)

Este documento resume el funcionamiento de los proyectos P1 a P6. Está diseñado para servir como apoyo durante la explicación técnica de la entrega.

## **Estructura General**

Todos los proyectos comparten una arquitectura similar para mantener la consistencia:

1.  **Backend (Node.js + Express)**: Cada carpeta tiene su propio `server.js`. Usamos Express para servir archivos estáticos (HTML, CSS, JS) desde la carpeta `/public`.
2.  **Frontend (Vanilla JS + ESM)**: No usamos frameworks pesados. Todo es JavaScript puro (Vanilla) utilizando **Módulos de ECMAScript (ESM)**. Esto permite importar y exportar funciones (`import`/`export`) de forma nativa en el navegador.
3.  **Organización de Archivos**:
    -   `/public/pages`: Contiene los archivos HTML (vistas).
    -   `/public/scripts`: Archivos de control principal y lógica de eventos.
    -   `/public/modules`: Lógica de negocio reutilizable (validadores, gestores de estado, etc.).

---

## **Resumen de cada Proyecto**

### **P1: Laboratorio DHTML y Métodos de Array**
-   **Objetivo**: Practicar la manipulación directa del DOM y entender cómo funcionan los métodos de array (map, filter, reduce, etc.).
-   **Clave**: Se recrearon los métodos de array manualmente para entender su comportamiento (si mutan el array original o no).
-   **DHTML**: Uso de `document.createElement` y `appendChild` para modificar la interfaz en tiempo real.

### **P2: SPA (Single Page Application) Básica**
-   **Objetivo**: Navegación dinámica sin recargar la página.
-   **Clave**: Un módulo `router.js` usa `fetch()` para traer fragmentos de HTML y los inyecta en un contenedor principal.
-   **Eventos**: Se gestionan los eventos de cada "página" cargada dinámicamente.

### **P3: Manejo de Estado y Formularios**
-   **Objetivo**: Controlar la información que el usuario ingresa.
-   **Clave**: Un `stateManager.js` centraliza los datos (nombre, tema, etc.) para que toda la app esté sincronizada.
-   **DOM**: Uso de `querySelector` y manejo de eventos de formulario.

### **P4: Atributos y Nodos Dinámicos**
-   **Objetivo**: Modificar propiedades de los elementos HTML.
-   **Clave**: Creación de enlaces (`<a>`) dinámicos y edición de sus atributos (`href`, `target`) mediante un módulo especializado.
-   **Utilidad**: Separar la creación de nodos de la lógica de la aplicación.

### **P5: E-commerce y Catálogo JSON**
-   **Objetivo**: Simular una tienda virtual con carrito de compras.
-   **Clave**: Los productos se cargan desde un archivo `products.json`.
-   **Lógica**: Un `cartManager.js` maneja la lógica de negocio (sumar totales, agregar/quitar productos) de forma independiente a la visual.

### **P6: Validaciones Avanzadas y APIs Externas**
-   **Objetivo**: Validación robusta de datos.
-   **Clave**: Uso de **APIs externas** (Abstract API) para validar correos electrónicos y nombres reales en tiempo real.
-   **UX**: Feedback inmediato al usuario mediante notificaciones y clases de CSS dinámicas.

---

## **Cómo Ejecutar**

En cualquier carpeta (`P1` a `P6`):
```bash
npm install
npm start
```
Cada proyecto corre en un puerto distinto (3006 al 3011).

---

## **Conceptos para el Oral**
-   **Inmutabilidad**: Muchos métodos de array de P1 no modifican el array original, sino que devuelven uno nuevo.
-   **Asincronismo**: Usamos `async/await` para cargar páginas (P2) o consultar APIs (P6).
-   **Modularización**: Separar el código en archivos pequeños facilita el mantenimiento y la lectura.
-   **Event Loop**: JavaScript maneja eventos de forma no bloqueante, permitiendo una interfaz fluida.
