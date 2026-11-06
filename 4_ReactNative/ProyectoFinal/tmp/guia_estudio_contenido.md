# EstanciaApp guía para ubicar y explicar el código

Guía de estudio para la defensa del proyecto de React Native

Esta guía relaciona lo que el profesor puede señalar en la app con el archivo y la función que lo implementan. Explica la pantalla, el recorrido de los datos y las reglas ganaderas que se aplican en el servidor. Está basada en la lectura del código local del 4 de noviembre de 2026; no certifica que los servicios externos o la base desplegada estén funcionando.

Cómo usarla: buscá primero el elemento visible en el índice rápido. Después leé su explicación y abrí las referencias de código. Cada referencia indica una ruta desde la carpeta ProyectoFinal, una línea y un texto o función para buscar con Ctrl+F. Las líneas pueden cambiar cuando se edita el proyecto; el nombre de la función es la referencia más estable.

La idea central para el examen es seguir este recorrido: pantalla → función que responde al botón → servicio de la app → ruta de la API → controlador o servicio del servidor → base de datos. Algunas operaciones de campo pasan antes por una cola local de sincronización.

## Recorrido sugerido de estudio

- Primero: arquitectura, navegación, login y permisos.
- Después: gráfico y estadísticas, ficha animal, corrales y sanidad.
- Con más atención: monta, gestación, nacimiento, bajas y sincronización sin señal.
- Al final: calendario, notificaciones, perfil y preguntas de práctica.

## Contenido

1. Cómo se organiza el proyecto
2. Índice rápido de elementos visibles
3. Navegación y estructura de las pantallas
4. Login con correo y sesión
5. Login social
6. Solicitud de acceso y recuperación
7. Gráfico de animales y estadísticas
8. Inventario y ficha de animales
9. Corrales y movimientos
10. Enfermería y alta veterinaria
11. Muertes y otras bajas
12. Servicios de monta y nacimientos
13. Cálculo de gestación y recordatorios
14. Tareas y equipo
15. Especies y razas
16. Eventos y remates
17. Notificaciones y trabajo sin señal
18. Perfil y apariencia
19. Servidor y base de datos
20. Preguntas de defensa y diferencias a recordar

---PAGE---
# 1 Cómo se organiza el proyecto

EstanciaApp administra animales, corrales, sanidad, reproducción y trabajo de una estancia. Tiene dos partes principales. El frontend es la app hecha con React Native y Expo, que también tiene una presentación web. El backend es un servidor Express escrito en TypeScript que consulta una base compatible con MySQL o MariaDB mediante mysql2.

## Qué responsabilidad tiene cada carpeta

- frontend/src/app: las rutas de navegación. Muchos archivos solo conectan una dirección con una pantalla.
- frontend/src/components/app: la implementación de las pantallas de trabajo y sus formularios. Acá se encuentra la mayor parte de lo que se ve después del login.
- frontend/src/components: elementos de acceso y componentes reutilizables, como el botón social, los modales y el logo.
- frontend/src/context: información compartida por toda la app, principalmente sesión y tema visual.
- frontend/src/services: pedidos a la API, almacenamiento de sesión, caché y sincronización.
- backend/src/routes: direcciones de la API y permisos de cada operación.
- backend/src/controllers: validaciones, consultas SQL y reglas productivas.
- backend/src/services: lógica de autenticación, registro, correo e importación de eventos.
- backend/migrations: cambios de estructura de la base de datos.

## Un ejemplo completo

Al entrar a Inicio, la ruta home.tsx muestra HomeScreen. Esa pantalla llama a getDashboard para pedir estadísticas y a listAnimals para obtener los animales. Los servicios agregan el token de sesión y consultan la API. Express recibe la consulta, comprueba permisos y ejecuta SQL. La respuesta vuelve como JSON; React guarda los datos en estado y vuelve a dibujar la pantalla.

No todo se calcula en el mismo lugar. El conteo por especie del gráfico se arma en el frontend. Los indicadores de producción se consultan en SQL. La fecha estimada de nacimiento se calcula en el backend.

## Archivos que pueden confundir

El package.json del frontend declara expo-router/entry como entrada. frontend/App.tsx devuelve null y no contiene la app principal. frontend/index.ts conserva un registro de App, pero la entrada declarada es la del router. Los archivos Screens.tsx, LivestockScreens.tsx, FieldModuleScreens.tsx y OrganizationScreens.tsx reúnen exportaciones: hay que seguirlas hasta el archivo especializado.

@frontend/package.json|expo-router/entry
@frontend/src/app/_layout.tsx|function RootLayout
@frontend/src/components/app/Screens.tsx|HomeScreen
@backend/src/app.ts|export const app

---PAGE---
# 2 Índice rápido de elementos visibles

Las rutas de esta página son atajos desde frontend/src, salvo donde se indique backend. En las secciones siguientes están las funciones, las líneas y el recorrido completo.

| Si el profesor señala | Abrí primero |
|---|---|
| Formulario de ingreso y fondo de campo | app/index.tsx y app/LoginStyles.tsx |
| Iconos Google Facebook GitHub | components/SocialLoginButton.tsx |
| Solicitar acceso y verificar correo | components/AccountRequestModal.tsx |
| Activar cuenta aprobada | components/AccountActivationModal.tsx |
| Recuperar contraseña | components/PasswordRecoveryModal.tsx |
| Menú lateral o menú del teléfono | components/app/OwnerDesktopShell.tsx |
| Gráfico Animales por especie | components/app/Screens.dashboard.tsx y Screens.shared.tsx |
| Tarjetas de producción | components/app/Screens.dashboard.tsx |
| Buscador y fichas de animales | components/app/LivestockScreens.animals.tsx |
| Agregar animal | components/app/AnimalCreateModal.tsx |
| Pesar | components/app/AnimalWeightModal.tsx |
| Mover y reportar enfermedad o muerte | components/app/LivestockScreens.animals.tsx |
| Mi estancia y corrales | components/app/EstateScreen.tsx y LivestockScreens.corrals.tsx |
| Enfermería tratamientos e historial clínico | components/app/LivestockScreens.nursing.tsx |
| Confirmar o rechazar muertes | components/app/Screens.health.tsx |
| Registrar servicio de monta | components/app/MatingServiceForm.tsx |
| Registrar nacimiento | components/app/BirthForm.tsx |
| Preñez confirmada y fecha estimada | components/app/FieldModuleScreens.reproduction.tsx |
| Fórmula de gestación | backend/src/controllers/modulesController.ts |
| Tareas y estados | components/app/FieldModuleScreens.tasks.tsx |
| Equipo y edición de usuarios | components/app/OrganizationScreens.team.tsx |
| Solicitudes pendientes de ingreso | components/app/Screens.other.tsx |
| Especies razas y solicitudes | components/app/OrganizationScreens.catalog.tsx |
| Calendario y filtros de remates | components/app/EventsScreen.tsx |
| Campana de notificaciones | components/app/NotificationBell.tsx |
| Aviso de operaciones pendientes | components/app/OfflineSyncBanner.tsx |
| Mi perfil y cerrar sesión | components/app/Screens.profile.tsx |
| Modo claro y oscuro | context/ThemeContext.tsx y components/ThemeToggle.tsx |

Para ubicar el comportamiento de un botón, buscá su texto visible y leé su onPress. Si allí solo cambia un estado como setViewing o setMoving, ese estado abre un modal dentro del mismo archivo. Después buscá la función que confirma el formulario.

---PAGE---
# 3 Navegación y estructura de las pantallas

## Dónde nace la navegación

RootLayout envuelve la app con SessionProvider, ThemeProvider y SafeAreaProvider. Así las pantallas acceden a la sesión, los colores y las áreas seguras del teléfono. AppNavigation define la pila principal y oculta el encabezado automático del router.

@frontend/src/app/_layout.tsx|function RootLayout

El layout dentro de (app) exige una sesión. Mientras se restaura muestra BrandLoadingScreen; sin sesión redirige al login. Declara las rutas internas con Tabs, pero su barra automática está oculta. La navegación visible la construye OwnerDesktopShell.

@frontend/src/app/(app)/_layout.tsx|function AppTabs
@frontend/src/components/app/OwnerDesktopShell.tsx|const sections
@frontend/src/components/app/OwnerDesktopShell.tsx|function navigate

## Cómo encuentra cada pantalla

Las rutas home, animals, estate, corrals, tasks, health, events, team y more están en frontend/src/app/(app). Reproducción y catálogo también se resuelven mediante [module].tsx y GenericModuleScreen, que lee el parámetro module.

@frontend/src/components/app/Screens.other.tsx|function GenericModuleScreen

GenericModuleScreen relaciona claves como reproduccion, catalogo o sanidad con componentes concretos. También comprueba si el módulo está habilitado para el rol. La lista modules de Screens.shared.tsx describe los módulos; sections de OwnerDesktopShell.tsx construye el menú visible. Son dos listas distintas que conviene reconocer.

## Menú del teléfono y vista de escritorio

OwnerDesktopShell calcula isDesktop cuando la plataforma es web y el ancho es al menos 860. En el teléfono usa encabezado y menú desplegable en un Modal. En escritorio muestra una estructura lateral. sections contiene nombres, iconos, categorías y roles; navigate decide la ruta al pulsar una entrada.

Page, Header, InventoryPage y Frame son contenedores compartidos. Page incorpora desplazamiento y el botón para volver arriba; Header muestra título, subtítulo, conexión y avatar. InventoryPage agrega buscador, cantidad, carga y actualización de inventarios.

@frontend/src/components/app/Screens.shared.tsx|function Page
@frontend/src/components/app/Screens.shared.tsx|function Header
@frontend/src/components/app/LivestockScreens.shared.tsx|function InventoryPage

Respuesta para practicar: “La dirección está en app, pero el contenido está en components/app. El menú se arma en OwnerDesktopShell y la sesión se controla en el layout protegido”.

---PAGE---
# 4 Login con correo y sesión

## Qué archivo muestra el formulario

LoginScreen contiene correo, contraseña, ojo para mostrarla, casilla Mantener sesión iniciada, botón Ingresar y mensajes de error. También abre los tres modales de solicitud, activación y recuperación. Las imágenes de fondo elegidas allí son login-bg-angus.png y login-bg-angus-wide.png.

@frontend/src/app/index.tsx|function LoginScreen
@frontend/src/app/index.tsx|async function submit

submit normaliza el correo, valida su formato y comprueba que haya contraseña. Llama a login del servicio. Si se marcó remember, guarda la sesión; si no, elimina una sesión persistida anterior. En ambos casos setSession deja al usuario autenticado en memoria. Con sesión, la pantalla redirige a Inicio.

## Recorrido hasta la base

authApi.login envía POST /api/auth/login. authRoutes deriva al controlador authController.login; el servicio authService.login busca un usuario activo con estado_cuenta activo y compara la contraseña con bcrypt.compare. Devuelve el perfil, un token de acceso, un token de renovación y el vencimiento del primero.

@frontend/src/services/authApi.ts|export async function login
@backend/src/routes/authRoutes.ts|'/login'
@backend/src/services/authService.ts|export async function login
@backend/src/utils/jwt.ts|createAccessToken

El token de acceso identifica al usuario en los pedidos protegidos. El de renovación permite pedir una sesión actualizada sin volver a ingresar la contraseña. El backend firma y verifica estos tokens con las funciones de jwt.ts.

## Mantener sesión y renovar

sessionStorage usa SecureStore en móvil y localStorage en web. SessionProvider restaura lo guardado, intenta renovarlo y programa renovaciones antes del vencimiento. Si la renovación responde 401 elimina la sesión; ante ciertos problemas de red conserva la guardada o reintenta. Esto no significa que pueda hacerse un login nuevo sin internet.

@frontend/src/services/sessionStorage.ts|function saveSession
@frontend/src/context/SessionContext.tsx|function SessionProvider

No confundir: setSession comparte la sesión en la app que está abierta; saveSession la conserva entre aperturas. El indicador Sin conexión del login viene de NetInfo y avisa que para ingresar se necesita internet.

---PAGE---
# 5 Login social

La pantalla de ingreso muestra tres instancias de SocialLoginButton: Google, Facebook y GitHub. Cambiar el icono no implementa la autenticación; el componente y el servidor realizan el intercambio con el proveedor.

@frontend/src/components/SocialLoginButton.tsx|const config
@frontend/src/components/SocialLoginButton.tsx|async function start

## Recorrido del botón hasta la sesión

1. El componente elige proveedor, identificador público, permisos solicitados y dirección de autorización.
2. expo-auth-session prepara la solicitud. Se usa un state aleatorio para verificar que la respuesta corresponda al intento iniciado. Google y GitHub usan PKCE; Facebook tiene usePKCE desactivado.
3. start abre el flujo del proveedor. Sustituye redirect_uri por el callback HTTPS del backend para ese proveedor.
4. El callback del servidor devuelve el resultado a la web o al enlace profundo de la app. El componente valida state y obtiene un código de autorización.
5. authApi.socialLogin envía ese código al backend, junto con redirectUri, clientId y, cuando corresponde, codeVerifier.
6. authService.loginWithSocial intercambia el código, comprueba identidad y correo y busca una cuenta local activa. Recién entonces genera la sesión de EstanciaApp.

@frontend/src/services/authApi.ts|function socialLogin
@backend/src/controllers/authController.ts|socialOAuthCallback
@backend/src/services/authService.ts|function loginWithSocial
@frontend/src/app/oauth/callback.tsx|function OAuthCallbackRoute

## Qué verifica cada proveedor

Google: valida el ID token y su audiencia con google-auth-library y exige correo verificado. Facebook: comprueba el token con debug_token y consulta el perfil. GitHub: consulta perfil y correos, y elige el correo principal verificado.

Los proveedores no crean automáticamente una cuenta habilitada en la estancia. El correo debe coincidir con un usuario local activo y aprobado. La contraseña social no se manda a EstanciaApp: el servidor recibe un código para verificar la identidad con el proveedor.

## Dónde se configura

El componente lee identificadores públicos desde variables EXPO_PUBLIC y extra.socialAuth. frontend/app.config.ts participa en la configuración de Expo; backend/src/config/env.ts reúne la configuración del servidor. Los secretos de proveedor corresponden al backend. La presencia de los botones no prueba que estén configurados en un despliegue particular. El propio componente bloquea este flujo en Expo Go móvil e indica usar una compilación de desarrollo.

---PAGE---
# 6 Solicitud de acceso y recuperación

## Solicitar una cuenta no es habilitarla

AccountRequestModal reúne los datos personales, correo y contraseña y conduce la verificación de correo. authApi expone requestAccount, verifyAccountEmail y resendAccountCode. authController delega el trabajo en registrationService.

@frontend/src/components/AccountRequestModal.tsx|export function
@frontend/src/services/authApi.ts|function requestAccount
@backend/src/services/registrationService.ts|function createRegistrationRequest
@backend/src/services/registrationService.ts|function verifyRegistrationEmail

El recorrido es solicitud → verificación del correo → aprobación administrativa → código de acceso → activación. Los registros de solicitud, los códigos de verificación y los códigos de acceso tienen responsabilidades distintas. registrationCodeService emite códigos y calcula resúmenes HMAC; emailService se encarga del envío por los mecanismos configurados.

## Dónde se aprueba

AdminRequestsScreen muestra solicitudes y deja elegir un rol antes de aprobar o rechazar. adminApi llama a las rutas administrativas, adminController recibe el pedido y registrationService aplica la decisión. TeamModuleScreen y GenericModuleScreen muestran esta vista al administrador en Equipo.

@frontend/src/components/app/Screens.other.tsx|function AdminRequestsScreen
@backend/src/services/registrationService.ts|function approveRegistrationRequest
@backend/src/services/registrationService.ts|function redeemAccessCode
@frontend/src/components/AccountActivationModal.tsx|export function

AccountActivationModal permite canjear el código recibido. No es el mismo formulario que Solicitar acceso. Las rutas públicas register.tsx, verify.tsx y access.tsx también forman parte de los accesos declarados en el router; para los enlaces del login hay que comenzar por los modales que efectivamente abre index.tsx.

## Olvidé la contraseña

PasswordRecoveryModal conduce pedido del código, canje y elección de nueva contraseña. authApi llama a password-recovery/request, redeem y reset. authService contiene requestPasswordRecovery, redeemPasswordRecoveryCode y completePasswordRecovery. Hay vencimiento, límite de intentos y controles de reenvío; el código se guarda mediante HMAC.

@frontend/src/components/PasswordRecoveryModal.tsx|export function
@backend/src/services/authService.ts|function requestPasswordRecovery
@backend/src/services/authService.ts|function completePasswordRecovery

Respuesta para practicar: “El frontend muestra y guía los pasos; el servidor decide si el código vale, si venció y si la cuenta puede activarse”.

---PAGE---
# 7 Gráfico de animales y estadísticas

## Dónde se cuenta y dónde se dibuja

HomeScreen pide listAnimals, filtra activo === 1 y acumula cantidades por animal.especie en un Map. Convierte el resultado en speciesCounts y lo ordena por cantidad descendente y luego nombre. El total de la etiqueta ANIMALES es la suma de esos conteos.

@frontend/src/components/app/Screens.dashboard.tsx|const counts = new Map
@frontend/src/components/app/Screens.dashboard.tsx|Animales por especie

SpeciesBarChart recibe esa lista y dibuja columnas con View y Text. No se importa una biblioteca externa de gráficos. Calcula step como el máximo dividido en cuatro intervalos y redondeado hacia arriba, con mínimo 1. El máximo de la escala es step por 4. Cada altura es count dividido por max, expresado como porcentaje.

@frontend/src/components/app/Screens.shared.tsx|function SpeciesBarChart

Ejemplo: con 10 bovinos y 5 equinos, step vale 3, el máximo 12 y las alturas representan aproximadamente 83,3 % y 41,7 % de la escala. La etiqueta sigue mostrando 10 y 5: la escala visual no modifica los datos.

El gráfico actual es por especie, aunque sobrevivan nombres internos como breedCountsLoaded o comentarios que mencionan raza. Para explicar el comportamiento hay que seguir animal.especie.

## De dónde salen las tarjetas de producción

getDashboard consulta GET /api/dashboard. fieldController.dashboard realiza los conteos SQL; HomeScreen solo arma las etiquetas y barras. Los datos significan lo siguiente:

- Crías del año: registros de nacimientos cuya fecha pertenece al año actual.
- Hembras preñadas: madres distintas, activas y hembras, con confirmación y fecha estimada igual o posterior a hoy.
- Servicios de 90 días: servicios con estado realizado y fecha desde hace 90 días. Al confirmar preñez el estado cambia a preñada, por lo que este contador no representa todos los servicios de ese período.
- Ventas del año: bajas con motivo venta en el año actual.
- Muertes del año: reportes confirmados del año, no los pendientes.
- Alertas sanitarias: animales activos con estado distinto de sano. Para administrador la tarjeta final muestra muertes pendientes.

@frontend/src/services/productionApi.ts|function getDashboard
@backend/src/controllers/fieldController.ts|function dashboard

El dueño y el administrador ven estos paneles. El peón recibe accesos rápidos; el veterinario entra a sanidad. Estas estadísticas describen registros productivos y no califican el desempeño de la persona que los cargó.

---PAGE---
# 8 Inventario y ficha de animales

AnimalsInventoryScreen contiene el buscador, filtros por especie, casilla Incluir inactivos, tarjetas, ficha modal y operaciones. Almacena en estado qué animal se está viendo, editando, pesando o moviendo. Abrir un modal generalmente cambia uno de esos estados.

@frontend/src/components/app/LivestockScreens.animals.tsx|function AnimalsInventoryScreen
@frontend/src/components/app/LivestockScreens.animals.tsx|const filtered = useMemo

El filtro de especie compara animal.especie. La búsqueda libre concatena identificador, nombre, especie, raza y corral. Se hace localmente sobre la lista recibida. El contador del inventario usa filtered.length; puede ser diferente del total del gráfico porque refleja la búsqueda y los filtros de esta pantalla.

## Datos de la tarjeta y la ficha

listAnimals en livestockApi pide /animals y puede agregar incluir_inactivos=true. El controlador une animales con corrales, razas, especies y bajas. También calcula si hay un alta veterinaria todavía sin movimiento asociado.

@frontend/src/services/livestockApi.ts|function listAnimals
@backend/src/controllers/livestockController.animals.ts|function listAnimals

La edad que se ve se calcula con formatAnimalAge, a partir de la fecha de nacimiento. No es un valor que la app deba ir actualizando manualmente en la base.

@frontend/src/components/app/LivestockScreens.shared.tsx|function formatAnimalAge

## Crear editar y pesar

AnimalCreateModal contiene el alta. createAnimal valida identificador, género, raza, corral, fecha, peso y foto; comprueba capacidad y registra auditoría. El identificador o caravana se ingresa manualmente y el servidor trata duplicados.

@frontend/src/components/app/AnimalCreateModal.tsx|export function
@backend/src/controllers/livestockController.animals.ts|function createAnimal

Editar pasa por persistAnimal en la pantalla y updateAnimal en servicio y controlador. Pesar abre AnimalWeightModal y llama a recordWeight. Esta última usa la cola offline, incluso cuando hay conexión; el servidor guarda un registro de pesaje, actualiza animales.peso_kg y deja auditoría.

@frontend/src/components/app/LivestockScreens.animals.tsx|async function persistAnimal
@frontend/src/components/app/AnimalWeightModal.tsx|export function
@frontend/src/services/productionApi.ts|function recordWeight

El peso visible es el peso actual guardado en la ficha, no un promedio de los pesajes. La existencia de auditoría o registros históricos en la base no implica que todas las fichas tengan una pantalla que muestre todo ese historial.

---PAGE---
# 9 Corrales y movimientos

## Mi estancia muestra corrales

EstateScreen devuelve CorralsInventoryScreen. No hay un mapa de la estancia en ese componente. La pantalla muestra nombre, ocupación, capacidad, condición de enfermería y acciones habilitadas.

@frontend/src/components/app/EstateScreen.tsx|function EstateScreen
@frontend/src/components/app/LivestockScreens.corrals.tsx|function CorralsInventoryScreen

La barra de ocupación calcula ocupacion / capacidad y limita la representación a 1. listCorrals en el backend obtiene la ocupación desde animales activos. Crear o editar pasa por saveCorral; borrar por deleteCorral. En el código actual canManage y las rutas de escritura habilitan al dueño.

@backend/src/controllers/livestockController.corrals.ts|function listCorrals
@backend/src/controllers/livestockController.corrals.ts|function deleteCorral

El controlador de baja exige un corral activo que no sea enfermería y comprueba que no tenga animales activos. Después hace una baja lógica y registra auditoría. No implementa en esa función una comprobación general de todas las dependencias operativas que mencionan algunas descripciones anteriores.

## Qué hace Mover

En el inventario, el peón abre el modal con setMoving. saveMovement llama a livestockApi.moveAnimal, que crea una operación de sincronización de tipo movimiento. Por eso el recorrido real del botón llega a syncController.moveAnimal. También existe un endpoint directo y una implementación en livestockController.movements.ts.

@frontend/src/components/app/LivestockScreens.animals.tsx|async function saveMovement
@frontend/src/services/livestockApi.ts|function moveAnimal
@backend/src/controllers/syncController.ts|async function moveAnimal
@backend/src/controllers/livestockController.movements.ts|function moveAnimal

El servidor comprueba que el animal esté activo, que el destino sea válido y tenga capacidad, y que no sea el mismo corral. Inserta movimientos_animales y actualiza el corral de la ficha dentro de una transacción. Si se sale de enfermería exige el alta pendiente y la asocia al movimiento.

## Regla de campo para explicar

El alta médica y el traslado físico son dos hechos distintos. El veterinario puede declarar sano a un animal sin cambiarlo de corral. El peón registra después el traslado real. Así la ocupación de enfermería sigue reflejando que el animal todavía está allí.

La ubicación operativa se representa con un corral asignado y registros de movimientos. El GPS de un reporte de muerte cumple otra función: guardar el punto del hallazgo. No hay seguimiento continuo del ganado.

---PAGE---
# 10 Enfermería y alta veterinaria

HealthScreen decide qué vista de sanidad corresponde al rol. Veterinario y dueño llegan a NursingScreen; el administrador puede alternar enfermería y revisión de muertes. Al peón se lo redirige al inventario, donde registra los reportes.

@frontend/src/components/app/Screens.health.tsx|function HealthScreen
@frontend/src/components/app/LivestockScreens.nursing.tsx|function NursingScreen

## Reportar enfermedad

La ficha animal tiene un formulario controlado por reportingIllness. submitIllnessReport envía reportAnimal con tipo sanitario, fecha, observaciones y corral de enfermería. productionApi lo transforma en una operación offline reporte_sanitario.

@frontend/src/components/app/LivestockScreens.animals.tsx|async function submitIllnessReport
@frontend/src/services/productionApi.ts|function reportAnimal
@backend/src/controllers/syncController.ts|async function reportAnimal

En el servidor se verifica un destino activo marcado como enfermería y su capacidad. Se registra el reporte, el movimiento cuando corresponde, el estado enfermo, el historial de salud y los avisos. fieldController.createReport contiene además la variante del endpoint directo /reports/:kind.

## Tratamientos e historial

NursingScreen tiene openHistory para consultar el historial, saveEvolution para registrar una nota o tratamiento y saveDiagnosis para cambiar entre enfermo y herido. livestockApi consulta /health/nursing y /health/animals/:id/records. createVeterinaryRecord pasa por la cola offline con tipo nota_veterinaria.

@frontend/src/components/app/LivestockScreens.nursing.tsx|async function openHistory
@frontend/src/components/app/LivestockScreens.nursing.tsx|async function saveEvolution
@backend/src/controllers/livestockController.nursing.ts|function listVeterinaryRecords

El servidor limita los registros veterinarios a animales activos en enfermería. Los tratamientos y notas se guardan en tratamientos; los cambios de estado tienen su propio historial.

## Dar el alta

confirmDischarge llama a dischargeAnimal, que hace un pedido directo. dischargeNursingAnimal valida el caso, cambia el estado a sano, marca reportes atendidos, crea altas_enfermeria y notifica al peón. Conserva el corral hasta el traslado posterior.

@frontend/src/components/app/LivestockScreens.nursing.tsx|async function confirmDischarge
@backend/src/controllers/livestockController.nursing.ts|function dischargeNursingAnimal

Respuesta para practicar: “Sanidad combina el estado médico con la ubicación. Estar sano no significa que el animal ya salió de enfermería”.

---PAGE---
# 11 Muertes y otras bajas

## Reporte de muerte del peón

La misma ficha animal contiene el formulario de muerte. captureDeathLocation pide permiso de ubicación y obtiene coordenadas con expo-location. confirmDeactivation distingue el reporte del peón de la baja que hace el dueño.

@frontend/src/components/app/LivestockScreens.animals.tsx|async function captureDeathLocation
@frontend/src/components/app/LivestockScreens.animals.tsx|async function confirmDeactivation

El peón envía reportAnimal con tipo muerte. El servicio crea reporte_muerte en la cola local. Al sincronizar, el backend exige latitud y longitud válidas, crea reportes_muerte y desactiva operativamente el animal. El reporte queda pendiente de revisión: el animal no sigue disponible para nuevas operaciones mientras se decide.

@backend/src/controllers/syncController.ts|async function reportAnimal

## Revisión administrativa

DeathReviewScreen muestra los pendientes. listPendingDeaths y reviewDeath consultan /deaths y /deaths/:id/review. fieldController.reviewDeaths maneja ambas acciones según el método HTTP.

@frontend/src/components/app/Screens.health.tsx|function DeathReviewScreen
@frontend/src/services/productionApi.ts|function reviewDeath
@backend/src/controllers/fieldController.ts|function reviewDeaths

Confirmar deja el reporte confirmado. Rechazar exige motivo y reactiva el animal; el reporte rechazado se conserva. La tarjeta de muertes del año toma los confirmados. Una baja operativa pendiente ya puede reducir el gráfico de animales activos antes de aumentar la tarjeta de muertes confirmadas.

## Baja del dueño por venta muerte u otro motivo

El dueño usa deactivateAnimal, un pedido directo a /animals/:id/deactivate. El controlador registra la baja y conserva la ficha. Si el motivo es muerte, su registro queda confirmado directamente. Si es venta, alimenta la estadística de ventas del año.

@frontend/src/services/livestockApi.ts|function deactivateAnimal
@backend/src/controllers/livestockController.animals.ts|function deactivateAnimal

No confundir baja con borrado permanente. Existe permanentlyDeleteInactiveAnimal como acción separada para animales inactivos, con confirmación y validaciones específicas. Para explicarla hay que abrir su implementación; no asumir que el botón Dar de baja elimina físicamente todos los datos.

@backend/src/controllers/livestockController.animals.ts|function permanentlyDeleteInactiveAnimal

Las coordenadas se capturan para el evento de muerte. La imagen adjunta y observaciones son datos adicionales; no hay un rastreo continuo ni un mapa ganadero implementado en Mi estancia.

---PAGE---
# 12 Servicios de monta y nacimientos

## Dónde se inicia un servicio

Desde la ficha animal se puede abrir MatingServiceForm. El formulario recibe la madre y la lista de animales, reúne padre registrado o texto de padre externo, fecha, método y observaciones. Llama a modulesApi.createMatingService.

@frontend/src/components/app/MatingServiceForm.tsx|export function
@frontend/src/services/modulesApi.ts|function createMatingService
@backend/src/controllers/modulesController.ts|function createMatingService

El backend exige madre activa hembra. Si se elige un padre registrado debe ser macho activo de la misma especie y distinto de la madre. Inserta servicios_monta con estado realizado. Registrar el servicio no confirma automáticamente que exista preñez.

## Qué muestra Reproducción

ReproductionScreen consulta listReproduction y dibuja servicios recientes, fechas, padres, método, especie, observaciones y nacimientos. confirmServicePregnancy responde al botón Confirmar preñez. La pantalla muestra la fecha estimada que devuelve el servidor; no aplica ella misma la duración por especie.

@frontend/src/components/app/FieldModuleScreens.reproduction.tsx|function ReproductionScreen
@frontend/src/components/app/FieldModuleScreens.reproduction.tsx|async function confirmServicePregnancy
@backend/src/controllers/modulesController.ts|function listReproduction

## Registrar una cría

BirthForm reúne caravana, nombre opcional, foto, género, raza, corral, fecha y ambos progenitores. Puede vincular animales registrados o informar progenitores mediante texto. createBirth valida la información y comprueba género y especie de los padres registrados.

@frontend/src/components/app/BirthForm.tsx|export function
@backend/src/controllers/modulesController.ts|function createBirth

La operación crea la ficha de la cría en animales y el vínculo en nacimientos, con auditoría, dentro de una transacción. Controla que el corral esté activo y tenga capacidad. Si falla una parte se revierte la operación para no dejar una cría sin el registro correspondiente.

## Borrar un registro reproductivo

El dueño dispone de acciones de borrado en ReproductionScreen. removeRecord llama a deleteMatingService o deleteBirthRecord. El backend conserva auditoría del borrado. Borrar un registro de nacimiento conserva la ficha de la cría: registro reproductivo y animal son entidades distintas.

@backend/src/controllers/modulesController.ts|async function deleteReproductionRecord

Los servicios y nacimientos usan pedidos directos a la API, no figuran entre los tipos admitidos por la cola offline actual.

---PAGE---
# 13 Cálculo de gestación y recordatorios

## La respuesta exacta para ubicar la fórmula

El cálculo está en backend/src/controllers/modulesController.ts, en confirmPregnancy. La duración se busca con gestationDays en la tabla gestationBySpecies del mismo archivo.

@backend/src/controllers/modulesController.ts|function confirmPregnancy
@backend/src/controllers/modulesController.ts|const gestationBySpecies

El servidor obtiene la especie de la madre a través de animales → razas → especies. gestationDays quita acentos, pasa a minúsculas y recorta espacios. Busca ese nombre en el diccionario; no calcula una duración a partir de la raza. Si no encuentra coincidencia, devuelve un error en lugar de inventar una fecha.

| Nombre reconocido y sus alias | Días configurados |
|---|---|
| bovino vacuno vaca cattle | 283 |
| porcino cerdo chancho pig | 114 |
| equino caballo horse | 340 |
| ovino oveja sheep | 150 |
| caprino cabra goat | 150 |
| gato felino cat | 65 |
| perro canino dog | 63 |
| conejo rabbit | 31 |
| burro donkey | 365 |
| llama alpaca | 350 |

Son valores programados para estimar, no una confirmación clínica de una fecha exacta. Normalizar no agrega sinónimos ni convierte automáticamente plurales en singular; el nombre debe coincidir con una clave contemplada.

## Qué fecha se usa

La sentencia SQL actualiza fecha_estimada_nacimiento con DATE_ADD(fecha, INTERVAL ? DAY). fecha es la fecha del servicio, no el día en que se presionó Confirmar preñez. También guarda prenez_confirmada_en y cambia estado a preñada. Si ya estaba confirmado, devuelve la estimación guardada y ya_confirmada sin recalcularla.

## Cuándo aparece el aviso de nacimiento próximo

publishBirthReminders busca estimaciones cuyo día menos un mes calendario coincide con hoy, crea la notificación y guarda recordatorio_nacimiento_en para no repetirla. Aunque un comentario dice treinta días, SQL usa INTERVAL 1 MONTH: un mes calendario no siempre equivale a 30 días.

@backend/src/controllers/modulesController.ts|function publishBirthReminders
@backend/src/server.ts|setInterval(publish

server.ts ejecuta la tarea al arrancar y cada hora mientras el proceso vive. No es una notificación push del teléfono. La condición exige el día exacto: si el servidor no se ejecuta ese día, esta consulta no recupera automáticamente ese aviso al día siguiente.

---PAGE---
# 14 Tareas y equipo

## Crear asignar y completar tareas

TasksManagerScreen muestra tareas y, al administrador, el formulario para crearlas. load consulta tareas y usuarios; add envía título, descripción, responsable y vencimiento opcional. change alterna pendiente → en_progreso → completada → pendiente.

@frontend/src/components/app/FieldModuleScreens.tasks.tsx|function TasksManagerScreen
@frontend/src/components/app/FieldModuleScreens.tasks.tsx|async function add
@frontend/src/components/app/FieldModuleScreens.tasks.tsx|async function change

modulesApi define listTasks, createTask y updateTask. modulesRoutes permite crear solo al administrador; administrador y peón pueden consultar y actualizar. En el backend, listTasks devuelve las del responsable salvo para administrador; createTask exige que el responsable sea un peón activo; updateTask comprueba el responsable o el rol administrador.

@backend/src/controllers/modulesController.ts|function listTasks
@backend/src/controllers/modulesController.ts|function createTask
@backend/src/controllers/modulesController.ts|function updateTask

El backend también acepta cancelada como estado válido, aunque el ciclo del botón change no lo recorre. El formulario actual no implementa todos los campos imaginables de una tarea de campo: para el examen hay que describir los campos que efectivamente envía add.

Las tareas realizan solicitudes directas. updateTask no usa submitOfflineOperation y tarea no es un tipo aceptado por syncController. No afirmar que se completan sin señal basándose solamente en una descripción funcional anterior.

## Equipo y roles

TeamScreen muestra personas y permite al administrador editar o dar de baja usuarios. saveUser llama a updateOrganizationUser y remove a deactivateOrganizationUser. El dueño puede consultar el equipo, pero no administra cuentas mediante esas rutas.

@frontend/src/components/app/OrganizationScreens.team.tsx|function TeamScreen
@frontend/src/components/app/OrganizationScreens.team.tsx|async function saveUser
@backend/src/controllers/organizationController.ts|function deactivateUser

La baja de un usuario contempla sus tareas pendientes y la reasignación cuando corresponde, y conserva las referencias históricas. No equivale a borrar el autor de todas las operaciones de la estancia.

## Equipo no es lo mismo que solicitudes

TeamModuleScreen muestra AdminRequestsScreen al administrador. Desde esa vista se gestionan altas pendientes y se puede acceder al equipo. La aprobación inicial se resuelve en registrationService; editar un usuario existente se resuelve en organizationController.

---PAGE---
# 15 Especies y razas

CatalogScreen implementa la pantalla Especies y razas. Carga el catálogo con listCatalog y organiza los formularios para especies, razas y solicitudes. Una raza pertenece a una especie; el animal guarda id_raza y el servidor obtiene desde allí su especie.

@frontend/src/components/app/OrganizationScreens.catalog.tsx|function CatalogScreen
@frontend/src/components/app/OrganizationScreens.catalog.tsx|async function submit
@frontend/src/services/organizationApi.ts|function listCatalog

## Cómo se guarda y quién decide

organizationApi contiene createSpecies, createBreed, deleteSpecies, deleteBreed, requestCatalog y reviewCatalog. organizationRoutes define los permisos; organizationController ejecuta validaciones y consultas.

@backend/src/routes/organizationRoutes.ts|'/catalog/species'
@backend/src/controllers/organizationController.ts|function createSpecies
@backend/src/controllers/organizationController.ts|function createBreed
@backend/src/controllers/organizationController.ts|function requestCatalog
@backend/src/controllers/organizationController.ts|function reviewCatalog

En las rutas actuales, el dueño crea y elimina especies y razas y revisa solicitudes; el peón las solicita. Administrador, dueño y peón pueden consultar. Esto difiere de algunas descripciones antiguas que atribuían al administrador toda la gestión de catálogo.

Los borrados permanentes verifican asociaciones para evitar eliminar una especie o raza que esté en uso. Los botones de confirmación están en la pantalla; la decisión definitiva la aplica el backend.

## Por qué este catálogo afecta varias pantallas

- Alta de animales: ofrece las razas que se pueden seleccionar.
- Filtro del inventario: permite obtener nombres de especies; si falla el catálogo se usan las presentes en las fichas cargadas.
- Reproducción: permite comparar que padres y cría sean de la misma especie.
- Gestación: el nombre de la especie termina consultándose en gestationBySpecies.
- Eventos: el servidor relaciona especies y razas de animales activos con eventos relevantes.

Agregar una especie al catálogo no agrega automáticamente una duración de gestación. Si su nombre no está entre las claves de gestationBySpecies, la confirmación de preñez no puede estimar la fecha con la implementación actual.

## Qué decir si el profesor pregunta por relaciones

“El animal no guarda un nombre de especie independiente de su raza. Se vincula a una raza, y esa raza pertenece a una especie. Los JOIN del servidor recuperan los nombres para mostrar la ficha y aplicar las reglas”.

---PAGE---
# 16 Eventos y remates

EventsScreen contiene calendario, mes seleccionado, día seleccionado, filtros, tarjetas y fuentes. monthCells arma la cuadrícula del mes. eventsByDate agrupa eventos por día y cubre los intervalos entre inicio y fin; el bucle limita a 60 días por evento. monthEventCount evita contar repetidamente el mismo evento dentro del mes.

@frontend/src/components/app/EventsScreen.tsx|function monthCells
@frontend/src/components/app/EventsScreen.tsx|function EventsScreen
@frontend/src/components/app/EventsScreen.tsx|const eventsByDate

listFieldEvents consulta /events, con todos=1 cuando corresponde. El backend combina eventos_campo con eventos_importados de fuentes habilitadas. También devuelve especies, razas, provincias, total_nacional y estado de fuentes.

@frontend/src/services/modulesApi.ts|function listFieldEvents
@backend/src/controllers/modulesController.ts|function listEvents

## De dónde vienen los eventos externos

eventSources.ts consulta páginas públicas de asociaciones, interpreta información estructurada y distintas formas de HTML, extrae fechas y datos, e incorpora los resultados a la base. synchronizeAssociationEvents coordina la actualización. La configuración de fuentes tiene un archivo de semillas en backend/database/seeds/fuentes_eventos.json.

@backend/src/services/eventSources.ts|function synchronizeAssociationEvents
@backend/src/services/eventSources.ts|async function collectSourceEvents
@backend/src/server.ts|setInterval(syncEvents

El servidor intenta sincronizar al arrancar y cada siete días mientras el proceso está activo. La pantalla consume la base del proyecto; no vuelve a descargar todas las páginas externas desde el teléfono en cada visita. Que exista el importador no garantiza que una fuente externa siga teniendo el mismo formato o esté disponible.

## Cómo se decide la relevancia para la estancia

El backend obtiene especies y razas de animales activos, normaliza etiquetas y filtra eventos. Los filtros de la pantalla refinan por especie, raza y provincia. Eventos sin etiquetas pueden pasar el filtro general.

Un detalle para explicar con precisión: todos=1 relaja la comparación de raza, pero el código sigue comprobando coincidencia de especie para eventos etiquetados. No significa necesariamente “devolver cualquier especie del país”. total_nacional, en cambio, se calcula con la lista combinada antes de ese filtro.

Los permisos de modulesRoutes habilitan este módulo a dueño y administrador. Las fuentes y los enlaces de las tarjetas están en SourceGroup y EventCard de la pantalla.

---PAGE---
# 17 Notificaciones y trabajo sin señal

## La campana

NotificationBell vive dentro de OwnerDesktopShell, por eso aparece en distintas secciones. Consulta avisos, abre un modal, pagina resultados y permite marcar, borrar o responder según el caso. Una consulta periódica cada cinco segundos mantiene la lista; no hay un canal WebSocket en este componente.

@frontend/src/components/app/NotificationBell.tsx|function NotificationBell
@backend/src/controllers/livestockController.notifications.ts|function listNotifications
@backend/src/controllers/livestockController.notifications.ts|function updateNotification

El backend filtra por rol destinatario o avisos generales. Usa notificaciones_usuario para leído y eliminado por persona. Las respuestas accept o reject sobre tipos solicitud actualizan estado_respuesta de la notificación; no hay que confundir esa acción con las funciones específicas que aprueban solicitudes de cuenta o de catálogo.

## Qué funciona con la cola local

Los tipos admitidos son pesaje, movimiento, reporte_sanitario, reporte_muerte y nota_veterinaria. submitOfflineOperation genera un identificador, guarda primero la operación localmente e intenta enviarla. Si queda pendiente puede actualizar la caché para reflejar el cambio en el dispositivo.

@frontend/src/services/offlineSync.ts|function submitOfflineOperation
@frontend/src/services/offlineSync.ts|function synchronizePendingOperations

offlineDatabase.ts usa SQLite en móvil. offlineDatabase.web.ts usa localStorage en navegador. Se separan los datos del usuario para consultar la cola correspondiente. livestockApi conserva determinadas consultas en caché; esto no implica que cualquier pantalla esté disponible sin una carga previa.

@frontend/src/services/offlineDatabase.ts|function initializeOfflineDatabase
@frontend/src/services/offlineDatabase.web.ts|function enqueueOperation
@frontend/src/components/app/OfflineSyncBanner.tsx|function OfflineSyncBanner

## Cómo evita guardar dos veces lo mismo

POST /api/sync/operations llega a synchronizeOperations. synchronizeOne verifica tipo, entidad y rol, busca el identificador en operaciones_sincronizacion y ejecuta una transacción por operación. Si ya existe para el usuario devuelve repetida. Si se aplica devuelve aplicada; si falla devuelve rechazada y la app conserva información del error.

@backend/src/controllers/syncController.ts|async function synchronizeOne
@backend/src/controllers/syncController.ts|async function applyOperation

SessionProvider intenta sincronizar al iniciar sesión y cuando NetInfo informa que volvió la conexión. La base del servidor vuelve a validar capacidad, estado del animal y permisos: estar guardado en el teléfono no garantiza que una operación sea aceptada después.

---PAGE---
# 18 Perfil y apariencia

## Mi perfil y cerrar sesión

MoreScreen contiene datos personales, foto, cambio de contraseña y cierre de sesión. pickPhoto abre la galería. saveProfile llama a updateMyProfile, actualiza la sesión y la guarda. savePassword valida campos y llama a changeMyPassword.

@frontend/src/components/app/Screens.profile.tsx|function MoreScreen
@frontend/src/components/app/Screens.profile.tsx|async function saveProfile
@frontend/src/components/app/Screens.profile.tsx|async function logout

logout borra el almacenamiento local de sesión, pone la sesión en null y vuelve al login. No llama a un endpoint de cierre remoto en esa función. authService.updateProfile y changePassword resuelven los cambios en el servidor. Un detalle actual: saveProfile llama a saveSession aunque el login previo no haya marcado Mantener sesión iniciada.

## Claro oscuro y colores

ThemeProvider centraliza isDark, colors y toggleTheme. ThemeToggle muestra el control para cambiar. Las pantallas llaman useTheme y aplican colores a tarjetas, textos y fondos. Cambiar un color global se estudia en ThemeContext; cambiar la disposición de una tarjeta se estudia en los archivos de estilos de su grupo.

@frontend/src/context/ThemeContext.tsx|function ThemeProvider
@frontend/src/components/ThemeToggle.tsx|export function

## Dónde buscar un cambio visual

| Parte visible | Estilos principales |
|---|---|
| Login fondo formulario y botones | frontend/src/app/LoginStyles.tsx |
| Menú y estructura exterior | OwnerDesktopShellStyles.tsx |
| Inicio gráfico perfil y vistas generales | ScreensStyles.tsx y ScreensStylesPart1 2 3 |
| Animales corrales y enfermería | LivestockStyles.tsx y LivestockStylesPart1 2 |
| Tareas y reproducción | FieldModuleStyles.tsx y FieldModuleStylesPart1 |
| Equipo y catálogo | OrganizationStyles.tsx y OrganizationStylesPart1 |

Los archivos de estilos de esta tabla, salvo el login, están en frontend/src/components/app. Los principales combinan objetos definidos en Part1, Part2 o Part3; hay que seguir la propiedad concreta. Algunos componentes, como SocialLoginButton, PhotoAttachment y NotificationBell, declaran estilos en su propio archivo. Otros tienen ajustes en línea dentro del JSX.

## Fotos y elementos compartidos

PhotoAttachment solicita acceso a la galería, recorta y obtiene base64, controla tamaño y entrega un data URI al formulario. El servidor vuelve a validar la foto. BrandWordmark muestra la marca; BrandLoadingScreen la carga inicial; PasswordInput encapsula una entrada de contraseña; ScrollToTop el botón para volver al comienzo.

@frontend/src/components/app/PhotoAttachment.tsx|async function choosePhoto

---PAGE---
# 19 Servidor y base de datos

## Qué recibe cada pedido

server.ts inicia la escucha y las tareas periódicas. app.ts configura CORS, JSON y rutas. config/api.ts establece la dirección del servidor para la app; config/database.ts conecta la base y config/env.ts interpreta las variables del backend.

@backend/src/server.ts|app.listen
@backend/src/app.ts|app.use('/api/auth'
@frontend/src/config/api.ts|apiUrl
@backend/src/config/database.ts|createPool

## Autenticación y autorización son controles distintos

requireAuthentication comprueba el token y consulta que la cuenta siga activa, con token_version vigente. requireRoles vuelve a consultar el rol actual y lo compara con los permitidos. requireAdministrator protege acciones administrativas. Ocultar un botón en el frontend mejora la navegación, pero no reemplaza estos controles.

@backend/src/middleware/authMiddleware.ts|function requireAuthentication
@backend/src/middleware/roleMiddleware.ts|function requireRoles
@backend/src/middleware/adminMiddleware.ts|requireAdministrator

| Información | Tablas principales que usa el código |
|---|---|
| Acceso y personas | usuarios roles solicitudes_registro y tablas de códigos |
| Identidad productiva | animales razas especies corrales |
| Pesos y ubicación | pesajes movimientos_animales |
| Sanidad | reportes_sanitarios tratamientos historial_estado_salud altas_enfermeria |
| Bajas | reportes_muerte bajas_animales |
| Reproducción | servicios_monta nacimientos |
| Trabajo y trazabilidad | tareas auditoria_cambios |
| Avisos | notificaciones notificaciones_usuario |
| Sincronización | operaciones_sincronizacion |
| Calendario | eventos_campo eventos_importados fuentes_eventos sincronizaciones_eventos |

## Migraciones y transacciones

Las migraciones agregan o modifican tablas y columnas; no son las pantallas. migrate.ts enumera las migraciones aditivas que aplica y registra su ejecución. Tener un SQL en la carpeta no demuestra que esté aplicado a una base determinada.

@backend/src/scripts/migrate.ts|const migrations

Las transacciones mantienen juntas operaciones como nacimiento y ficha de cría. beginTransaction inicia, commit confirma y rollback revierte. SQL recibe valores mediante parámetros. La organización actual supone una estancia por base; no hay un filtro general por organización en todas las consultas.

---PAGE---
# 20 Preguntas de defensa y diferencias a recordar

## Respuestas cortas para practicar

- ¿Dónde está el gráfico? HomeScreen arma speciesCounts en Screens.dashboard.tsx; SpeciesBarChart lo dibuja en Screens.shared.tsx.
- ¿Quién calcula las estadísticas? fieldController.dashboard mediante SQL; la pantalla pone etiquetas y barras.
- ¿Dónde está la gestación? confirmPregnancy y gestationBySpecies en modulesController.ts. Suma días a la fecha de monta.
- ¿Registrar monta equivale a preñez? No. Se registra el servicio y luego se confirma por una acción separada.
- ¿El alta mueve al animal? No. Lo declara sano y deja el traslado al peón.
- ¿Dónde se controla la capacidad? En el backend al crear animales, nacimientos, movimientos e ingresos sanitarios; la barra de pantalla solo representa ocupación.
- ¿El login social habilita a cualquiera? No. Verifica identidad externa y exige una cuenta local activa con ese correo.
- ¿Cómo se evita duplicar un pesaje por reintento? Con un identificador único y operaciones_sincronizacion.
- ¿Por qué cambia un botón según el usuario? La pantalla lee el rol de sesión; las rutas y middleware verifican los permisos reales.
- ¿Dónde está el calendario? EventsScreen; los datos vienen de listEvents y de la importación de eventSources.ts.

## Diferencias que conviene no memorizar mal

1. El gráfico es por especie, pese a algunos nombres y comentarios que mencionan raza.
2. Las tareas actuales no pasan por la cola offline. Tampoco todos los formularios de reproducción o gestión.
3. En las rutas actuales el dueño administra corrales y catálogo y revisa solicitudes de catálogo. El administrador gestiona usuarios, altas y revisión de muertes. Algunas descripciones previas asignan esos permisos de otra forma.
4. Servicios de 90 días cuenta estado realizado; una preñez confirmada cambia ese estado.
5. El recordatorio usa un mes calendario y coincidencia con el día actual, no una ventana general de treinta días ni recuperación automática de avisos omitidos.
6. Las notificaciones de la campana se consultan periódicamente dentro de la app; eso no equivale a notificaciones push del sistema.
7. Hay endpoints directos para operaciones que los botones actuales envían por /sync/operations. Para defender el recorrido real, seguir primero el servicio del frontend.

## Método para ubicar cualquier elemento nuevo

Buscá el texto visible en frontend/src. Leé el componente que lo dibuja y su onPress u onChangeText. Seguí la función importada desde services. Buscá la ruta en backend/src/routes y el controlador asociado. Por último, identificá las tablas y validaciones. Si el servicio llama a submitOfflineOperation, continuá por syncController en lugar de saltar directamente al endpoint individual.

Práctica sugerida: abrí la app con cada rol y elegí cinco elementos por sesión de estudio. Para cada uno explicá en voz alta dónde se ve, qué función responde, qué datos envía, quién tiene permiso y qué guarda el servidor. Usá tus manuales para el flujo de uso y esta guía para llegar al código.
