# ScanStock

Aplicación móvil para controlar el inventario de un pequeño comercio. La app Expo consume una API REST en Node.js y la API conserva los datos en MariaDB. No se conecta desde el móvil directamente a la base.

## Funcionalidades

- Panel con productos, unidades, stock bajo y vencimientos consultados en MariaDB.
- Alta y edición de productos, código QR/barras y vencimiento opcional.
- Categorías asignables y filtro de inventario.
- Escaneo con cámara o búsqueda manual.
- Entradas y salidas transaccionales con saldo anterior y posterior.
- Historial, tema claro/oscuro/automático, selección y desactivación masiva.

## Tecnologías y estructura

- Frontend: Expo SDK 58, React Native, TypeScript, Expo Router, Expo Camera y AsyncStorage para la preferencia de tema.
- Backend: Node.js, TypeScript, Express y driver oficial `mariadb`.
- Datos: MariaDB/InnoDB, tablas normalizadas de productos, categorías, asociaciones y movimientos.

```text
frontend/  aplicación móvil Expo
backend/   API Express y scripts SQL
```

## Requisitos

Node.js 22.13 o superior, npm, un servidor MariaDB accesible desde la computadora y HeidiSQL u otro cliente SQL. Para APK se necesita una cuenta Expo y EAS CLI.

## Base de datos

1. En HeidiSQL ejecutá `backend/sql/schema.sql`. El script crea y selecciona `scanstock`, y solo crea las tablas si faltan.
2. Opcional: ejecutá `backend/sql/seed.sql` una vez para insertar categorías de muestra (se pueden ejecutar repetidamente sin duplicarlas).
3. Para desarrollo se recomienda crear en MariaDB un usuario propio con permisos mínimos de lectura/escritura sobre `scanstock`; evitá utilizar `root` en la app.

El modelo separa categorías y productos mediante `producto_categorias` (muchos a muchos). `movimientos` registra cada operación; las claves foráneas conservan el historial. La eliminación es lógica mediante `productos.activo`.

## Iniciar backend (PowerShell)

```powershell
cd backend
npm install
Copy-Item .env.example .env
notepad .env
npm run dev
```

En `backend/.env`, configurá `DB_HOST=Estanga`, `DB_PORT=3307`, `DB_NAME=scanstock`, `DB_USER` y `DB_PASSWORD`. Las credenciales se mantienen solo en el backend. La contraseña no debe copiarse al README ni al frontend. El servidor API utiliza el puerto `3000`. Comprobá `http://localhost:3000/api/health`.

Antes de intentar conectarte al servidor, desde PowerShell verificá nombre y puerto:

```powershell
Resolve-DnsName Estanga
Test-NetConnection Estanga -Port 3307
```

Si el nombre no resuelve, necesitás el hostname o IP correcto desde la red donde se encuentre la base; no se debe asumir que `Estanga` es alcanzable desde cualquier red. El archivo `.env.example` usa `scanstock_app` como usuario sugerido; crealo en MariaDB o configurá un usuario de prueba autorizado.

## Iniciar frontend

En otra terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
notepad .env
npx expo start
```

Asigná `EXPO_PUBLIC_API_URL` a la dirección de la API, por ejemplo `http://192.168.1.25:3000`. Para averiguar la IP local, usá `ipconfig` y tomá la dirección IPv4 de la misma red Wi-Fi que el teléfono. `localhost` solo sirve en el emulador/host correspondiente, no en un teléfono físico. Permití el acceso entrante al puerto 3000 solo en la red de prueba si el firewall lo bloquea. El backend debe estar ejecutándose.

Para un APK instalable, usá una API HTTPS. Android puede bloquear HTTP sin cifrar en aplicaciones compiladas; esta configuración mantiene esa protección y no habilita tráfico HTTP globalmente. Expo Go puede tener un comportamiento distinto durante pruebas locales.

Expo Go puede no incluir los módulos nativos que requiere cada SDK; la cámara puede necesitar una compilación de desarrollo compatible. Para Android conectado por USB se puede usar `npx expo run:android` si Android Studio y Android SDK están instalados. No se verificó en un teléfono físico.

## Endpoints principales

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/api/health` | Estado de API y MariaDB |
| GET/POST | `/api/productos` | Listar/crear productos |
| GET/PUT/DELETE | `/api/productos/:id` | Consultar/editar/desactivar |
| GET | `/api/productos/codigo/:codigo` | Búsqueda del escáner |
| POST | `/api/productos/eliminar-multiples` | Desactivación grupal |
| PATCH | `/api/productos/:id/reactivar` | Reactivación |
| GET/POST/PUT/DELETE | `/api/categorias` | Categorías |
| GET/POST | `/api/movimientos` | Historial y nuevo movimiento |
| GET | `/api/productos/:id/movimientos` | Historial por producto |
| GET | `/api/dashboard` | Contadores del panel |

El stock inicial positivo se registra como una entrada inicial. Las entradas/salidas bloquean el producto dentro de una transacción y no permiten saldos negativos. Los productos con stock `<= stock_minimo` cuentan como bajo. Próximos a vencer son los que vencen entre hoy y los próximos siete días inclusive.

## APK con EAS

Configurar antes una URL de API alcanzable por el teléfono en `EXPO_PUBLIC_API_URL`; para distribución fuera de una red local, la API debe tener HTTPS. Luego:

```powershell
cd frontend
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

El perfil `preview` produce APK. El APK contiene solo el cliente móvil: Node.js y MariaDB deben permanecer disponibles en el servidor. No ejecutar EAS Build hasta haber instalado dependencias, comprobado la API y probado la app.

## Escáner, vencimientos y validaciones

La cámara solicita permiso, se bloquea tras una detección mientras consulta la API y ofrece búsqueda manual. Un código no registrado se conserva para iniciar el alta. Cada producto tiene una fecha de vencimiento única y opcional: esta primera versión no contempla lotes con vencimientos distintos ni descuenta stock automáticamente cuando vence. No hay notificaciones push ni sincronización offline.

El backend valida nombre, código, precio, cantidades, categorías y tipo de movimiento. Los errores internos no exponen consultas SQL ni secretos. Esta versión no incluye autenticación y es educativa: restringí la API a una red controlada, no la publiques libremente en Internet.

## Limitaciones conocidas

- La conexión real depende de la resolución de `Estanga`, disponibilidad de MariaDB y las credenciales válidas.
- No hay autenticación, paginación, lotes de vencimiento ni notificaciones.
- La carga del APK y las pruebas físicas requieren cuenta EAS y dispositivo/entorno Android disponibles.
- La interfaz contiene flujos principales; conviene terminar pruebas integrales de categorías, edición, reactivación de inactivos y tamaños/orientaciones antes de entregar.
