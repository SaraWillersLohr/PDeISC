# Configurar Gmail API para los correos de EstanciaApp

El backend envía los códigos de registro, acceso y recuperación desde una sola cuenta Gmail por HTTPS. No necesita abrir puertos SMTP ni cambiar el APK. No compartas el client secret ni el refresh token por chat ni los subas al repositorio.

## 1. Preparar Google Cloud

1. Entrá a [Google Cloud Console](https://console.cloud.google.com/) con la cuenta que administrará el proyecto y creá o elegí un proyecto.
2. En **APIs y servicios → Biblioteca**, habilitá **Gmail API**.
3. En **Google Auth Platform → Branding / Audience / Data Access** (los nombres pueden variar), configurá la pantalla de consentimiento. Para una cuenta Gmail personal, elegí **External**. Agregá la cuenta remitente como usuario de prueba mientras esté en Testing.
4. Agregá solo el permiso `https://www.googleapis.com/auth/gmail.send`.
5. En **Clients / Credentials**, creá un **OAuth client ID** de tipo **Web application**. Agregá `https://developers.google.com/oauthplayground` a **Authorized redirect URIs**. Copiá el client ID y el client secret.

## 2. Obtener el refresh token de la cuenta remitente

1. Abrí [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) e iniciá sesión con la cuenta Gmail desde la que se enviarán los mensajes.
2. En el engranaje, marcá **Use your own OAuth credentials**. Pegá el client ID y el client secret del paso anterior. Dejá **OAuth flow: Server-side** y **Access type: Offline**. Si aparece **Force prompt**, elegí **Consent Screen**.
3. En **Step 1**, ingresá `https://www.googleapis.com/auth/gmail.send` en **Input your own scopes**, pulsá **Authorize APIs** y autorizá la cuenta remitente.
4. En **Step 2**, pulsá **Exchange authorization code for tokens**. Copiá el valor **Refresh token**. No uses el access token, porque vence rápidamente.
5. Una vez obtenido el refresh token, podés quitar el redirect URI del Playground del cliente OAuth si agregaste otro URI válido. No revoques el permiso concedido a la app.

**Importante:** con una app externa en estado **Testing**, Google hace vencer el refresh token a los **7 días**. Para un envío estable, pasá la app a **In production** y obtené un token nuevo. Google permite omitir la verificación OAuth en ciertos usos personales (menos de 100 usuarios conocidos personalmente); si tu aplicación sale de ese caso, completá la verificación que solicite para `gmail.send`. Solo la cuenta remitente autoriza este permiso: los usuarios que reciben códigos no pasan por este consentimiento.

## 3. Configurar Render

En **Render → estanciaapp-api → Environment**, guardá estas variables:

| Variable | Valor |
| --- | --- |
| `EMAIL_PROVIDER` | `gmail_api` |
| `GMAIL_CLIENT_ID` | Client ID del cliente OAuth web |
| `GMAIL_CLIENT_SECRET` | Client secret del mismo cliente OAuth |
| `GMAIL_REFRESH_TOKEN` | Refresh token obtenido con esa cuenta Gmail |
| `MAIL_FROM` | `EstanciaApp <tu-cuenta@gmail.com>` (la misma cuenta autorizada, o un alias habilitado para enviar) |

`VERIFICATION_CODE_SECRET` debe seguir configurada y tener al menos 32 caracteres; el Blueprint la genera automáticamente. Las variables SMTP dejan de usarse cuando `EMAIL_PROVIDER=gmail_api`. Después de guardar, esperá a que Render reinicie el servicio. El código nuevo debe estar desplegado antes de probarlo.

## 4. Comprobar el envío

Probá **Recuperar contraseña** con una cuenta activa existente y revisá el buzón y los logs de `estanciaapp-api`. La respuesta HTTP de recuperación es intencionalmente neutra aunque falle el envío; el log mostrará `[auth] No se pudo completar una solicitud de recuperación: ...`. Si ese correo ya pidió un código, esperá al menos un minuto antes de repetirlo.

- `invalid_grant`: refresh token vencido, revocado o generado para otro cliente OAuth; repetí el paso 2.
- `Gmail API rechazó el envío (403)`: revisá que Gmail API esté habilitada y que el token tenga el permiso `gmail.send`.
- `Gmail API rechazó el envío (400)`: revisá `MAIL_FROM` y que corresponda a la cuenta autorizada o a un alias permitido.

La autorización de correo es independiente del inicio de sesión con Google que puede usar el frontend.
