# Explicación del Trabajo Práctico - Node.js (NJS1)

Este documento explica de forma sencilla cómo funciona este proyecto, el uso de **Node.js** y **JavaScript** en el desarrollo de servidores web.

## 1. ¿De qué trata este TP?
Este trabajo práctico (TP) consiste en una serie de 5 ejercicios incrementales donde aprendemos las bases de Node.js. Pasamos de imprimir mensajes simples en la consola hasta crear un servidor web real que procesa datos y sirve estilos CSS dinámicos (Modo Claro/Oscuro).

### Estructura del Proyecto
Hemos organizado los archivos para que el código sea más limpio y fácil de mantener:
- **`Ejercicios/scripts/`**: Contiene los archivos principales de cada ejercicio (`ejercicio1.js` a `ejercicio5.js`). Aquí es donde vive la lógica del servidor.
- **`Ejercicios/modules/`**: Aquí guardamos `calculos.js`, un módulo que contiene funciones matemáticas reutilizables.
- **`Ejercicios/styles/`**: Contiene todas las hojas de estilo CSS (`styles.css`, `lightmode.css`, `darkmode.css`) para que la web se vea moderna.

---

## 2. Uso de Node.js
**Node.js** es el entorno que nos permite ejecutar JavaScript fuera del navegador (en nuestra computadora o servidor). En este proyecto lo usamos para:

*   **Crear un Servidor HTTP**: Usamos el módulo nativo `node:http` para escuchar peticiones en diferentes puertos (3001 al 3005).
*   **Manejar el Sistema de Archivos**: Con `node:fs`, el servidor lee los archivos CSS del disco y se los envía al navegador.
*   **Módulos (ESM)**: Usamos `import` y `export` para organizar el código. Esto nos permite separar las funciones matemáticas en un archivo aparte e importarlas donde las necesitemos.
*   **Rutas Dinámicas**: Node.js nos permite detectar qué está pidiendo el usuario (por ejemplo, `/styles.css`) y responder con el contenido correcto.

---

## 3. Uso de JavaScript (JS)
JavaScript es el lenguaje de programación que da vida a todo. Lo usamos en dos lugares:

### En el Servidor (Node.js):
- **Lógica Aritmética**: Realizamos cálculos directamente o mediante funciones.
- **Plantillas de Texto (Template Literals)**: Usamos las comillas invertidas (`` ` ``) para armar el código HTML de forma dinámica, inyectando los resultados de los cálculos directamente en la página.
- **Objetos y Arrays**: En el ejercicio 5, agrupamos toda la información de los ejercicios anteriores en estructuras de datos para mostrarlas en un solo panel.

### En el Navegador (Cliente):
- **Interactividad**: El JS que corre en el navegador se encarga de cambiar el tema (Claro/Oscuro) guardando la preferencia en el `localStorage`.
- **Bootstrap**: Usamos esta librería para que el diseño sea responsivo y se vea bien en celulares y computadoras.

---

## ¿Cómo ejecutar los ejercicios?
Para ver cada ejercicio, debés abrir una terminal en la carpeta `Ejercicios` y ejecutar:
```bash
node scripts/ejercicio1.js
```
Luego podés abrir tu navegador en `http://localhost:3001`. ¡Y así con cada uno cambiando el número!
