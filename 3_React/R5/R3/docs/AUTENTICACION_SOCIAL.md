# Autenticación social

## Objetivo

El login local sigue disponible. OAuth agrega Google, Facebook/Meta, GitHub, Discord, Twitch y X como una alternativa, pero nunca crea automáticamente un empleado: la cuenta debe tener un correo ya registrado y activo en `usuarios`.

## Modelo relacional y 3FN

`identidades_sociales` es una tabla hija de `usuarios`. Guarda sólo `proveedor` y `proveedor_usuario_id`, cuyo par es único. Así no se repiten esos datos en la tabla de usuarios ni se modifica su rol, contraseña ni las relaciones existentes. Cada usuario puede vincular una identidad por proveedor.

Aplicar la tabla en una base existente es no destructivo: ejecutar una sola vez `backend/database/migrations/001_create_identidades_sociales.sql`. No ejecutar el esquema completo sobre una base de R3 ya usada: además de las tablas contiene seeds que pueden actualizar datos de demostración.

## Flujo de seguridad

1. El navegador abre `GET /api/auth/:provider` en el backend.
2. Passport redirige al proveedor con `state`; Express conserva el valor en una cookie de sesión `HttpOnly`, `SameSite=Lax` y temporal.
3. El callback obtiene el email del proveedor, busca un usuario activo con ese correo y verifica que la identidad externa no esté asignada a otra persona.
4. Se crea la relación social en el primer uso. No se guardan tokens del proveedor.
5. El backend redirige al frontend con un código aleatorio, de un uso y válido por 60 segundos; nunca agrega el JWT a la URL.
6. React canjea el código en `POST /api/auth/social/exchange`, recibe el JWT ya usado por la app y aplica sus rutas y roles actuales.

## Configuración

Copiar `backend/.env.example` a `backend/.env` y definir `SESSION_SECRET`, `SOCIAL_AUTH_API_URL`, `SOCIAL_AUTH_FRONTEND_URL` y el Client ID/Secret de cada proveedor. Mantener `.env` fuera de Git.

Usando los puertos actuales, registrar estas Redirect URI exactas:

| Proveedor | Redirect URI |
| --- | --- |
| Google | `http://localhost:3001/api/auth/google/callback` |
| Facebook | `http://localhost:3001/api/auth/facebook/callback` |
| GitHub | `http://localhost:3001/api/auth/github/callback` |
| Discord | `http://localhost:3001/api/auth/discord/callback` |
| Twitch | `http://localhost:3001/api/auth/twitch/callback` |
| X | `http://localhost:3001/api/auth/twitter/callback` |

Un proveedor sin sus dos credenciales permanece deshabilitado y muestra un mensaje claro. GitHub requiere `user:email`; Discord `identify,email`; Twitch `user:read:email`. Facebook y X pueden no entregar correo según permisos o configuración de la cuenta: en ese caso se rechaza el ingreso para proteger la lista blanca.

## Variables del frontend

En desarrollo no se necesita configurar nada: los botones usan `http://localhost:3001/api`. Si el frontend y backend se publican detrás de dominios distintos, crear `frontend/.env` con `VITE_API_BASE_URL=https://tu-api.example/api` y usar HTTPS en producción.

## Escalabilidad

Para la entrega local, Express mantiene la sesión OAuth y el código de 60 segundos en memoria; esto permite el flujo sin infraestructura extra. En una publicación con más de un proceso o servidor, reemplazar el `MemoryStore` de `express-session` y el `Map` de códigos por Redis u otro almacén compartido con TTL. La API falla al arrancar en producción si falta `SESSION_SECRET`.

## Prueba manual

1. Ejecutar la migración y crear en `usuarios` un usuario activo con el mismo email de una cuenta de prueba del proveedor.
2. Configurar las credenciales y callback URI en el panel del proveedor.
3. Iniciar backend (`npm run dev`) y frontend (`npm run dev`).
4. Elegir el proveedor; al retornar, verificar que se conserva el rol y que se crea una fila en `identidades_sociales`.
5. Probar con una cuenta cuyo email no esté en `usuarios`: debe volver a `/login` sin emitir JWT.
