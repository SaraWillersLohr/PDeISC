# estanciaapp móvil

## propósito

EstanciaApp es una aplicación móvil para administrar una estancia ganadera desde el campo o la oficina. Centraliza animales, corrales, sanidad, tareas, reproducción, eventos ganaderos y alertas en una sola herramienta. Debe seguir siendo útil cuando no hay señal: el personal registra la operación en el teléfono y la aplicación la sincroniza al recuperar internet.

El sistema no busca reemplazar el criterio del productor. Le presenta información actualizada, ordenada y trazable para que pueda decidir con rapidez.

## usuarios y permisos

### dueño

El dueño consulta estadísticas, eventos, resultados de cría, corrales, usuarios y su actividad; también puede editar las fichas de animales, administrar corrales y agregar especies y razas al catálogo de su estancia. Puede dar de baja corrales cuando ya no tengan animales ni dependencias operativas activas. No administra cuentas ni permisos. Las estadísticas reproductivas priorizan resultados por animal y conteos del año, como crías nacidas y yeguas preñadas; no atribuyen efectividad individual al usuario que cargó el dato.

### administrador

Reemplaza al rol anterior de copropietario y puede gestionar la organización completa. La primera cuenta se provisiona como administrador al iniciar una organización; desde allí habilita al resto del equipo. Administra solicitudes de alta, crea o activa cuentas, asigna roles, edita o da de baja usuarios y gestiona los datos productivos, incluidos corrales y catálogos.

### peón

Trabaja sobre la operación diaria: consulta y edita animales, registra pesajes y movimientos de animales entre corrales, informa problemas sanitarios, nacimientos y muertes, registra servicios de monta y solicita especies o razas nuevas para la organización. Puede cambiar la ubicación operativa, pero no crea corrales ni modifica su capacidad o estructura. Las solicitudes de catálogo quedan pendientes hasta que el administrador las apruebe. Puede hacerlo sin conexión. Cada operación queda identificada con fecha, persona y ubicación del evento cuando la informa.

### veterinario

Solo accede a los animales que están en el corral de enfermería. Para esos animales puede consultar el historial clínico y registrar tratamientos, controles y altas. El alta veterinaria cambia inmediatamente el estado sanitario a sano y genera un aviso al peón, pero no mueve al animal: permanece en enfermería hasta que el peón realiza y registra el traslado físico al corral de destino.

### solicitudes de acceso

La cuenta inicial de administrador se provisiona una sola vez durante la puesta en marcha; el registro público no puede crear otro administrador ni una organización por sí solo. Como en RN_1, cada instalación/base corresponde a una única estancia, por lo que el formulario no pide un código de organización: el backend asocia la solicitud con la estancia de la base configurada. La persona solicita acceso con nombre, apellido, correo y contraseña, verifica el correo y espera aprobación. El administrador elige uno de los roles permitidos, crea o activa la cuenta y envía un código de un solo uso con vencimiento para completar el primer acceso. Las bajas de usuarios conservan la auditoría de las operaciones ya realizadas.

El backend nunca confía únicamente en lo que muestra la app. Cada endpoint vuelve a verificar el token y el rol antes de procesar una acción. El alcance de la estancia queda implícito en la base configurada para esa instalación; el sistema admite una estancia por base. Alojar varias estancias en una misma base requeriría incorporar y validar `id_organizacion` en usuarios, solicitudes y datos productivos.

## navegación y diseño

La aplicación toma la identidad visual de R5: paleta verde, imagen de campo en el acceso, tarjetas claras, tipografía legible y estados visuales limpios. No se usan alertas nativas.

La navegación principal se adapta al dispositivo: en teléfonos usa una barra inferior con accesos frecuentes y un menú de secciones; en pantallas más grandes puede permanecer abierto un panel lateral. Cada entrada tiene un icono y una etiqueta breve:

1. inicio
2. animales
3. corrales
4. tareas
5. sanidad
6. reproducción
7. eventos
8. avisos
9. equipo
10. perfil

Las secciones no autorizadas se ocultan. Las acciones avanzadas se muestran dentro del contexto correcto, en vez de llenar el panel con botones.

## inicio: dashboard de estadísticas

Inicio es la primera pantalla después del login. Resume lo importante para el rol actual con tarjetas, gráficos sencillos y accesos rápidos.

Para el administrador muestra solicitudes de acceso, usuarios y actividad de la organización. Para el dueño muestra existencias, ocupación, efectividad reproductiva, actividad de sus usuarios y próximos remates o exposiciones relevantes.

Para peón prioriza tareas del día, tareas vencidas, animales o corrales vinculados a su trabajo y operaciones aún pendientes de sincronizar.

Para veterinario muestra solo enfermería, tratamientos activos, próximos controles y altas pendientes de animales en ese corral.

Los resultados de reproducción se consultan en la ficha e historial de cada animal. El resumen anual puede contar crías nacidas y hembras preñadas según diagnósticos vigentes. La app distingue el autor de una carga de los eventos reproductivos del animal y no interpreta esos conteos como una calificación de desempeño del usuario.

## animales

La sección permite buscar, filtrar y abrir la ficha de cada animal. Los filtros incluyen especie, raza, corral, estado sanitario y condición de actividad.

La ficha muestra identificador, nombre opcional, raza, fecha de nacimiento, edad calculada, peso vigente, corral o potrero actual, estado sanitario, fotografías, historial y alertas. La caravana/identificador se ingresa manualmente y es obligatoria; la fecha de nacimiento y el peso inicial son opcionales. Desde la ficha, el peón puede reportar una enfermedad e ingresar al animal a enfermería en una sola operación, o notificar una muerte con ubicación GPS obligatoria y foto y observaciones opcionales. El veterinario solo accede a fichas de animales ubicados en enfermería.

Un nacimiento crea el registro de la cría y exige informar madre y padre. Cada progenitor se vincula con un animal de la estancia o se consigna en texto si no figura en el sistema; la madre debe ser una hembra de la misma especie y el padre puede venir de un servicio registrado o de un reproductor externo. Una muerte se registra como evento trazable con fecha, coordenadas GPS obligatorias y causa y foto opcionales. La baja operativa es inmediata para impedir nuevos movimientos o servicios y nunca borra la ficha ni su historial. La muerte informada por el peón queda pendiente de revisión administrativa; si se rechaza el reporte, el animal se reactiva y el reporte rechazado permanece en la auditoría. La muerte registrada por el dueño desde la ficha queda confirmada directamente.

Todo dato gestionado por la app se puede modificar y dar de baja cuando corresponda, respetando permisos por rol y validaciones del campo. El dueño puede dar de baja un animal desde su ficha por venta, muerte u otro motivo, con detalle opcional; la ficha y el historial se conservan y el animal deja el inventario activo. La muerte registrada por el dueño queda confirmada en el registro de muertes, mientras que los reportes del peón siguen sujetos a revisión administrativa. El tablero muestra ventas y muertes confirmadas del año. El dueño también puede borrar permanentemente registros de reproducción, razas y especies después de confirmar en un modal; las razas o especies asociadas a animales no se pueden borrar. Cada cambio y baja registra quién la hizo, cuándo y, cuando corresponda, el motivo. Los corrales pueden darse de baja por dueño o administrador solo después de trasladar todos sus animales y resolver dependencias activas. Los usuarios pueden ser editados o dados de baja por el administrador; las acciones históricas conservan su autor original.
La ubicación operativa de un animal se deriva del último movimiento confirmado al corral asignado. No se rastrea al animal. Al notificar una muerte se captura obligatoriamente un punto GPS para ubicar el hallazgo; la app no guarda perímetros ni muestra mapas.

## corrales y potreros

Corrales muestra capacidad, ocupación actual, animales asignados, condición de enfermería y alertas. El sistema controla que un traslado no supere la capacidad definida y que un animal enfermo siga las reglas de sanidad.

El dueño administra la estructura de corrales y su capacidad, y puede editar o dar de baja corrales después de trasladar todos sus animales. El administrador también puede hacerlo. El peón informa movimientos y ocupación operativa, sin poder cambiar la capacidad, estructura ni dar de alta o baja corrales. El historial de movimientos mantiene el corral de origen aunque este se dé de baja. Los corrales se consultan como registros operativos, sin vista de mapas.

## tareas

Tareas ordena el trabajo diario sin cargar la interfaz. Cada tarea tiene título, tipo, prioridad, responsable, fecha prevista, estado, corral o animal relacionado y observación.

Ejemplos: vacunar un lote, revisar un tratamiento, preparar un animal para remate, controlar un alambrado o verificar una aguada. El responsable puede completar una tarea offline; al volver la conexión, el cambio se sincroniza y queda en el historial.

## sanidad

Sanidad concentra reportes, enfermería y tratamientos. Un reporte sanitario puede indicar síntomas, observaciones, fotos y animal afectado. El veterinario registra el tratamiento, medicamento, fechas, dosis, evolución y alta.
Cuando el peón informa una sospecha, el sistema registra el reporte y avisa al equipo; no inventa un diagnóstico. Un traslado hacia enfermería conserva origen, destino, hora y responsable, y el veterinario determina el tratamiento y el alta. Al dar el alta, el animal queda sano aunque siga ubicado en enfermería; el sistema notifica a los peones y el peón registra luego el traslado físico al corral de destino. El veterinario no realiza ese traslado en el sistema.

El sistema muestra animales en enfermería, tratamientos activos, controles próximos y alertas por vencimiento. A futuro incorpora inventario de medicamentos, fechas de vencimiento y períodos de retiro.

## reproducción

Reproducción conserva el historial de servicios de monta, inseminaciones, diagnósticos, preñeces, partos, abortos y destetes. Relaciona madres, padres o semen externo sin duplicar datos. Un servicio identifica la hembra, el reproductor o semen, el método, la fecha y quien lo registró; los eventos posteriores se enlazan a ese servicio cuando corresponde. Peón y dueño pueden cargar y editar servicios; el administrador puede gestionarlos por su permiso general. Las anulaciones conservan el registro y su auditoría.

Las fechas probables de parto generan avisos y se reflejan en el dashboard. La aplicación valida que los vínculos genealógicos sean coherentes con especie, sexo y estado de actividad.

## ubicación de reportes

No se muestra un mapa ni se guardan perímetros geográficos de corrales. El peón puede adjuntar el punto GPS del hallazgo únicamente al informar una muerte; no hay seguimiento continuo de animales ni personas. Los corrales siguen funcionando con capacidad, ocupación e historial de movimientos.

## eventos

Eventos es un calendario de solo lectura. Prioriza remates, exposiciones y jornadas vinculados con especies y razas de animales activos de la estancia. El usuario puede filtrar por especie, raza, provincia y fecha, y ver todos los eventos publicados para las especies que tiene activas. Las especies ovina y porcina quedan preparadas como fuentes, pero sus eventos no aparecen hasta que el dueño las incorpore a la estancia.

Cada ficha incluye título, tipo, fechas, provincia, localidad, organizador, enlace oficial, fuente, razas involucradas y, cuando exista, información sobre lotes, animales o resultados.

El sistema consulta semanalmente las páginas de eventos, remates, calendarios y novedades de las asociaciones configuradas. Reconoce datos estructurados, tablas, tarjetas/listas y fechas en títulos; conserva el enlace y asociación de origen, normaliza fechas y evita duplicados por asociación, título y fecha. La pantalla muestra los próximos eventos desde hoy y el estado de lectura de cada fuente. Los errores de lectura quedan registrados; cada asociación puede requerir ajustar su extractor si cambia el formato de la página. El calendario no inventa provincia o localidad cuando la publicación no las informa.

## avisos

Avisos es la bandeja interna de notificaciones. Reúne alertas sanitarias, tratamientos, tareas, movimientos, sincronización, próximos partos y eventos relevantes.

Cada aviso indica su origen y, cuando corresponde, abre directamente el animal, corral, tarea o evento relacionado. Hay avisos globales y dirigidos a usuarios o roles. Primero se implementa la bandeja interna; las notificaciones push se agregan después de validar este flujo.

## equipo y perfil

Equipo permite al administrador revisar solicitudes, aceptar o rechazar accesos, asignar dueño, peón o veterinario, enviar códigos de activación y editar o dar de baja cuentas. Al aprobar una solicitud se crea la cuenta con el rol elegido; el rol de administrador nunca se solicita desde el registro público. Las bajas bloquean el acceso, conservan la autoría y requieren resolver las referencias activas que no puedan quedar huérfanas. El dueño consulta sus usuarios y su actividad productiva. Perfil permite a cada persona actualizar sus datos permitidos, cambiar contraseña y cerrar sesión.
La baja de una cuenta bloquea el acceso y conserva la autoría en el historial. El código de activación se almacena como hash, vence, tiene límite de intentos y se invalida después del primer uso.

El acceso contempla inicio de sesión, sesión persistente, renovación de token, recuperación de contraseña, verificación de correo, código de acceso inicial y reenvío limitado de códigos. Para habilitar registro y activación hay que configurar SMTP y `VERIFICATION_CODE_SECRET` en el entorno del backend. Después de respaldar la base, se aplican una sola vez, en este orden, `backend/migrations/2026-10-22-replace-copropietario-with-administrador.sql`, `backend/migrations/2026-10-22-registration-flow.sql`, `backend/migrations/2026-10-22-animal-movements.sql` y `backend/migrations/2026-10-22-nursing-discharge.sql`. Para reiniciar los datos sin eliminar las tablas, ejecutar luego `backend/migrations/2026-10-22-clean-operational-data.sql`: conserva la cuenta activa más antigua de administrador y dueño y elimina los demás registros. La migración comprueba que ambas cuentas existan y que todas las tablas sean transaccionales antes de borrar. Las migraciones se entregan como archivos y no se ejecutan automáticamente sobre la base existente.

## funcionamiento sin conexión

La app guarda en SQLite los datos operativos que necesita cada rol: animales relevantes, corrales, tareas, tratamientos y avisos recientes. También guarda una cola de acciones pendientes.

Cuando no hay internet, el usuario puede consultar esa copia y registrar operaciones permitidas. Cada cambio recibe un identificador único y se conserva en orden. Cuando vuelve la conexión, la app envía primero las operaciones pendientes y luego descarga cambios remotos.

El backend procesa cada identificador una sola vez, de modo que una reconexión no duplica un pesaje, traslado o reporte. Si detecta un conflicto, la operación queda visible y la app muestra un modal con la explicación, sin descartar datos silenciosamente.

## datos y arquitectura

El frontend se implementa con React Native, Expo y TypeScript. El backend se implementa con Node.js, Express y TypeScript. Ambos se mantienen en carpetas separadas y se comunican mediante una API REST con JSON.

MariaDB guarda los datos estructurados y Aiven se usa para el despliegue de la base cuando corresponda. La configuración usa variables de entorno. No se guardan credenciales, URLs de despliegue ni secretos dentro del código.

El modelo relacional se mantiene como mínimo en tercera forma normal. Las claves usan nombres explícitos como `id_usuario`, `id_animal`, `id_corral` e `id_evento`. Las tablas adicionales previstas incluyen tareas, historiales de peso y movimientos, auditoría, operaciones de sincronización, áreas geográficas y eventos importados.

Las fotos no se almacenan como archivos dentro de MariaDB. Se suben a un almacenamiento de archivos y la base conserva solo su referencia, metadatos y relación con el reporte o animal.

## seguridad, calidad y trazabilidad

Las contraseñas se almacenan con hash seguro. Los tokens JWT tienen vencimiento y renovación. El cierre de sesión puede invalidar sesiones activas. Cada ruta sensible exige autenticación y verifica permisos.

Las validaciones importantes se realizan en el backend: capacidad del corral, estado del animal, permisos de rol y coherencia reproductiva. La interfaz acompaña con validaciones tempranas, pero no reemplaza al servidor.

La auditoría conserva quién hizo una operación, cuándo y sobre qué entidad. El proyecto se modulariza para que cada archivo tenga una responsabilidad clara y un tamaño manejable, con comentarios en minúscula que expliquen el código.

## orden racional de implementación

1. proteger la base existente y configurar entornos.
2. terminar acceso, roles y componentes visuales reutilizables.
3. construir inicio, animales y corrales.
4. agregar tareas, sanidad, avisos e historial.
5. incorporar funcionamiento offline y sincronización real.
6. incorporar eventos automáticos y mejoras avanzadas.
7. completar reproducción y operación sin conexión.
8. probar, documentar, desplegar y generar el APK.
