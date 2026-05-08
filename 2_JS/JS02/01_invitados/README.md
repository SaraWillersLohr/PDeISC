# Proyecto 1: VIP Guest List 🥂

Este proyecto consiste en un sistema de registro para una lista de invitados VIP, enfocado en la carga dinámica de datos y la demostración de técnicas de lectura de formularios en JavaScript.

## Consignas Cumplidas

1.  **Página Dinámica**: Se implementó el uso de `e.preventDefault()` en el evento de envío del formulario para evitar que la página se recargue. El renderizado de los nuevos invitados se realiza manipulando el DOM en tiempo real.
2.  **3 Formas de Lectura de Formularios**: En el archivo `scripts/main.js`, dentro del evento `submit`, se demuestran las tres formas solicitadas:
    *   **FormData**: Uso del objeto `new FormData(form)` para obtener valores de manera moderna.
    *   **Acceso directo**: Acceso a través de `form.apellido.value` (propiedad del objeto form).
    *   **DOM Clásico**: Uso de `document.getElementsByName("edad")[0].value` para acceder a elementos específicos.

## Características Técnicas
*   **Validaciones en Tiempo Real**: Los campos se validan mientras el usuario escribe, proporcionando feedback visual instantáneo (bordes verdes/rojos y mensajes de error).
*   **Filtros Anti-Spam**: Se rechazan nombres irreales, textos aleatorios (como "asdf") y repeticiones excesivas de caracteres.
*   **Diseño Premium**: Interfaz moderna, limpia y totalmente responsive utilizando una paleta de colores profesional.

## Cómo Ejecutar
1. Navegar a la carpeta `01_invitados`.
2. Ejecutar `node server.js`.
3. Abrir `http://localhost:3001` en el navegador.
