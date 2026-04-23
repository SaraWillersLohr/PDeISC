# P2 - DHTML con Navegación + Eventos

## Funcionalidad
Aplicación que simula navegación entre 5 pantallas (Inicio, Perfil, Configuración, Estadísticas, Ayuda) cargando contenido dinámicamente sin recargar la página. Cada sección implementa eventos DHTML específicos.

## Prolijidad
Separación estricta de responsabilidades. Los "partials" de las páginas se encuentran en `public/pages/`, la lógica de ruteo en `public/modules/router.js` y la lógica de la aplicación en `public/scripts/main.js`.

## Identificación Adecuada
Uso de atributos `data-page` para la navegación y IDs únicos para los elementos interactivos de cada sección.

## Modularidad / Atomización
El módulo `router.js` es independiente y reutilizable para cargar cualquier fragmento HTML en un contenedor específico.

## Usabilidad
Navegación intuitiva mediante una barra superior. Feedback constante mediante una franja amarilla que indica el último evento disparado (Evento: ...).

## Validación
Manejo de errores básico en la carga de páginas mediante `try/catch` en el ruteador.

## Completitud
Se cumplen los 5+ eventos (dblclick, change, keydown, contextmenu, dragstart) y las 5+ secciones de navegación. Sin CSS/JS inline.

## Nota de Tiempos
Implementación de sistema de ruteo básico cliente-side. Compatible con Node.js y Express.
