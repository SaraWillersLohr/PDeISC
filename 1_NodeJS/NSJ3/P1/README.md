# P1 - DHTML Básico / Interacción

## Funcionalidad
El proyecto demuestra una interacción básica con el DOM mediante eventos de JavaScript. Permite al usuario interactuar con botones y campos de texto, registrando cada acción en un historial visible en la pantalla.

## Prolijidad
Se sigue una estructura clara de carpetas separando lógica, estilos y vistas. El código JS está modularizado y utiliza importaciones ES6.

## Identificación Adecuada
Todos los elementos del DOM tienen IDs descriptivos y las clases CSS siguen convenciones estándar.

## Modularidad / Atomización
Se ha creado un módulo `logger.js` en `public/modules/` encargado exclusivamente de la manipulación del historial de eventos, separando la lógica de negocio de la lógica de UI.

## Usabilidad
Interfaz simple y directa. El feedback es inmediato tras cada acción del usuario (Evento: ...).

## Validación
No aplica validaciones complejas en este nivel básico, pero se asegura la carga correcta del DOM antes de asignar listeners.

## Completitud
Cumple con todos los requisitos: server.js, package.json, estructura pública, sin CSS/JS inline y uso seguro de manipulación de DOM.

## Nota de Tiempos
Desarrollado en tiempo estándar para un módulo básico de interacción. No requiere dependencias externas adicionales fuera de Express.
