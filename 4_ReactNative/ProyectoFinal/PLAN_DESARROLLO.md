# plan de desarrollo de estanciaapp móvil

> **Estado revisado el 26/10/2026:** varias casillas de las etapas siguientes quedaron desactualizadas frente a la implementación. La revisión más reciente está en `REVISION_PROYECTO_2026-10-26.md`; ese documento distingue código implementado, tareas de instalación y funciones aún faltantes. No considerar una casilla abierta como prueba de que la función no existe, ni una casilla marcada como prueba de que fue validada en una base real.

## criterio de diseño

La app conserva la identidad visual de R5: imagen de campo en acceso, paleta verde, superficies claras, tarjetas, métricas y navegación ordenada. En móvil, la barra lateral se convierte en una navegación inferior y los módulos usan pantallas táctiles simples. Los modales, avisos y confirmaciones siguen el estilo visual de R5 y reemplazan por completo a `alert`.

La complejidad vive en el backend, las reglas por rol, la sincronización y los servicios automáticos; no en la interfaz. La navegación se organiza en un panel lateral plegable, similar al de R5, con iconos, etiquetas breves y grupos discretos. Las secciones previstas son inicio, animales, corrales, tareas, sanidad, reproducción, eventos, avisos, equipo y perfil. Las opciones avanzadas solo aparecen para el rol que las necesita.

## etapa 0 - preparación y protección de datos

- [x] separar `frontend` Expo y `backend` Express con TypeScript.
- [x] definir configuración por entorno y eliminar valores sensibles del código.
- [x] conservar `estancia_app` como fuente de datos existente.
- [ ] crear una copia de respaldo en HeidiSQL antes de aplicar una migración.
- [ ] registrar qué migraciones se aplican a la base y en qué fecha.
- [x] definir el alcance: una estancia por instalación/base, como RN_1; el formulario de solicitud no pide código de organización y el backend usa la base configurada.

**resultado:** se puede desarrollar sin recrear ni perder la base actual.

## etapa 1 - acceso y sesión

- [ ] reutilizar el diseño de login de R5 en React Native: imagen, marca, campos, visibilidad de contraseña y recordar sesión.
- [ ] crear un proveedor global de sesión, tema y mensajes visuales.
- [ ] completar inicio de sesión, perfil actual, renovación de token y cierre de sesión.
- [ ] sumar registro, verificación de correo, recuperación de contraseña y código de acceso inicial inspirados en RN_1.
- [ ] implementar permisos para administrador, dueño, peón y veterinario; reemplazar el rol copropietario después de respaldar la base.
- [ ] implementar solicitudes pendientes de acceso, aprobación administrativa y códigos de activación de un solo uso con vencimiento.
- [ ] provisionar la primera cuenta como administrador durante la puesta en marcha; después, asociar las solicitudes con la única estancia de la base y dejar la creación/activación de usuarios bajo control administrativo.
- [x] incorporar acceso social con Google, Facebook y GitHub; validar el correo verificado en el backend y permitir solo cuentas activas ya aprobadas.

**resultado:** cada persona accede de forma segura y ve solamente lo permitido por su rol.

## etapa 2 - sistema visual y navegación

- [ ] crear componentes reutilizables: botón, campo, tarjeta, modal, toast, encabezado y estado vacío.
- [ ] traducir la barra lateral de R5 a navegación inferior y menú contextual para móvil.
- [ ] agregar modo claro y oscuro persistente.
- [ ] mostrar una acción flotante para volver arriba en listados extensos.
- [ ] verificar accesibilidad: tamaños táctiles, etiquetas, contraste y teclado.

**resultado:** todas las pantallas mantienen la misma interfaz visual de R5 y son cómodas en teléfonos.

## etapa 3 - dashboard por rol

- [ ] administrador: solicitudes de alta, usuarios y estado general de la organización.
- [ ] dueño: estadísticas, eventos, resultados de cría por animal, conteos anuales de crías y hembras preñadas, animales, corrales y actividad de usuarios.
- [ ] peón: tareas de campo, animales asignados, traslados pendientes y reportes sanitarios.
- [ ] veterinario: acceso acotado al corral de enfermería, tratamientos a controlar, altas pendientes e historial clínico de esos animales.
- [ ] incluir métricas, gráficos simples y estados vacíos útiles.

**resultado:** la primera pantalla prioriza las decisiones reales de cada rol.

## etapa 4 - operación ganadera

- [x] primera conexión de inventario: consultar animales activos y corrales con ocupación desde la API protegida, mostrar listados móviles, búsqueda y estados de carga/error; las escrituras y bajas siguen pendientes.
- [x] movimientos: peón registra traslados desde la ficha del animal; el backend valida destino activo, capacidad y estado del animal, y guarda origen, destino, responsable y fecha en historial. La nueva tabla requiere aplicar `backend/migrations/2026-10-22-animal-movements.sql` después del respaldo.
- [x] enfermería: el veterinario registra el alta y el sistema avisa al peón sin cambiar la ubicación; el traslado físico queda pendiente hasta que el peón lo registre. La tabla de altas y destinatario de avisos requiere aplicar `backend/migrations/2026-10-22-nursing-discharge.sql` después de las migraciones de registro y movimientos.
- [x] animales: listado, búsqueda, ficha, alta y edición; el dueño puede dar de baja desde la ficha por venta, muerte u otro motivo, con detalle opcional. La baja conserva ficha e historial y retira al animal del inventario activo. Las muertes dadas de baja por el dueño quedan confirmadas en el registro; las informadas por el peón mantienen la revisión administrativa. El tablero cuenta ventas y muertes confirmadas del año.
- [x] borrados del dueño: los registros de servicios reproductivos y nacimientos, las razas y las especies tienen confirmación explícita antes de borrarse permanentemente. Se conserva auditoría del borrado. No se permiten bajas de catálogo con animales asociados; al borrar una especie se borran sus razas sin animales y se desvinculan las propuestas históricas.
- [ ] corrales: dueño configura capacidad y estructura; dueño/administrador editan y dan de baja corrales después de trasladar todos sus animales y resolver dependencias activas; peón registra ocupación operativa y movimientos, sin cambiar estructura/capacidad.
- [ ] equipo: administrador gestiona solicitudes y cuentas, incluida edición y baja lógica; la baja bloquea el acceso y conserva autoría histórica. Dueño consulta usuarios y actividad.
- [ ] campo: registrar servicios de monta, nacimientos con filiación, y reportes de muerte con lugar y fecha; la muerte causa baja operativa inmediata y revisión administrativa pendiente. Confirmar deja el animal fallecido; rechazar lo reactiva y conserva el reporte en la auditoría.
- [ ] reproducción: peón y dueño pueden cargar y editar servicios de monta; el administrador tiene acceso total. Las anulaciones son lógicas y quedan auditadas.
- [x] catálogo: dueño y administrador agregan especies y razas directamente al catálogo de la estancia; el peón propone nuevas entradas y el administrador las aprueba antes de usarlas.
- [ ] completar validaciones de dependencias y auditoría en los demás registros operativos.
- [ ] veterinaria: reportes, tratamientos, evolución y alta sanitaria.
- [ ] historial: movimientos, cambios de estado y responsable de cada acción.

**resultado:** las operaciones principales de R5 quedan completas en la app móvil.

## etapa 5 - notificaciones útiles

- [ ] bandeja de notificaciones dentro de la app, con lectura, filtros y acción relacionada.
- [ ] notificaciones dirigidas por usuario y notificaciones globales por rol.
- [ ] avisos por ingreso a enfermería, tratamientos, capacidad de corral, tareas vencidas y partos próximos.
- [ ] preferencia por tipo de aviso y resumen de no leídas en la navegación.
- [ ] agregar notificaciones push solo cuando la bandeja in-app esté validada.

**resultado:** cada persona recibe avisos accionables sin depender de `alert`.

## etapa 6 - trabajo offline y sincronización

- [x] crear SQLite local y detectar conectividad.
- [x] preparar una cola local de operaciones con identificadores únicos.
- [ ] descargar y actualizar localmente animales, corrales, tratamientos y avisos relevantes.
- [ ] permitir offline pesajes, traslados, reportes sanitarios y notas de tratamiento.
- [ ] sincronizar primero las acciones pendientes y luego los cambios remotos al recuperar señal.
- [ ] mostrar estado, errores y conflictos con modales; nunca descartar un cambio local sin informar.
- [ ] implementar el endpoint idempotente y aplicar la migración de bitácora después del respaldo.

**resultado:** el equipo puede trabajar en el campo sin señal y conservar lo registrado.

## etapa 7 - mejoras adicionales recomendadas

- [ ] pesajes históricos y evolución de peso por animal.
- [ ] reproducción: servicios, diagnósticos, partos, destetes y avisos de fecha probable.
- [ ] lector de QR para abrir rápidamente la ficha de un animal.
- [ ] adjuntar fotos a reportes sanitarios o fichas, con carga diferida cuando no haya conexión.
- [ ] ubicación opcional de un reporte o traslado, solo con permiso explícito del usuario.
- [ ] exportación de reportes de existencias, tratamientos y movimientos.
- [ ] auditoría administrativa: quién cambió un dato, cuándo y desde qué operación.
- [ ] tablero de tareas programadas: vacunación, desparasitación, revisiones y vencimientos.

## prioridades de implementación pendientes

Las casillas abiertas de las etapas siguientes se priorizan así. **Must have** define el producto operativo: la gestión confiable de animales y las funciones necesarias para que cada rol pueda trabajar. **Good to have** agrega consulta y visualización complementaria; se aborda después de cerrar el núcleo.

### Must have — núcleo operativo

- Corregir los problemas de autenticación, renovación e invalidación de sesiones, manejo de errores y arranque del backend señalados en `REVISION_PROYECTO_2026-10-26.md`.
- Completar animales: filtros, historial consultable, pesajes y bajas trazables por muerte o venta, con sus validaciones y auditoría.
- Completar las operaciones relacionadas con animales: movimientos y corrales con dependencias validadas; sanidad y tratamientos; servicios reproductivos, nacimientos y resultados por animal.
- Completar roles, cuentas, tareas y avisos operativos para asignar y seguir el trabajo de campo.
- Hacer confiable la operación sin conexión: caché de datos relevantes, cola conectada a las operaciones, sincronización y resolución de errores/conflictos.
- Completar instalación, migraciones, documentación, validaciones y entrega instalable.

### Good to have — complementos

- **Eventos y remates:** calendario nacional, filtros, importación de fuentes oficiales y fichas ampliadas con animales, lotes y resultados.
- **Mapas:** retirados por decisión de la usuaria; el GPS puntual en reportes de muerte se mantiene.
- Mejoras adicionales de consulta y productividad: QR, fotos, exportaciones, gráficos avanzados, auditoría administrativa ampliada y notificaciones push.

Se prioriza cerrar primero el **Must have**. La usuaria decidió retirar la visualización de mapas y dejar los corrales como registros operativos.

## etapa 7.1 - eventos, remates y exposiciones

- [x] crear una sección `eventos` con calendario mensual, navegación por fechas y filtros por especie, raza y provincia.
- [x] priorizar en la agenda las especies y razas activas de la estancia, con opción para ver todos los eventos de las especies activas del dueño.
- [x] diferenciar visualmente remates y exposiciones; la tarjeta inicial muestra fuente, fecha, especie/raza y ubicación cuando están publicadas.
- [x] incluir provincia y localidad cuando la asociación las publica, para filtrar calendario y planificar traslados.
- [x] programar la lectura semanal de rutas específicas de eventos, calendarios, remates y noticias, y guardar eventos de forma idempotente con bitácora por asociación.
- [ ] vincular cada publicación de remate con uno o más animales de la estancia; incluir fotos, lote, precio base, precio final y resultado de venta.
- [ ] registrar exposiciones con categoría, institución organizadora, ubicación, fechas, animales participantes, premios y archivos asociados.
- [ ] mostrar en la ficha de cada animal una línea de tiempo de participaciones, publicaciones, resultados y reconocimientos.
- [ ] ofrecer el calendario como información externa de solo lectura para todos los roles.
- [ ] mostrar al dueño y administrador los próximos remates y exposiciones relevantes directamente en el dashboard para facilitar la decisión de asistencia.
- [ ] conservar borradores y fotos de eventos offline, enviándolos al recuperar conexión.
- [ ] incorporar enlaces o integraciones externas solo con fuentes oficiales o autorizadas; el proceso automático omite registros incompletos y registra internamente los errores de extracción.
- [x] conservar una lista inicial de asociaciones oficiales argentinas para futuras fuentes de eventos y registros genealógicos.

La agenda requiere ejecutar `backend/migrations/2026-10-26-events-calendar.sql` y `backend/migrations/2026-10-26-event-source-expansion.sql` después del respaldo. El importador reconoce datos estructurados, tablas, tarjetas/listas, fechas en títulos y agendas etiquetadas. Ovinos (Merino, Hampshire Down y Corriedale) y porcinos quedan configurados en espera: solo se muestran cuando el dueño tiene esa especie activa. Hay que verificar la primera sincronización de cada asociación desde el estado que publica la app y adaptar las fuentes si cambian sus páginas.

**resultado:** la app evoluciona de registro de datos a una herramienta diaria de gestión de campo.

## etapa 7.2 - mapas del campo (retirados)

La usuaria decidió retirar los mapas y dejar los corrales como registros sin representación geográfica. Se quitaron la pantalla y los endpoints de mapas. Las columnas de coordenadas que pudieran existir por migraciones anteriores se conservan sin uso para no borrar datos existentes. Se mantiene el punto GPS puntual obligatorio en los reportes de muerte; no se rastrean animales ni personas.

## etapa 8 - pruebas y entrega

- [ ] pruebas de permisos, validaciones, sincronización y conflictos.
- [ ] pruebas en Expo Go con y sin conexión.
- [ ] documentación de API, instalación, base de datos y manual de usuario.
- [ ] configuración segura de Aiven y variables productivas.
- [ ] generación y validación del APK de Android.

**resultado:** entrega demostrable, documentada y lista para instalar.
