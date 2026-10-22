# estanciaapp móvil

## propósito

EstanciaApp es una aplicación móvil para administrar una estancia ganadera desde el campo o la oficina. Centraliza animales, corrales, sanidad, tareas, reproducción, eventos ganaderos y alertas en una sola herramienta. Debe seguir siendo útil cuando no hay señal: el personal registra la operación en el teléfono y la aplicación la sincroniza al recuperar internet.

El sistema no busca reemplazar el criterio del productor. Le presenta información actualizada, ordenada y trazable para que pueda decidir con rapidez.

## usuarios y permisos

### dueño

El dueño consulta el estado general de la estancia, indicadores, eventos próximos, resultados económicos y decisiones importantes. Administra la estructura productiva, los usuarios y los permisos. No carga ni valida manualmente los eventos externos: los recibe como información automática de solo lectura.

### copropietario

Tiene una visión administrativa similar a la del dueño. Puede gestionar animales, corrales, tareas y equipo, pero no realizar acciones reservadas exclusivamente para el dueño si se definen en la política de permisos.

### peón

Trabaja sobre la operación diaria: consulta animales y corrales, completa tareas, informa problemas sanitarios, registra pesajes y movimientos autorizados. Puede hacerlo sin conexión.

### veterinario

Gestiona enfermería, tratamientos, controles y altas sanitarias. Accede al historial clínico y recibe avisos vinculados con animales en tratamiento.

El backend nunca confía únicamente en lo que muestra la app. Cada endpoint vuelve a verificar el token y el rol antes de procesar una acción.

## navegación y diseño

La aplicación toma la identidad visual de R5: paleta verde, imagen de campo en el acceso, tarjetas claras, tipografía legible y estados visuales limpios. No se usan alertas nativas.

La navegación principal se organiza en un panel lateral plegable. En teléfonos se abre desde un botón de menú; en pantallas más grandes puede permanecer visible. Cada entrada tiene un icono y una etiqueta breve:

1. inicio
2. animales
3. corrales
4. tareas
5. sanidad
6. reproducción
7. mapa
8. eventos
9. avisos
10. equipo
11. perfil

Las secciones no autorizadas se ocultan. Las acciones avanzadas se muestran dentro del contexto correcto, en vez de llenar el panel con botones.

## inicio: dashboard de estadísticas

Inicio es la primera pantalla después del login. Resume lo importante para el rol actual con tarjetas, gráficos sencillos y accesos rápidos.

Para dueño y copropietario muestra total de animales, distribución por especie y raza, ocupación de corrales, tratamientos activos, tareas pendientes, animales en enfermería, cambios recientes y próximos remates o exposiciones relacionados con las razas de la estancia.

Para peón prioriza tareas del día, tareas vencidas, animales o corrales vinculados a su trabajo y operaciones aún pendientes de sincronizar.

Para veterinario prioriza enfermería, tratamientos activos, próximos controles, reportes sanitarios y altas pendientes.

## animales

La sección permite buscar, filtrar y abrir la ficha de cada animal. Los filtros incluyen especie, raza, corral, estado sanitario y condición de actividad.

La ficha muestra identificador, nombre opcional, raza, fecha de nacimiento, edad calculada, peso vigente, corral, estado sanitario, fotografías, historial y alertas. Desde allí se puede registrar un pesaje, iniciar un traslado autorizado, informar un problema sanitario, ver tratamientos, consultar reproducción y abrir el código QR del animal.

Cada cambio queda asociado al usuario, fecha y operación que lo produjo. No se elimina información operativa: se usa baja lógica cuando corresponda.

## corrales y potreros

Corrales muestra capacidad, ocupación actual, animales asignados, condición de enfermería y alertas. El sistema controla que un traslado no supere la capacidad definida y que un animal enfermo siga las reglas de sanidad.

Cada corral puede estar vinculado con una zona geográfica del establecimiento para aparecer en el mapa. Los potreros se manejan como áreas mayores y pueden contener corrales o zonas operativas según el modelo final.

## tareas

Tareas ordena el trabajo diario sin cargar la interfaz. Cada tarea tiene título, tipo, prioridad, responsable, fecha prevista, estado, corral o animal relacionado y observación.

Ejemplos: vacunar un lote, revisar un tratamiento, preparar un animal para remate, controlar un alambrado o verificar una aguada. El responsable puede completar una tarea offline; al volver la conexión, el cambio se sincroniza y queda en el historial.

## sanidad

Sanidad concentra reportes, enfermería y tratamientos. Un reporte sanitario puede indicar síntomas, observaciones, fotos y animal afectado. El veterinario registra el tratamiento, medicamento, fechas, dosis, evolución y alta.

El sistema muestra animales en enfermería, tratamientos activos, controles próximos y alertas por vencimiento. A futuro incorpora inventario de medicamentos, fechas de vencimiento y períodos de retiro.

## reproducción

Reproducción conserva el historial de servicios, inseminaciones, diagnósticos, preñeces, partos, abortos y destetes. Relaciona madres, padres o semen externo sin duplicar datos.

Las fechas probables de parto generan avisos y se reflejan en el dashboard. La aplicación valida que los vínculos genealógicos sean coherentes con especie, sexo y estado de actividad.

## mapa del campo

Mapa usa una vista geográfica tipo Google Maps. Cada establecimiento se ubica sobre el terreno real; los potreros y corrales se dibujan mediante áreas definidas por coordenadas.

Los colores indican ocupación, capacidad, alertas sanitarias o tareas pendientes. Al tocar un área se abre su resumen con animales, tratamientos, movimientos y tareas.

Los límites geográficos se pueden cargar dibujándolos sobre el mapa, recorriendo el perímetro con el teléfono o importando archivos KML/GeoJSON. La información de las áreas queda guardada localmente; el fondo satelital requiere internet.

## eventos

Eventos es un calendario nacional de solo lectura. Muestra remates y exposiciones obtenidos de asociaciones oficiales de criadores. Se puede filtrar por especie, raza, provincia, tipo de evento y fecha.

Cada ficha incluye título, tipo, fechas, provincia, localidad, organizador, enlace oficial, fuente, razas involucradas y, cuando exista, información sobre lotes, animales o resultados.

El sistema consulta las fuentes configuradas semanalmente. Cada extractor se adapta al formato de su asociación, normaliza el dato y evita duplicados usando la fuente y el enlace oficial. Si no puede obtener datos esenciales, el evento no se publica y el error queda registrado internamente. El dueño recibe en Inicio los próximos eventos relevantes para sus razas, sin tener que cargarlos o validarlos.

## avisos

Avisos es la bandeja interna de notificaciones. Reúne alertas sanitarias, tratamientos, tareas, movimientos, sincronización, próximos partos y eventos relevantes.

Cada aviso indica su origen y, cuando corresponde, abre directamente el animal, corral, tarea o evento relacionado. Hay avisos globales y dirigidos a usuarios o roles. Primero se implementa la bandeja interna; las notificaciones push se agregan después de validar este flujo.

## equipo y perfil

Equipo permite a dueño y copropietario consultar y administrar usuarios, roles y estado de acceso. Perfil permite a cada persona actualizar sus datos permitidos, cambiar contraseña y cerrar sesión.

El acceso contempla inicio de sesión, sesión persistente, renovación de token, recuperación de contraseña, verificación de correo, código de acceso inicial y, cuando se configuren credenciales, autenticación social.

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
6. integrar mapa geográfico.
7. incorporar reproducción, eventos automáticos y mejoras avanzadas.
8. probar, documentar, desplegar y generar el APK.
