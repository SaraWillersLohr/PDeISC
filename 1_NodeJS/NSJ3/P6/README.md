# P6 - Formulario Validado + Render Dinámico

## Funcionalidad
Formulario de inscripción completo con validación de lado cliente para múltiples tipos de campos (texto, email, número, radio, select, checkbox). Al completar exitosamente, muestra un resumen de los datos en la misma página mediante renderizado dinámico del DOM.

## Prolijidad
Uso de `FormData` para la recolección de datos y separación de la lógica de validación en un módulo independiente. Estética moderna basada en un diseño de tarjeta centralizada.

## Identificación Adecuada
Todos los inputs tienen sus respectivos `name` e `id`, vinculados con etiquetas `label` y contenedores de error específicos.

## Modularidad / Atomización
- `form-validator.js`: Contiene las reglas de validación.
- `result-renderer.js`: Se encarga de transformar los datos del formulario en elementos del DOM para el resumen.

## Usabilidad
Feedback inmediato en caso de errores. Los mensajes de error son claros y específicos para cada campo. No hay recarga de página, lo que proporciona una experiencia fluida.

## Validación
Validación robusta que incluye: presencia de datos, formato de email, rangos numéricos y selección obligatoria de opciones.

## Completitud
Cumple con todos los tipos de campos requeridos y la regla de no usar `innerHTML` con contenido de usuario (se utiliza `createTextNode`).

## Nota de Tiempos
Implementación optimizada para una experiencia Single Page en el contexto de un formulario de registro.
