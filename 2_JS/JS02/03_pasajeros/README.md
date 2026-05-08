# Proyecto 3: Registro de Personas ✈️

Sistema avanzado de gestión de datos personales con persistencia de datos en el navegador y validaciones de seguridad estrictas.

## Consignas Cumplidas

1.  **Almacén de Datos Completo**: Implementación de todos los campos requeridos: Nombre, Apellido, Edad, Fecha de nacimiento, Sexo, Documento, Estado civil, Nacionalidad, Teléfono, Mail y el campo condicional de Hijos.
2.  **Persistencia con LocalStorage**: Los datos se guardan de forma permanente en el navegador utilizando `localStorage.setItem` y se recuperan con `localStorage.getItem` al recargar la página.
3.  **Lógica Dinámica de Hijos**: El campo para ingresar la cantidad de hijos se habilita o deshabilita automáticamente basándose en la selección previa del usuario.
4.  **Listado de Nombres**: Se muestra una sección dinámica con los nombres completos y datos principales de todas las personas almacenadas en el sistema.

## Validaciones Estrictas (Seguridad)
*   **Geográfica**: Solo se aceptan nacionalidades de países de Sudamérica.
*   **Identidad**: El DNI debe ser un número real (mínimo 1.000.000).
*   **Coherencia Temporal**: La fecha de nacimiento no puede ser anterior a 1915 y debe coincidir con la edad ingresada.
*   **Filtro de Spam**: Los nombres deben ser reales y tener diversidad de caracteres (rechaza textos aleatorios como "dssdsfds").

## Características Técnicas
*   **Integración con API**: Uso de Gender API para verificar la coherencia entre el nombre ingresado y el sexo seleccionado.
*   **UI/UX Premium**: Diseño minimalista, tipografía moderna y feedback visual de alta visibilidad.

## Cómo Ejecutar
1. Navegar a la carpeta `03_pasajeros`.
2. Ejecutar `node server.js`.
3. Abrir `http://localhost:3003` en el navegador.
