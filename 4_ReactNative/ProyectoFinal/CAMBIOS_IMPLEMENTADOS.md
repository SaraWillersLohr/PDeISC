# Cambios implementados en EstanciaApp

## Navegación responsive

- En dispositivos móviles se utiliza un menú hamburguesa.
- El botón del menú está ubicado a la izquierda y la marca EstanciaApp a la derecha.
- El panel se abre desde el mismo lado que el botón.
- El menú contiene todas las secciones permitidas para el rol autenticado.
- En escritorio se conserva el panel lateral.

## Inicio

- Se eliminaron los indicadores que repetían la información de las estadísticas.
- Se mantienen las estadísticas mediante gráficos de diferentes colores.
- Se agregaron accesos directos adecuados para cada rol.
- La sección anteriormente llamada "Mapa del campo" ahora se llama "Mi campo".

## Mi perfil

Todos los roles pueden:

- Elegir o quitar una foto de perfil.
- Modificar su nombre y apellido.
- Cambiar su contraseña ingresando primero la contraseña actual.
- Recuperar la contraseña mediante un código enviado por correo.

El cambio de contraseña fue comprobado con un usuario temporal. El backend rechazó una contraseña actual incorrecta y aceptó correctamente la contraseña válida. El usuario temporal fue eliminado después de la prueba.

## Correos y recuperación de contraseña

La conexión SMTP de Gmail fue verificada correctamente.

El envío no funcionaba porque en la base conectada faltaban:

- La columna `usuarios.token_version`.
- La tabla `codigos_recuperacion_password`.

Se corrigió la migración `backend/migrations/002_password_recovery.sql` y se aplicó en la base local. También se envió correctamente un correo de recuperación de prueba a una cuenta activa registrada.

Los códigos:

- Tienen seis dígitos.
- Vencen después de diez minutos.
- Poseen límite de intentos y de reenvíos.
- Se almacenan como un resumen HMAC, no como texto visible.

## Pantalla de carga

- Durante la restauración de la sesión aparece nuevamente el logo de EstanciaApp con un indicador de carga.
- Se agregó y configuró `expo-splash-screen` para mostrar el ícono durante el inicio nativo.
- La pantalla utiliza el fondo verde institucional.

## Formulario de ingreso

- El botón principal ocupa correctamente el ancho disponible.
- Se corrigió su alineación.
- En pantallas angostas, las opciones de sesión y recuperación se acomodan verticalmente.
- Se redujeron los márgenes laterales para evitar cortes en teléfonos pequeños.

## Verificaciones realizadas

- TypeScript del frontend: correcto.
- Compilación TypeScript del backend: correcta.
- Configuración pública de Expo: correcta.
- Lint de los archivos modificados: correcto.
- Conexión SMTP: correcta.
- Envío real de correo de recuperación: correcto.
- Cambio de contraseña con contraseña actual válida: correcto.
- Rechazo de una contraseña actual incorrecta: correcto.
- Estructura de recuperación en la base de datos: correcta.

El lint completo todavía informa seis errores anteriores relacionados con actualizaciones de estado dentro de efectos en otros módulos. No corresponden a los cambios descritos en este documento.
