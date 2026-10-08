# EstanciaApp — React Native + Expo

Esta carpeta es el proyecto móvil del sistema. Se conservó `bd_final.sql` como el volcado de referencia existente y se agregó una app React Native nativa con Expo y TypeScript. La API Node/Express está en `backend/`; la app no usa WebView ni accede directamente a MariaDB.

## Lo que ya está portado

- Login con correo y contraseña conectado a `POST /api/auth/login`.
- Perfil vigente consultado desde `GET /api/auth/me`.
- Bienvenida como pantalla posterior al login. Recibe `user` como prop tipada, según la consigna.
- Recordar sesión mediante SecureStore; no almacena contraseña.
- Menú y vistas nativas de resumen, animales, corrales, equipo, campo, veterinaria y avisos. Las listas consultan los endpoints existentes.
- API Node/Express copiada para ejecutar el sistema desde esta carpeta. Por defecto apunta a `estancia_app_r5`; `bd_final_rn1.sql` queda como copia opcional y no se necesita para este flujo.

Las vistas operativas son una primera migración nativa de consulta. El registro, la verificación de correo, la aprobación/rechazo del administrador superior, el alta inicial como peón y el cambio posterior de rango están implementados.

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
    ├── database/migrations/ # estado y códigos de verificación
    └── .env.example         # SMTP, DB y secretos de ejemplo
```

## Desarrollo local

Requisitos: Node.js compatible con Expo SDK 57 (22.13 o superior), Expo Go y MariaDB/MySQL local.

1. **Usar tu base existente:** conectate en HeidiSQL y hacé un respaldo antes de cambiarla. No necesitás importar `bd_final_rn1.sql` ni crear otra base. El `.env` apunta por defecto a `estancia_app_r5`; si tu esquema tiene otro nombre, actualizá `DB_NAME`.
2. **Migraciones:** `001_registration_email_verification.sql` agrega el estado de cuenta requerido por el login; ejecutala una vez si esos campos aún no existen. Después ejecutá `002_single_superadmin_existing_db.sql` para conservar solo al administrador y finalmente `003_registration_requests_and_admin.sql` para solicitudes y verificación fuera de `usuarios`. Las migraciones 002 y 003 operan sobre la base seleccionada; no crean otra. El script 002 elimina las demás cuentas e identidades sociales. No vuelvas a ejecutar migraciones ya aplicadas.
3. **Backend:** copiá `backend/.env.example` como `backend/.env`, ajustá host, puerto, usuario, contraseña y `DB_NAME` a la base elegida. En Windows PowerShell clásico generá cada secreto con:

   ```powershell
   $bytes = New-Object byte[] 32
   $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $rng.GetBytes($bytes)
   [BitConverter]::ToString($bytes).Replace('-', '')
   $rng.Dispose()
   ```

   Ejecutá el bloque tres veces y usá valores diferentes para `JWT_SECRET`, `SESSION_SECRET` y `VERIFICATION_CODE_SECRET`. Revocá la clave de aplicación de Gmail que se compartió en el chat y guardá una nueva solo en `SMTP_PASS` del `.env` local (ignorado por Git). Luego, desde `backend/`, ejecutá `npm install` y `npm run dev`.
4. **Expo:** copiá `.env.example` como `.env`. Usá `http://10.0.2.2:3001/api` en Android Emulator, `http://localhost:3001/api` en simulador iOS, o la IP LAN de la PC en un teléfono físico. Iniciá `npm install` y `npm start` desde `RN_1/` y abrí Expo Go.
5. En HeidiSQL, verificá el puerto real del servidor: el dump no contiene el puerto. Si no es 3306, cambialo en `backend/.env`.

### Permisos del administrador superior

`administrador` hereda los permisos funcionales y es el único rol autorizado para listar, crear, modificar, ascender y desactivar usuarios, además de aprobar o rechazar solicitudes. Las solicitudes con correo verificado viven en `solicitudes_registro`, no en `usuarios`; al aprobarlas se crea una cuenta activa con rol inicial `peon`. El administrador puede ascenderla luego a veterinario, copropietario o dueño. El rol administrador no se puede asignar desde la API y la cuenta administradora no puede degradarse ni desactivarse. El middleware vuelve a consultar el rol activo en cada llamada para que una sesión existente no conserve permisos luego de un cambio de rango.

`backend/database/migrations/002_single_superadmin_existing_db.sql` adapta la base que esté seleccionada en HeidiSQL; no crea ni selecciona otra. **Antes de ejecutarlo, exportá un respaldo**, porque elimina las otras cuentas e identidades sociales. Conserva los tratamientos pero deja vacío (`NULL`) el veterinario eliminado. Usa `sarawillerslohr08@gmail.com`, que es el correo completo que figura en el dump, y configura `admin123` como contraseña inicial con cambio requerido. Después ejecutá `003_registration_requests_and_admin.sql` para las tablas de solicitudes.

Fuera del entorno local se debe configurar HTTPS y secretos reales mediante el entorno del servidor. Las variables `EXPO_PUBLIC_*` son visibles dentro de la app; no pongas ahí claves SMTP, JWT ni contraseñas.

## Flujo implementado y siguiente etapa

1. El registro móvil envía código de 6 dígitos al correo. Vence a los 10 minutos, permite 5 intentos y limita los reenvíos a uno por minuto y 5 por día.
2. Verificado el correo, la solicitud queda `pendiente_aprobacion` fuera de `usuarios` y no puede iniciar sesión.
3. El administrador superior acepta o rechaza la solicitud desde la app. Al aceptarla se crea la cuenta con rol inicial `peon`; se envía un aviso por correo.
4. Después: Google móvil con vinculación de identidad y el mismo proceso. Passport actual es web y no está conectado a Expo.
5. Completar formularios nativos para CRUD y acciones veterinarias, con autorización también aplicada en el backend.

Google nativo requiere una development build porque sus módulos usan código nativo; no se puede probar con Expo Go. Se puede compilar en local con Android Studio/SDK usando `npx expo run:android`; EAS no es obligatorio. Consultar la [guía oficial de Google para Expo](https://docs.expo.dev/guides/google-authentication/).

## Compatibilidad MySQL / MariaDB

El backend usa `mysql2`, que se comunica con MariaDB y MySQL, y el dump actual identifica explícitamente MariaDB 13.0.2. Eso no demuestra que la cátedra acepte MariaDB en lugar de MySQL; confirmalo con el profesor. La sintaxis nueva deberá probarse contra el motor y versión que se entregarán.
