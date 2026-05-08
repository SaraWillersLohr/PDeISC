# Proyecto 2: Expo Huellitas 🐾

Sistema de inscripción para una exposición de mascotas, centrado en la gestión de datos complejos y el uso de estructuras de datos (arrays) en JavaScript.

## Consignas Cumplidas

1.  **Formulario con 8+ Campos**: El sistema cuenta con 9 campos de entrada: Nombre de Mascota, Especie, Raza, Edad, Peso, Nombre del Dueño, Email, Vacunas y Cantidad de Vacunas.
2.  **Diferentes Métodos de Almacenaje en Array**:
    *   Se utiliza un array global `pets` para almacenar los objetos de las mascotas.
    *   Se demuestra el uso de `.push()` para agregar nuevos registros.
    *   El código incluye comentarios explicando otros métodos como `.unshift()` y la asignación por índice.
3.  **Visualización Dinámica**: Al enviar el formulario, el array se recorre y se generan "cards" interactivas en el HTML sin recargar el sitio.

## Características Técnicas
*   **Validaciones por Especie**: La lógica de validación cruza los datos de Edad y Peso según la especie seleccionada (ej: límites distintos para un Hámster vs una Tortuga).
*   **Feedback Visual**: Validación instantánea con clases de Bootstrap personalizadas para una experiencia de usuario fluida.
*   **Diseño Profesional**: Interfaz moderna con jerarquía visual clara y efectos hover en las tarjetas de resultados.

## Cómo Ejecutar
1. Navegar a la carpeta `02_mascotas`.
2. Ejecutar `node server.js`.
3. Abrir `http://localhost:3002` en el navegador.
