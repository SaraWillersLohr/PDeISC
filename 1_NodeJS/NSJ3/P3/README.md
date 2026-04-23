# P3 - DHTML con Flujo y Estado en Cliente

## Funcionalidad
Implementación de un asistente (wizard) de registro de 3 pasos que gestiona el estado del usuario íntegramente en el cliente. Incluye validación de campos y un resumen final antes de completar el proceso.

## Prolijidad
Estructura organizada con lógica de validación y gestión de estado separada en módulos. Uso de animaciones CSS para mejorar la transición entre pasos.

## Identificación Adecuada
IDs descriptivos para cada paso (`step-1`, `step-2`, etc.) y sus respectivos botones de acción.

## Modularidad / Atomización
- `validator.js`: Contiene funciones puras para validación de datos.
- `state.js`: Gestiona el objeto de estado de la aplicación, encapsulando las actualizaciones.

## Usabilidad
Indicador de progreso visual. Los errores de validación se muestran de forma clara y oportuna. Permite navegar hacia atrás para corregir información.

## Validación
El primer paso requiere que el nombre no esté vacío. El flujo está bloqueado hasta que se cumpla esta condición.

## Completitud
Se implementa un flujo interactivo completo, modularización real de JS y feedback de usuario tras validaciones.

## Nota de Tiempos
Foco en la gestión de estado reactiva simple y manipulación segura del DOM sin `innerHTML` con contenido de usuario (se usa `createTextNode`).
