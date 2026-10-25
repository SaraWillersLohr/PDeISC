# requerimientos del proyecto final

## alcance y arquitectura

- la solución se divide en `frontend` y `backend`, con responsabilidades y dependencias separadas.
- cada instalación/base corresponde a una única estancia; las solicitudes de acceso pertenecen a la estancia determinada por la configuración del backend y no piden un código organizacional.
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
- los roles principales son administrador, dueño, peón y veterinario; administrador reemplaza al rol anterior de copropietario.
- cada rol tiene permisos y vistas acordes a su trabajo; el backend verifica los permisos y no confía solo en la interfaz.
- administrador administra la organización: solicitudes y datos de usuarios, roles, altas, ediciones y bajas, además de todos los módulos productivos.
- dueño consulta estadísticas, eventos, resultados de cría, corrales, usuarios y su actividad; puede editar animales, administrar corrales y su capacidad, y agregar especies y razas al catálogo de su estancia, pero no administra cuentas.
- peón edita animales, registra movimientos y cambios de ubicación entre corrales, pesajes, servicios de monta, nacimientos con ambos progenitores, muertes y reportes sanitarios. No modifica la estructura ni capacidad de corrales; las nuevas especies y razas quedan pendientes de aprobación administrativa.
- al dar de alta un animal, la caravana/identificador es obligatoria y se ingresa manualmente; la fecha de nacimiento y el peso inicial son opcionales, y la edad se calcula cuando hay fecha registrada.
- peón y dueño pueden cargar y editar servicios de monta; el administrador puede gestionarlos como parte del acceso total a la organización. Las anulaciones conservan el dato y la trazabilidad.
- cada progenitor de un nacimiento debe quedar vinculado a un animal existente o identificado con un nombre de texto si no está registrado.
- el reporte de muerte causa una baja operativa inmediata para impedir movimientos y servicios; queda pendiente de revisión del administrador y conserva la ficha e historial del animal. Al confirmar, el estado queda como fallecido; al rechazar, se reactiva el animal y se conserva el reporte con responsable, fecha y motivo de revisión.
- las estadísticas de cría se consultan por animal; los resúmenes generales pueden contar crías nacidas en el año y hembras preñadas, sin atribuir efectividad personal a quien registró los datos.
- veterinario solo consulta y gestiona tratamientos, controles y altas de animales que están en el corral de enfermería. Dar el alta cambia el estado sanitario, deja al animal en su ubicación física actual y avisa al peón; el peón realiza y registra después el traslado al corral de destino.
- todos los registros gestionados por la app permiten edición y baja cuando corresponda, según permisos del rol, con confirmación y auditoría. La baja es lógica cuando hay historial o referencias; no se borran físicamente eventos necesarios para entender el estado actual o pasado.
- la baja de un animal exige motivo `muerte` o `venta`. La muerte se informa por el flujo de revisión administrativa: baja operativa inmediata, confirmación o rechazo, reactivación si se rechaza y conservación del reporte en el historial. La venta la registra el dueño o administrador con fecha obligatoria y comprador y precio opcionales.
- dueño y administrador pueden editar y dar de baja corrales; antes de la baja deben trasladarse todos los animales asignados y resolverse las dependencias operativas activas. El peón puede mover animales, pero no modificar estructura/capacidad ni dar de baja corrales. Los movimientos históricos conservan sus referencias descriptivas aunque un corral se dé de baja.
- el administrador puede editar y dar de baja usuarios. La baja bloquea el acceso y conserva la autoría histórica; las referencias activas deben reasignarse o resolverse antes de completar la baja.
- la primera cuenta se provisiona como administrador durante la puesta en marcha; no se permite que el registro público cree organizaciones ni cuentas administrativas.
- cada persona solicita acceso a la estancia asociada a la base configurada, verifica el correo y espera aprobación. La solicitud no crea una cuenta activa; el administrador asigna el rol permitido y, al aprobar, se envía un código de activación de un solo uso y con vencimiento.
- usuarios, solicitudes y datos productivos pertenecen a la única estancia de la base configurada; dar de baja a una persona no elimina la auditoría de sus acciones.

## base de datos

- el modelo relacional debe alcanzar, como mínimo, tercera forma normal (3fn); esto incluye las dos primeras formas de normalización indicadas y satisface el requisito más estricto de la consigna.
- las claves y campos de referencia usan nombres descriptivos: `id_usuario`, `id_animal`, `id_rol`, etc. nunca un campo genérico llamado solo `id`.
- se usan restricciones, claves foráneas, índices y validaciones adecuadas para proteger la integridad de los datos.
- la ubicación operativa del animal se deriva del último movimiento confirmado al corral o potrero asignado. No se guarda un punto GPS individual por animal; un punto GPS individual solo se permite en un reporte de muerte para ubicar el hallazgo.
- los puntos GPS usados para definir el perímetro de corrales y potreros forman parte de la geometría fija del mapa y se conservan después de guardar el área.

## calidad y documentación

- el código se organiza en módulos y carpetas claras; ningún archivo de código supera 400 líneas.
- cada archivo de código comienza con un comentario introductorio. cada función, bucle y bloque relevante tiene un comentario inmediatamente anterior.
- los comentarios se escriben en minúscula y, cuando corresponde, en primera persona, describiendo el código que sigue.
- se documentan la instalación, variables de entorno, base de datos, endpoints, métodos http, parámetros, respuestas, errores y uso de la aplicación.
- el repositorio incluye control de versiones, manual de usuario y una guía para construir el apk de android.

## trazabilidad con la consigna

La consigna adjunta exige, además, crud/abml, navegación, contexto o redux, manejo de errores, api rest, mysql/mariadb, jwt, roles, documentación, git, manual de usuario, guía de instalación y apk. Este documento convierte esos requisitos y las decisiones explícitas del proyecto en criterios de implementación y revisión.
