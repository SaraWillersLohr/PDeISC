# EstanciaApp — React Native + Expo

Esta carpeta es el proyecto móvil del sistema. Se conservó `bd_final.sql` como el volcado de referencia existente y se agregó una app React Native nativa con Expo y TypeScript. La API Node/Express está en `backend/`; la app no usa WebView ni accede directamente a MariaDB.

## Lo que ya está portado

- Login con correo y contraseña conectado a `POST /api/auth/login`.
- Perfil vigente consultado desde `GET /api/auth/me`.
- Bienvenida como pantalla posterior al login. Recibe `user` como prop tipada, según la consigna.
- Canje del token temporal que recibe la persona después de que el administrador aprueba su solicitud; el canje inicia sesión y activa la cuenta.
- Recordar sesión mediante SecureStore; no almacena contraseña.
- Login con mostrar/ocultar contraseña y autocompletado seguro del sistema operativo para gestores de contraseñas. Los campos permiten pegar credenciales.
- Recuperación de acceso con código de seis dígitos de un solo uso, con vencimiento de 10 minutos, hasta cinco intentos y reenvío limitado a uno por minuto y cinco por día. Nunca se envían contraseñas por correo.
- Cierre de sesión con revocación de los JWT, vencimiento normal del JWT, y revocación de sesiones al cambiar permisos, desactivar una cuenta o recuperar la contraseña.
- Respuesta de login genérica para no revelar si el correo existe, está pendiente de aprobación o tiene una clave incorrecta.
- Menú y vistas nativas de resumen, animales, corrales, equipo, campo, veterinaria y avisos. Las listas consultan los endpoints existentes.
- Formularios nativos para reportar síntomas desde Campo y registrar el alta veterinaria; se pueden usar también en Android.
- Diseño adaptable a móvil y tablet para todos los roles: encabezado en tarjeta, menú de secciones que se ajusta en varias líneas sin recortar controles, contenido con ancho máximo, desplazamiento vertical y teclado contemplado en formularios. La campanita usa el icono Material Community bell-outline, aparece en el encabezado de todos los roles, muestra el total de avisos de ese usuario y abre la sección Avisos; la lista se consulta nuevamente cada 30 segundos.
- Bundle web habilitado con las dependencias compatibles de Expo SDK 57. En navegador la sesión recordada vive solo en `sessionStorage`; en Android/iOS se conserva en SecureStore.
- Diseño alineado con el proyecto R5: pantalla de acceso adaptable con la imagen original de la vaca, panel verde oscuro y escritorio con navegación lateral. Los formularios de registro, verificación y token comparten la misma identidad visual. Confirmaciones y mensajes usan componentes propios dentro de la app; no se usan cuadros `Alert` del sistema ni diálogos nativos del navegador.
- Registro e ingreso social conectados al backend OAuth de R5 para Google, Facebook, GitHub, Discord, Twitch y X. Cada acción tiene su flujo: ingresar exige una cuenta activa aprobada; registrarse crea una solicitud nueva que espera aprobación y token, igual que el registro por correo.
- API Node/Express copiada para ejecutar el sistema desde esta carpeta. Por defecto apunta a `estancia_app_r5`; `bd_final_rn1.sql` queda como copia opcional y no se necesita para este flujo.

La **Etapa 1 de operaciones del campo** está implementada: gestión de animales con búsqueda/filtros y alta, edición y baja lógica; gestión de corrales con capacidad/ocupación y marca de enfermería; acciones de Campo para registrar nacimientos, trasladar y reportar síntomas; flujo Veterinario con enfermería dinámica, tratamientos, historia clínica y altas; y tablero con métricas, alertas, gráfico de 12 meses y accesos rápidos. Las pantallas se conectan a los endpoints ya existentes y no requieren cambiar el esquema de la base.

La app respeta las autorizaciones que ya aplica el backend: dueño y copropietario pueden supervisar Campo y Veterinaria y administrar animales/corrales; peón opera Campo; veterinario trabaja en enfermería y tratamientos; el administrador superior conserva Usuarios, Solicitudes y Avisos para gestionar cuentas. Veterinaria usa la marca real del corral de enfermería, no un identificador fijo.

La **Etapa 2** queda para ampliar el modelo ganadero: alta de especies y razas, sexo, edad calculada, filiación/genética, servicio y reproductor, gestación, partos, destete, pesajes y movimientos/eventos históricos. Esos datos requieren definir campos y reglas de base de datos primero.

## Estructura

```text
RN_1/
├── App.tsx                  # login → bienvenida con Props → menú del sistema
├── app.json
├── bd_final.sql             # volcado original recibido, sin modificar
├── bd_final_rn1.sql         # copia aislada que crea estancia_app_rn1
├── src/
│   ├── components/          # componentes nativos reutilizables
│   ├── config/              # URL de la API y clave de sesión local
│   ├── screens/             # Login, Welcome y módulos de campo
│   ├── services/            # llamadas HTTP JSON a la API
│   └── types/               # contratos TypeScript
└── backend/
    ├── src/                 # Express, servicios, controladores y rutas existentes
    ├── database/migrations/ # estados, solicitudes, tokens y avisos dirigidos
    └── .env.example         # SMTP, DB y secretos de ejemplo
```

## Cómo leer el código

Los archivos TypeScript y TSX de `App.tsx`, `src/` y `backend/src/` tienen comentarios en español con `//`. Cada archivo comienza con su propósito; las funciones explican qué reciben, qué operación realizan y qué devuelven o actualizan. También se comentan los contratos de tipos, las constantes de seguridad y las rutas HTTP. En particular, `backend/src/services/registrationService.ts` documenta el recorrido de registro, verificación del correo, aprobación administrativa y emisión/canje del token.

Los archivos JSON no admiten comentarios `//` sin dejar de ser válidos. Su función está resumida acá: `package.json` define dependencias y comandos de Expo; `backend/package.json` define dependencias y comandos de la API; `app.json` configura Expo, plataformas y esquema de retorno social; los dos `tsconfig.json` fijan la compilación y comprobación de tipos del cliente y del backend. Los archivos `.env.example` enumeran variables de configuración de muestra; los secretos reales deben quedar en los `.env` locales y no publicarse.

## Desarrollo local

Requisitos: Node.js compatible con Expo SDK 57 (22.13 o superior), Expo Go y MariaDB/MySQL local.

1. **Usar tu base existente:** conectate en HeidiSQL y hacé un respaldo antes de cambiarla. No necesitás importar `bd_final_rn1.sql` ni crear otra base. El `.env` apunta por defecto a `estancia_app_r5`; si tu esquema tiene otro nombre, actualizá `DB_NAME`.
2. **Migraciones:** en HeidiSQL, seleccioná `estancia_app_r5` y ejecutá en orden `001_registration_email_verification.sql`, `002_single_superadmin_existing_db.sql`, `003_registration_requests_and_admin.sql`, `004_user_access_tokens.sql`, `005_targeted_notifications.sql`, `006_social_registration_identity.sql` y `007_password_recovery_and_revocable_sessions.sql`. La 001 agrega el estado de cuenta y `token_version` para invalidar sesiones; la 003 agrega las solicitudes; la 004 almacena hashes de códigos de acceso temporales; la 005 permite que cada administrador vea avisos de sus solicitudes sin exponerlos a los demás roles; la 006 almacena el proveedor y su identificador hasta que se apruebe la solicitud social; la 007 agrega la tabla de códigos de recuperación. Las migraciones operan sobre la base seleccionada; no crean otra. La 002 es destructiva: elimina las demás cuentas e identidades sociales. **Hacé primero un respaldo** y no ejecutes de nuevo migraciones ya aplicadas.
3. **Backend:** copiá `backend/.env.example` como `backend/.env`, ajustá host, puerto, usuario, contraseña y `DB_NAME` a la base elegida. En Windows PowerShell clásico generá cada secreto con:

   ```powershell
   $bytes = New-Object byte[] 32
   $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $rng.GetBytes($bytes)
   [BitConverter]::ToString($bytes).Replace('-', '')
   $rng.Dispose()
   ```

   Ejecutá el bloque tres veces y usá valores diferentes para `JWT_SECRET`, `SESSION_SECRET` y `VERIFICATION_CODE_SECRET`. Revocá la clave de aplicación de Gmail que se compartió en el chat y guardá una nueva solo en `SMTP_PASS` del `.env` local (ignorado por Git). Luego, desde `backend/`, ejecutá `npm install` y `npm run dev`. La API debe iniciar en el puerto definido por `PORT` (3001 por defecto); consultá `http://localhost:3001/api/health` para revisar el estado de API y base.
4. **Expo:** copiá `.env.example` como `.env`. `EXPO_PUBLIC_API_URL` se usa en Android/iOS: `http://10.0.2.2:3001/api` en Android Emulator, `http://localhost:3001/api` en simulador iOS, o la IP LAN de la PC en un teléfono físico. `EXPO_PUBLIC_API_URL_WEB` se usa en navegador y normalmente queda `http://localhost:3001/api`. Iniciá `npm install` y `npm start` desde `RN_1/` y abrí Expo Go. Para navegador, elegí `w` en el menú de Expo o ejecutá `npx expo start --web`.
5. En HeidiSQL, verificá el puerto real del servidor: el dump no contiene el puerto. Si no es 3306, cambialo en `backend/.env`. Si aparece `Access denied for user 'root'`, el servidor sí respondió, pero las credenciales de `backend/.env` no coinciden con las de MariaDB/MySQL: corregí `DB_USER`/`DB_PASSWORD` según tu conexión de HeidiSQL. No cambies la contraseña de la base para resolverlo.

### Errores al probar Expo Web

- Si la API muestra `Origen no permitido por CORS: http://localhost:8081`, detené el backend con `Ctrl+C` y volvelo a iniciar desde `backend/` con `npm run dev`. El código permite ese origen local de Expo; un proceso ya iniciado no toma cambios nuevos de configuración.
- Si aparece `Unknown column 'n.id_usuario_destinatario'`, en HeidiSQL seleccioná la base que figura en `backend/.env` como `DB_NAME` y comprobá con `SHOW COLUMNS FROM notificaciones LIKE 'id_usuario_destinatario';`. Si no devuelve filas, abrí y ejecutá **una sola vez** `backend/database/migrations/005_targeted_notifications.sql` (F9). Si la columna ya existe, comprobá que HeidiSQL y `DB_NAME` apunten a la misma base. No vuelvas a ejecutar la migración si la columna ya está creada.
- Reiniciá también Expo tras editar `.env` para que relea las URLs de API.
- Si al aprobar una solicitud aparece `Table '...codigos_acceso_usuario' doesn't exist`, seleccioná en HeidiSQL la base exacta indicada por `DB_NAME` en `backend/.env` (en el error de Sara era `estancia_app_rn1`) y ejecutá `backend/database/migrations/004_user_access_tokens.sql`. La operación de aprobación se revierte si falta esta tabla; después de crearla, volvé a pulsar **Aceptar**. La migración usa `IF NOT EXISTS` y puede ejecutarse si la tabla ya existe.

### Permisos del administrador superior

`administrador` hereda los permisos funcionales y es el único rol autorizado para listar, crear, modificar, ascender y desactivar usuarios, además de aprobar o rechazar solicitudes. Las solicitudes con correo verificado viven en `solicitudes_registro`, no en `usuarios`. Al aprobar una solicitud se crea una cuenta con rol inicial `peon` en estado `pendiente_acceso`; se envía por correo un código numérico de seis dígitos, de un solo uso, válido por 10 minutos. La API guarda solo su HMAC, limita intentos y reenvíos, activa la cuenta y devuelve la sesión normal. Si el envío falla o vence, se puede pedir reenvío desde esa misma pantalla. Después del primer acceso también se puede entrar con el correo y la contraseña elegida al registrarse. El administrador ve las solicitudes en la app, recibe un aviso in-app dirigido a su cuenta y un correo cuando la persona verifica el correo. El rol administrador no se puede asignar desde la API y la cuenta administradora no puede degradarse ni desactivarse. El middleware vuelve a consultar el rol y la versión de sesión en cada llamada para que un usuario desactivado o con permisos modificados pierda sus sesiones anteriores.

En todas las plataformas, los botones de aprobar/denegar muestran una confirmación dentro de la interfaz de EstanciaApp, no usan `Alert` ni el diálogo nativo del navegador. Si la API rechaza la acción, el mensaje de error también se muestra dentro de la app.

`backend/database/migrations/002_single_superadmin_existing_db.sql` adapta la base que esté seleccionada en HeidiSQL; no crea ni selecciona otra. **Antes de ejecutarlo, exportá un respaldo**, porque elimina las otras cuentas e identidades sociales. Conserva los tratamientos pero deja vacío (`NULL`) el veterinario eliminado. Usa `sarawillerslohr08@gmail.com`, que es el correo completo que figura en el dump, y configura `admin123` como contraseña inicial con cambio requerido. Después ejecutá `003_registration_requests_and_admin.sql` para las tablas de solicitudes.

Fuera del entorno local se debe configurar HTTPS y secretos reales mediante el entorno del servidor. Las variables `EXPO_PUBLIC_*` son visibles dentro de la app; no pongas ahí claves SMTP, JWT ni contraseñas.

## Flujo implementado y siguiente etapa

1. El registro móvil envía un código de verificación de correo de 6 dígitos. Este código solo confirma que la persona controla el correo; **no habilita el acceso a la app**. Vence a los 10 minutos, permite 5 intentos y limita reenvíos a uno por minuto y 5 por día.
2. Verificado el correo, la solicitud queda `pendiente_aprobacion` fuera de `usuarios` y no puede iniciar sesión. El administrador superior recibe un aviso por correo y otro en la bandeja in-app, y revisa la pestaña Solicitudes.
3. Solo cuando el administrador acepta, se crea la cuenta con rol inicial `peon`, bloqueada en `pendiente_acceso`, y se genera y envía al correo un código de seis dígitos válido por 10 minutos y de un solo uso. Ese código habilita el primer acceso; la pantalla “Ingresar con código” lo canjea por la sesión de la app. Hay reenvío con límite de frecuencia y cantidad diaria.
4. Registro social: desde **Crear una cuenta**, elegí un proveedor y autorizá EstanciaApp. Si el proveedor entrega un correo, se crea una solicitud verificada por OAuth directamente en `pendiente_aprobacion` (no crea un usuario todavía), se guarda la identidad social pendiente y el administrador recibe aviso por correo e inbox. Al aprobar, se crea el usuario como peón, se vincula la identidad social y se envía el mismo código de acceso de seis dígitos de un solo uso que en el flujo por correo. Al canjearlo, la app pide crear una contraseña; luego puede ingresar tanto con esa contraseña como con el proveedor social. El flujo **Ingresar** sigue exigiendo una cuenta activa y aprobada. Si el proveedor no comparte un correo, se muestra el error para completar el registro por correo.
5. **Operaciones de Etapa 1:** formularios nativos para alta/edición/baja lógica de animales y corrales; Campo permite registrar nacimientos, cambiar animales entre corrales generales y enviar reportes sanitarios; Veterinaria filtra enfermería por su marca, muestra historias clínicas, inicia tratamientos y da altas. La API conserva la validación de capacidad y permisos como autoridad final. Todos los roles pueden abrir la campanita; cada persona recibe avisos globales y dirigidos a su cuenta. Las notificaciones son correo e inbox dentro de la app; no hay notificaciones push del sistema operativo.
6. **Etapa 2 pendiente:** catálogo editable de especies/razas, sexo, relaciones madre/padre, edades, servicios reproductivos, gestación/parto/destete y trazabilidad de pesajes, movimientos e intervenciones. Definir y aplicar esa migración antes de habilitar los formularios asociados.
7. El acceso permite mostrar/ocultar la contraseña y ofrece autocompletado de contraseña en el campo de ingreso para facilitar el uso del gestor del dispositivo. La contraseña nunca se guarda para recordar la sesión: en Android/iOS se persiste el token en SecureStore y en navegador solo en `sessionStorage`.
8. **Recuperar acceso:** la solicitud de código siempre responde con el mismo mensaje, haya o no una cuenta válida. Para cuentas activas, envía un código de seis dígitos; vence en 10 minutos, permite cinco intentos y limita el envío a uno por minuto y cinco por día. El cambio de clave invalida códigos restantes y sesiones anteriores. Los códigos se almacenan como HMAC y no se envía una clave por correo.
9. **Sesiones:** `POST /api/auth/logout` invalida los JWT de la cuenta al aumentar `token_version`. El middleware verifica esa versión vigente en cada solicitud. También cambia al recuperar la contraseña, cambiar el rol o desactivar al usuario. Por ese diseño, cerrar sesión revoca las sesiones de todos los dispositivos de esa cuenta.

En Expo Web, los proveedores vuelven a `SOCIAL_AUTH_FRONTEND_URL` (por defecto `http://localhost:8081`). En Android/iOS, la app recibe el código de un solo uso mediante el esquema `estanciaapp://auth/callback`; para probarlo hace falta una development build que registre el esquema (`npx expo run:android` o `npx expo run:ios`), no Expo Go. Los proveedores deben conservar registrados los callbacks del backend que ya se usaban en R5, por ejemplo `http://localhost:3001/api/auth/google/callback`. Para probar desde un teléfono físico, el backend debe tener una dirección accesible desde el teléfono y el proveedor debe aceptar ese callback; `localhost` solo sirve en la misma computadora.

Los callbacks locales registrados en R5 son:

| Proveedor | Callback del proveedor hacia la API |
| --- | --- |
| Google | `http://localhost:3001/api/auth/google/callback` |
| Facebook | `http://localhost:3001/api/auth/facebook/callback` |
| GitHub | `http://localhost:3001/api/auth/github/callback` |
| Discord | `http://localhost:3001/api/auth/discord/callback` |
| Twitch | `http://localhost:3001/api/auth/twitch/callback` |
| X | `http://localhost:3001/api/auth/twitter/callback` |

El retorno `estanciaapp://auth/callback` es de la API a la app; no reemplaza el callback del proveedor. Los Client ID/Secret se guardan solo en `backend/.env`. La configuración local RN_1 usa las mismas credenciales que R5.

## Endpoints del acceso por token

- `POST /api/auth/register`: crea una solicitud pendiente y manda el código de verificación del correo.
- `POST /api/auth/verify-email`: verifica el correo y deja la solicitud esperando al administrador.
- `POST /api/auth/resend-verification`: reenvía el código de verificación.
- `POST /api/auth/access-token`: canjea el código de seis dígitos posterior a la aprobación y responde JSON con JWT y perfil público.
- `POST /api/auth/resend-access-token`: reenvía el código si la cuenta sigue aprobada y pendiente del primer ingreso. La respuesta no revela si el correo está registrado.
- `POST /api/auth/login`: luego de canjear el token, permite iniciar sesión con el correo y la contraseña que se eligieron en el registro.
- `POST /api/auth/password-recovery/request`: solicita por correo el código temporal; la respuesta no confirma si la cuenta existe.
- `POST /api/auth/password-recovery/reset`: canjea el código y reemplaza la contraseña, revocando las sesiones anteriores.
- `POST /api/auth/logout`: requiere JWT vigente y revoca todas las sesiones de la cuenta.
- `GET /api/notificaciones`: devuelve avisos globales más los dirigidos al usuario autenticado. Solo el administrador, dueño o copropietario puede eliminarlos.

## Comprobación manual cuando la base esté conectada

1. Abrí `http://localhost:3001/api/health`; debe informar `status: "ok"` y `database: "connected"`.
2. En Expo, probá el registro por correo (verificación con código de seis dígitos) y el registro social con una cuenta que no exista todavía. Ambos deben quedar en **Solicitudes** después de verificar/autorizar el correo.
3. Ingresá como administrador: debe aparecer el aviso en la bandeja **Avisos** y cada solicitud en **Solicitudes**.
4. Aceptá la solicitud: debe llegar el token temporal al correo del solicitante.
5. Desde el ingreso elegí **Ingresar con token**, canjealo una vez y confirmá que abre la pantalla de bienvenida. Después probá el modo elegido para ingresar: contraseña si fue registro por correo, o el proveedor social usado para registrarse.

Estos pasos no se pudieron completar contra la base/correo reales en esta revisión: el API local no estaba escuchando en el puerto 3001 y previamente MariaDB rechazó el usuario configurado. Las compilaciones TypeScript sí terminaron sin errores.

## Compatibilidad MySQL / MariaDB

El backend usa `mysql2`, que se comunica con MariaDB y MySQL, y el dump actual identifica explícitamente MariaDB 13.0.2. Eso no demuestra que la cátedra acepte MariaDB en lugar de MySQL; confirmalo con el profesor. La sintaxis nueva deberá probarse contra el motor y versión que se entregarán.
