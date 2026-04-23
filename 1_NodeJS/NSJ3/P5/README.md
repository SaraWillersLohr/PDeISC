# P5 - DHTML con Consumo de Datos Local

## Funcionalidad
Este proyecto simula un catálogo de productos que consume datos desde un endpoint del servidor (que a su vez lee un archivo JSON local). Incluye estados de carga (spinner) y manejo de errores prolijo.

## Prolijidad
Se utiliza `fetch` asíncrono para la obtención de datos y una separación clara entre la lógica de obtención de datos y la lógica de renderizado en el DOM.

## Identificación Adecuada
Uso de clases descriptivas para el sistema de grillas y las tarjetas de productos (`product-card`, `grid`, etc.).

## Modularidad / Atomización
El módulo `renderer.js` encapsula toda la creación de elementos DOM, asegurando que la lógica de negocio en `main.js` no se ensucie con detalles de implementación de la UI.

## Usabilidad
El usuario es informado en todo momento: cuando los datos están cargando, cuando hubo un error o cuando la carga fue exitosa. El botón se deshabilita durante la carga para evitar peticiones duplicadas.

## Validación
Manejo de errores mediante bloques `try/catch` y verificación de la respuesta de la API (`response.ok`).

## Completitud
Cumple con el requisito de carga/espera, renderizado dinámico seguro (sin `innerHTML` con datos de usuario) y consumo de datos locales.

## Nota de Tiempos
Se incluyó un retraso artificial de 1.5 segundos en el servidor para permitir apreciar el estado de carga y la robustez de la UI.
