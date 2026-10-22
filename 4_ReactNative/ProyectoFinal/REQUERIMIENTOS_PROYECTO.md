# requerimientos del proyecto final

## alcance y arquitectura

- la solución se divide en `frontend` y `backend`, con responsabilidades y dependencias separadas.
- el frontend se implementa con typescript, react native y expo go.
- el backend expone una api rest documentada y modular.
- se usa mariadb, administrada localmente con heidisql y desplegada en aiven cuando corresponda.
- la configuración, las url, las credenciales y los valores que cambian entre entornos se obtienen desde variables de entorno. no se hardcodean.

## interfaz y experiencia

- no se usan `alert`. los avisos, errores y confirmaciones se muestran en modales elegantes y accesibles.
- cuando una pantalla tenga contenido largo, se incorpora un botón flotante abajo a la derecha para volver al inicio.
- las pantallas son responsivas, claras, navegables y aprovechan el espacio disponible.
- los formularios validan la información y muestran mensajes útiles mediante la interfaz.
- la app funciona sin conexión para las tareas de campo: conserva una copia local de los datos necesarios y encola los cambios hasta recuperar internet.
- cada operación offline usa un identificador único; el backend la aplica una sola vez y confirma su sincronización para evitar duplicados.
- si dos personas modifican el mismo dato, el backend conserva la versión más reciente y devuelve un conflicto explícito para que la app pueda informar y recargar el dato.

## api y seguridad

- `get` se usa para obtener recursos y consultas sin efectos secundarios.
- las operaciones de creación, autenticación y modificación conservan el método http que corresponde: `post`, `put` o `patch`; no se reemplazan por `get` porque eso rompería la semántica y la seguridad de una api rest.
- se implementan registro, inicio de sesión, tokens jwt de acceso y renovación, persistencia de sesión y protección de endpoints por rol.
- hay al menos tres roles con permisos y vistas acordes a cada perfil.

## base de datos

- el modelo relacional debe alcanzar, como mínimo, tercera forma normal (3fn); esto incluye las dos primeras formas de normalización indicadas y satisface el requisito más estricto de la consigna.
- las claves y campos de referencia usan nombres descriptivos: `id_usuario`, `id_animal`, `id_rol`, etc. nunca un campo genérico llamado solo `id`.
- se usan restricciones, claves foráneas, índices y validaciones adecuadas para proteger la integridad de los datos.

## calidad y documentación

- el código se organiza en módulos y carpetas claras; ningún archivo de código supera 400 líneas.
- cada archivo de código comienza con un comentario introductorio. cada función, bucle y bloque relevante tiene un comentario inmediatamente anterior.
- los comentarios se escriben en minúscula y, cuando corresponde, en primera persona, describiendo el código que sigue.
- se documentan la instalación, variables de entorno, base de datos, endpoints, métodos http, parámetros, respuestas, errores y uso de la aplicación.
- el repositorio incluye control de versiones, manual de usuario y una guía para construir el apk de android.

## trazabilidad con la consigna

La consigna adjunta exige, además, crud/abml, navegación, contexto o redux, manejo de errores, api rest, mysql/mariadb, jwt, roles, documentación, git, manual de usuario, guía de instalación y apk. Este documento convierte esos requisitos y las decisiones explícitas del proyecto en criterios de implementación y revisión.
