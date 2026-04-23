# P4 - DHTML con Componentes Reutilizables

## Funcionalidad
Este proyecto presenta una pequeña librería de componentes de UI (Modal y Toast) implementados de forma modular en JavaScript. Los componentes se crean y destruyen dinámicamente en el DOM según la interacción del usuario.

## Prolijidad
Código altamente organizado. Cada componente tiene su propio archivo en `public/modules/`, facilitando su mantenimiento y reutilización en diferentes partes de la aplicación.

## Identificación Adecuada
Clases CSS semánticas (`modal-overlay`, `toast-success`, etc.) y IDs claros para los contenedores de los componentes.

## Modularidad / Atomización
Los componentes son "átomos" de UI. No dependen de la lógica de negocio y pueden ser configurados mediante parámetros (título, mensaje, tipo, duración).

## Usabilidad
Interacciones fluidas con animaciones CSS. El usuario recibe feedback no intrusivo mediante Toasts y feedback enfocado mediante Modales.

## Validación
Se asegura que los contenedores necesarios existan en el DOM antes de intentar renderizar los componentes.

## Completitud
Se incluyen 2 componentes funcionales (Modal y Toast) utilizados desde la página principal, cumpliendo con la separación de archivos requerida.

## Nota de Tiempos
Implementación centrada en la creación dinámica de elementos del DOM mediante `createElement` para garantizar la seguridad y evitar el uso de `innerHTML` con contenido externo.
