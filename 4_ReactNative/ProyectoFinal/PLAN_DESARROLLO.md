# plan de desarrollo de estanciaapp móvil

## criterio de diseño

La app conserva la identidad visual de R5: imagen de campo en acceso, paleta verde, superficies claras, tarjetas, métricas y navegación ordenada. En móvil, la barra lateral se convierte en una navegación inferior y los módulos usan pantallas táctiles simples. Los modales, avisos y confirmaciones siguen el estilo visual de R5 y reemplazan por completo a `alert`.

La complejidad vive en el backend, las reglas por rol, la sincronización y los servicios automáticos; no en la interfaz. La navegación se organiza en un panel lateral plegable, similar al de R5, con iconos, etiquetas breves y grupos discretos. Las secciones previstas son inicio, animales, corrales, tareas, sanidad, reproducción, mapa, eventos, avisos, equipo y perfil. Las opciones avanzadas solo aparecen para el rol que las necesita.

## etapa 0 - preparación y protección de datos

- [x] separar `frontend` Expo y `backend` Express con TypeScript.
- [x] definir configuración por entorno y eliminar valores sensibles del código.
- [x] conservar `estancia_app` como fuente de datos existente.
- [ ] crear una copia de respaldo en HeidiSQL antes de aplicar una migración.
- [ ] registrar qué migraciones se aplican a la base y en qué fecha.

**resultado:** se puede desarrollar sin recrear ni perder la base actual.

## etapa 1 - acceso y sesión

- [ ] reutilizar el diseño de login de R5 en React Native: imagen, marca, campos, visibilidad de contraseña y recordar sesión.
- [ ] crear un proveedor global de sesión, tema y mensajes visuales.
- [ ] completar inicio de sesión, perfil actual, renovación de token y cierre de sesión.
- [ ] sumar registro, verificación de correo, recuperación de contraseña y código de acceso inicial inspirados en RN_1.
- [ ] implementar permisos para dueño, copropietario, peón y veterinario.
- [ ] incorporar proveedores sociales solo después de configurar las credenciales en el backend.

**resultado:** cada persona accede de forma segura y ve solamente lo permitido por su rol.

## etapa 2 - sistema visual y navegación

- [ ] crear componentes reutilizables: botón, campo, tarjeta, modal, toast, encabezado y estado vacío.
- [ ] traducir la barra lateral de R5 a navegación inferior y menú contextual para móvil.
- [ ] agregar modo claro y oscuro persistente.
- [ ] mostrar una acción flotante para volver arriba en listados extensos.
- [ ] verificar accesibilidad: tamaños táctiles, etiquetas, contraste y teclado.

**resultado:** todas las pantallas mantienen la misma interfaz visual de R5 y son cómodas en teléfonos.

## etapa 3 - dashboard por rol

- [ ] dueño y copropietario: total de animales, ocupación de corrales, alertas sanitarias, tratamientos activos y accesos rápidos.
- [ ] peón: tareas de campo, animales asignados, traslados pendientes y reportes sanitarios.
- [ ] veterinario: enfermería, tratamientos a controlar, altas pendientes e historial clínico.
- [ ] incluir métricas, gráficos simples y estados vacíos útiles.

**resultado:** la primera pantalla prioriza las decisiones reales de cada rol.

## etapa 4 - operación ganadera

- [ ] animales: listado, búsqueda, filtros, ficha, alta, edición y baja lógica.
- [ ] corrales: capacidad, ocupación, enfermería y movimiento de animales.
- [ ] equipo: administración de usuarios y permisos para dueño y copropietario.
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

## etapa 7.1 - eventos, remates y exposiciones

- [ ] crear una sección `eventos` con calendario nacional, listado y filtros por fecha, tipo, especie, raza, provincia y ubicación.
- [ ] organizar el calendario en vistas por especie y raza: bovinos, equinos y las razas que correspondan a cada una.
- [ ] diferenciar visualmente remates y exposiciones, con una ficha completa para cada evento nacional.
- [ ] incluir provincia y localidad en cada evento para filtrar el calendario y facilitar la planificación de traslados.
- [ ] importar automáticamente remates y exposiciones desde fuentes oficiales configuradas, sin carga ni validación manual por parte de los usuarios.
- [ ] vincular cada publicación de remate con uno o más animales de la estancia; incluir fotos, lote, precio base, precio final y resultado de venta.
- [ ] registrar exposiciones con categoría, institución organizadora, ubicación, fechas, animales participantes, premios y archivos asociados.
- [ ] mostrar en la ficha de cada animal una línea de tiempo de participaciones, publicaciones, resultados y reconocimientos.
- [ ] ofrecer el calendario como información externa de solo lectura para todos los roles.
- [ ] mostrar al dueño y copropietario los próximos remates y exposiciones relevantes directamente en el dashboard para facilitar la decisión de asistencia.
- [ ] conservar borradores y fotos de eventos offline, enviándolos al recuperar conexión.
- [ ] incorporar enlaces o integraciones externas solo con fuentes oficiales o autorizadas; el proceso automático omite registros incompletos y registra internamente los errores de extracción.
- [x] conservar una lista inicial de asociaciones oficiales argentinas para futuras fuentes de eventos y registros genealógicos.

**resultado:** la app evoluciona de registro de datos a una herramienta diaria de gestión de campo.

## etapa 7.2 - mapa y visualización del campo

- [ ] crear una vista `mapa del campo` con la ubicación de cada establecimiento, potrero y corral.
- [ ] representar corrales y potreros como áreas coloreadas; el color muestra ocupación, capacidad, estado sanitario o tareas pendientes.
- [ ] abrir cada área del mapa para consultar animales, ocupación, alertas, tratamientos y últimos movimientos.
- [ ] usar una vista geográfica tipo google maps como única representación del campo; cada establecimiento, potrero y corral requiere coordenadas o límites geográficos reales.
- [ ] guardar localmente las coordenadas, límites y capas operativas; el mapa base satelital o de calles requiere conexión.
- [ ] incorporar gráficos de ocupación por corral, distribución por raza, evolución de peso, tratamientos y movimientos mensuales.
- [ ] registrar posición individual de animales solo si existe un dispositivo GPS o si un usuario la informa explícitamente; no se inventan ubicaciones individuales.

## etapa 8 - pruebas y entrega

- [ ] pruebas de permisos, validaciones, sincronización y conflictos.
- [ ] pruebas en Expo Go con y sin conexión.
- [ ] documentación de API, instalación, base de datos y manual de usuario.
- [ ] configuración segura de Aiven y variables productivas.
- [ ] generación y validación del APK de Android.

**resultado:** entrega demostrable, documentada y lista para instalar.
