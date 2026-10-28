# Revisión de EstanciaApp — 26 de octubre de 2026

## Alcance y resultado

Revisión del código frontend/backend, contraste con `REQUERIMIENTOS_PROYECTO.md` y comprobaciones de lectura sobre la base configurada. No se modificaron registros ni se corrigió código durante esta revisión.

La compilación TypeScript de frontend y backend y el lint del frontend pasan. Eso no alcanza para considerar completos los flujos: se reprodujeron fallos de autenticación y de puesta en marcha que estas comprobaciones no detectan.

## Errores prioritarios

### 1. P1 — Un permiso de recuperación sirve también como acceso autenticado

- **Comprobado con una prueba aislada:** un token emitido por `createPasswordRecoveryToken` pasa la validación de `verifyAccessToken`.
- La recuperación usa la misma clave que el acceso. El verificador de acceso solo comprueba la firma y el vencimiento; no rechaza el propósito `password-recovery`.
- Un permiso cuyo alcance debería limitarse a cambiar la contraseña puede presentarse ante rutas protegidas como una sesión. Los controles de rol posteriores siguen aplicándose al usuario de ese token.
- **Corrección necesaria:** distinguir y validar el tipo de token en ambos sentidos; limitar el token de recuperación exclusivamente al flujo de recuperación.
- Referencia: [jwt.ts](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/src/utils/jwt.ts:23>).

### 2. P1 — La renovación de una sesión válida falla

- **Comprobado con una prueba aislada:** `refresh(createRefreshToken(usuarioDePrueba))` arroja un error de `expiresIn`.
- Se vuelve a firmar todo el JWT decodificado, que ya contiene `exp`, pasando a la vez la opción `expiresIn`.
- El frontend atrapa el error y conserva la sesión anterior. Además, solo intenta renovarla al restaurar la app, sin renovación posterior ni reintento de peticiones tras un 401. La configuración revisada da al acceso una duración de 8 horas.
- **Corrección necesaria:** emitir tokens desde campos permitidos del usuario, renovar durante el uso y distinguir una caída de red de una sesión realmente inválida.
- Referencias: [authService.ts](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/src/services/authService.ts:188>), [SessionContext.tsx](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/frontend/src/context/SessionContext.tsx:14>).

### 3. P1 — Cambiar la contraseña no invalida las sesiones anteriores

- **Detectado en el código:** cambiar o recuperar la contraseña incrementa `token_version`, pero los tokens normales no incorporan esa versión y la autenticación no la comprueba contra la base.
- Por lo tanto, los accesos emitidos previamente siguen siendo aceptados hasta vencer. El bloqueo por cuenta inactiva sí existe en las rutas productivas que usan `requireRoles`.
- **Corrección necesaria:** aplicar la versión de sesión a los tokens de acceso y renovación y comprobarla en el servidor.
- Referencias: [authService.ts](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/src/services/authService.ts:178>), [authMiddleware.ts](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/src/middleware/authMiddleware.ts:6>).

### 4. P2 — Una caída de conexión puede escapar al manejo de errores

- **Comprobado simulando una falla, sin escrituras:** `createAnimal` rechaza la promesa sin enviar una respuesta HTTP cuando falla `getConnection()`.
- Esa adquisición ocurre antes del `try`; el patrón también aparece en pesajes, reportes, nacimientos y operaciones de catálogo. La aplicación usa Express 4 y no tiene un envoltorio general de controladores asíncronos.
- Puede dejar una petición sin respuesta y producir un rechazo no manejado, con riesgo de detener el proceso.
- **Corrección necesaria:** incluir la conexión dentro del manejo de errores, liberar recursos y devolver respuestas controladas; añadir manejo central de errores asíncronos.
- Referencias: [livestockController.ts](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/src/controllers/livestockController.ts:71>), [fieldController.ts](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/src/controllers/fieldController.ts:25>).

### 5. P2 — El arranque de producción no funciona

- **Comprobado ejecutando los comandos:** `npm run build` termina correctamente, pero ejecuta `tsc --noEmit`. Luego `npm start` falla con `MODULE_NOT_FOUND` para `dist/server.js`.
- **Corrección necesaria:** separar la comprobación de tipos del build que genera JavaScript, y verificar el arranque con los archivos resultantes.
- Referencia: [package.json](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/package.json:6>).

### 6. P2 — Se pueden registrar montas con animales inactivos

- **Detectado en el código:** el alta de un servicio valida los datos recibidos e inserta directamente. No consulta si madre y padre continúan activos. Las claves foráneas solo garantizan que los identificadores existan.
- Contradice la regla de impedir servicios después de una baja operativa. También falta comprobar que los progenitores no sean el mismo animal.
- **Corrección necesaria:** validar los progenitores y su estado en una transacción antes de guardar.
- Referencia: [modulesController.ts](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/src/controllers/modulesController.ts:75>).

### 7. P2 — El indicador de hembras preñadas no puede reflejar datos reales

- **Comprobado contrastando consulta y esquema real:** el dashboard cuenta `estado_salud IN ('preñada','prenada')`, pero la columna solo admite `sano`, `enfermo`, `herido` y `en_tratamiento`.
- No existe un registro de diagnóstico de preñez que alimente este indicador.
- **Corrección necesaria:** modelar el estado reproductivo y consultar ese dato, separado del estado sanitario.
- Referencia: [fieldController.ts](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/src/controllers/fieldController.ts:14>).

### 8. P2 — Sanidad muestra funciones distintas según la ruta

- **Detectado en la navegación:** `/health` muestra al administrador únicamente revisión de muertes; la ruta dinámica `/sanidad` muestra enfermería. Para un peón, esta última monta una pantalla cuyo endpoint no le permite consultar.
- El menú normal del administrador no ofrece una entrada diferenciada para gestionar enfermería y reportes sanitarios, aunque el backend le otorga permisos sobre esas operaciones.
- **Corrección necesaria:** unificar la resolución del módulo y ofrecer las funciones disponibles para cada rol desde la navegación normal.
- Referencia: [Screens.tsx](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/frontend/src/components/app/Screens.tsx:301>).

### 9. P2 — Las bajas no resuelven todas sus dependencias

- **Detectado en el código:** la baja de un usuario no comprueba ni reasigna tareas pendientes. La baja de un corral solo comprueba animales activos, sin revisar otras dependencias operativas.
- La revisión de una muerte conserva el reporte y la baja, pero no establece un estado explícito de fallecido; el rechazo usa un motivo fijo desde la interfaz, sin pedir una explicación al administrador.
- **Corrección necesaria:** completar las reglas de dependencias, motivo, confirmación y auditoría definidas en los requisitos.
- Referencias: [organizationController.ts](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/src/controllers/organizationController.ts:31>), [fieldController.ts](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/src/controllers/fieldController.ts:65>).

### 10. P2 — El versionado de animales no cubre todos los cambios

- **Detectado en el código:** la edición de la ficha comprueba e incrementa `version_dato`, pero el traslado y el alta sanitaria modifican el animal sin incrementarlo. Esos cambios quedan fuera del control de conflictos declarado por el proyecto.
- **Corrección necesaria:** aplicar una política uniforme de versión a cada escritura sobre el animal y mostrar el conflicto al cliente.
- Referencia: [livestockController.ts](<C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/backend/src/controllers/livestockController.ts:199>).

## Funciones que faltan o están parciales

| Módulo | Lo que existe | Lo que falta para completar los requisitos |
| --- | --- | --- |
| Animales | Listado, búsqueda, consulta de inactivos, alta, edición, pesaje y traslado | Venta con fecha/comprador/precio, historial consultable y estadísticas de cría por animal |
| Corrales | Listado con ocupación, alta, edición y baja con control de animales activos | Validaciones completas de dependencias y auditoría de cambios/bajas |
| Veterinaria | Listado de enfermería y alta médica con aviso al peón | Alta/edición/baja de tratamientos, medicación, controles, evolución e historial clínico |
| Reproducción | Listado, alta de montas y nacimientos con progenitores | Edición/anulación de servicios y nacimientos, diagnósticos de preñez y resultados por animal |
| Tareas | Alta por administrador, consulta y cambio de estado | Edición completa, reasignación y auditoría; avisos de vencimiento |
| Mapas de la estancia | Módulo retirado por decisión de la usuaria; corrales sin mapa ni perímetros | Las columnas antiguas de coordenadas permanecen sin uso para conservar compatibilidad; el punto GPS puntual en reportes de muerte continúa |
| Eventos | Calendario desde hoy, lista de próximos eventos y fichas con enlace de origen; rutas diferenciadas por asociación para calendarios, remates y novedades; 16 asociaciones configuradas | Aplicar migraciones de fuentes y comprobar la sincronización real de cada página; agregar vínculos a animales/lotes y resultados de remates |
| Avisos | Listado y algunas acciones por tipo | Marcar leído/no leído, filtros, contador y preferencias. El buscador visible no actualiza ni filtra porque recibe un manejador vacío |
| Equipo | Solicitudes, aprobación/rechazo, edición de cuentas y roles, baja lógica | Reasignación de dependencias y actividad/auditoría consultable |
| Offline | Tablas SQLite y funciones de caché/cola | Ninguna operación de campo llama a la cola/caché. Falta sincronizador y endpoint idempotente; la web solo tiene una inicialización vacía |
| Instalación y entrega | Variables de ejemplo, scripts de desarrollo y migraciones operativas | Instalación integral desde base limpia, primera cuenta administrativa, historial de migraciones, documentación completa de endpoints, manual de usuario y guía/configuración de APK |

El comando `db:migrate` actual aplica solo las tres migraciones operativas revisadas; no instala por sí solo las migraciones de registro, recuperación de contraseña ni perfil. Una instalación nueva todavía requiere esos pasos.

## Estado comprobado de la base y las consultas

Se ejecutaron los controladores de lectura reales con peticiones de prueba y respuestas capturadas, usando la base configurada. Esto comprueba sus consultas y respuestas, no equivale a haber probado cada flujo autenticado desde el navegador.

| Consulta | Resultado |
| --- | --- |
| Animales activos | 200; 0 registros |
| Animales incluyendo inactivos | 200; 2 registros |
| Corrales | 200; 6 registros |
| Enfermería | 200; 0 registros |
| Avisos | 200; 0 registros |
| Dashboard | 200; indicadores en cero, con la limitación de preñez indicada arriba |
| Muertes pendientes | 200; 0 registros |
| Tareas | 200; 0 registros |
| Reproducción | 200; 0 servicios y 0 nacimientos |
| Eventos | 200; 0 registros |
| Equipo | 200; 6 cuentas |
| Catálogo | 200; 3 especies y 4 razas |
| Solicitudes de acceso pendientes | 200; 0 registros |

Los dos animales existentes están inactivos. No se reactivaron ni se cargaron datos de ejemplo para llenar los módulos.

## Calidad y verificaciones pendientes

- TypeScript frontend/backend y lint frontend: aprobados; lint terminó sin errores ni advertencias tras retirar código sin uso y corregir las dos advertencias de sincronización offline.
- `npm start` del backend: el proceso compilado alcanza `listen`, pero esta revisión no pudo iniciarlo en el puerto configurado 3010 porque ya estaba ocupado (`EADDRINUSE`). No se detuvo el proceso que lo ocupa. La consulta local a `/api/health` no pudo verificarse por las restricciones de socket del entorno; queda pendiente confirmar qué proceso usa ese puerto y validar salud desde un entorno con acceso local.
- SMTP y los tres proveedores sociales tienen variables configuradas, pero no se comprobó una entrega de correo ni un flujo OAuth real.
- Falta probar las escrituras completas con cuentas de los cuatro roles en una base de pruebas: altas, movimientos, tratamientos cuando existan, muerte y rechazo, asignación de tareas y conflictos simultáneos.
- Falta una comprobación visual del login y la navegación en tamaños de escritorio y teléfono. La compilación no demuestra que el diseño entre sin scroll.
- Hay seis archivos de frontend que superan el límite de 400 líneas de los requisitos: `index.tsx` (593), `FieldModuleScreens.tsx` (741), `LivestockScreens.tsx` (1568), `OrganizationScreens.tsx` (761), `OwnerDesktopShell.tsx` (772) y `Screens.tsx` (1307), según el estado actual. La división en componentes más pequeños sigue pendiente; debe hacerse por partes, conservando interfaces y comportamiento.
- No se encontró una suite de pruebas propia que cubra los flujos ni una especificación OpenAPI/Swagger. La documentación de planificación tiene casillas desactualizadas respecto del código.

## Orden propuesto

### Must have — resolver antes de ampliar módulos

1. Corregir alcance de tokens, renovación e invalidación de sesiones.
2. Controlar fallas de conexión y completar el arranque y las migraciones de instalación.
3. Validar estados de animales, sanidad por rol, bajas, dependencias y versionado.
4. Completar las funciones de animales: veterinaria, reproducción, ventas e historiales.
5. Conectar caché, cola offline y sincronización idempotente; completar avisos operativos y documentación esencial.
6. Validar la experiencia en móvil y escritorio y preparar el APK.

### Good to have — después del núcleo operativo

1. Completar eventos: validar el importador por asociación y sumar fichas, enlaces a animales/lotes y resultados.
2. Resolver las funciones pendientes del núcleo operativo y la sincronización offline.

## Seguimiento de correcciones — 26 de octubre de 2026

Después de esta revisión se corrigieron o avanzaron estos puntos en el código:

- Los tokens de acceso y recuperación ya validan su propósito; la versión de sesión se incorpora y se comprueba en el backend; la renovación se programa antes del vencimiento y reintenta ante errores temporales.
- El backend ya compila a `dist`, tiene manejo central de rechazos asíncronos y el migrador registra las migraciones aplicadas. Se incorporaron las migraciones aditivas de registro, perfil y recuperación al migrador; el cambio de rol y la limpieza de datos siguen manuales.
- La edición y baja de corrales quedan auditadas y transaccionales; la baja de usuarios puede reasignar tareas abiertas y conserva auditoría.
- Se corrigió el cálculo del indicador de preñez, se validan sexo/especie/actividad de los progenitores en montas y nacimientos, y el administrador ahora puede alternar entre revisión de muertes y enfermería.
- El motivo de rechazo de una muerte se solicita en pantalla. La lectura de animales, corrales y enfermería usa caché local para recuperarse de falta de conexión.
- Se retiró el mapa de corrales y la edición visual de perímetros. Se amplió el importador semanal de eventos con páginas específicas y extractores de tarjetas, tablas, títulos y agenda etiquetada. Las fuentes ovinas y porcinas quedan ocultas hasta que el dueño active esas especies; las migraciones de agenda y expansión de fuentes requieren respaldo previo.

La primera propuesta de sincronización fue detenida por la revisión automática. La usuaria aclaró que las muertes offline deben conservar exactamente el flujo vigente: baja operativa inmediata y reporte pendiente de revisión administrativa, con reactivación al rechazar. Con esa regla se incorporó un endpoint idempotente que aplica pesajes, traslados, reportes sanitarios, muertes y notas veterinarias en transacciones individuales. La app conserva cambios rechazados en la cola, muestra el número pendiente y reintenta cuando vuelve la conexión. También se retiró código de dashboard sin uso, sin afectar las rutas compartidas por perfil y módulos.

No se ejecutaron migraciones contra una base ni se hicieron escrituras productivas. Falta validar estos flujos con una base de pruebas y completar la entrega: están pendientes el identificador Android definitivo, el APK publicado por EAS, el respaldo/migración en la base acordada, el volcado solo de esquema para instalación vacía, el repositorio Git y varias funciones del núcleo descritas en la sección de pendientes.
