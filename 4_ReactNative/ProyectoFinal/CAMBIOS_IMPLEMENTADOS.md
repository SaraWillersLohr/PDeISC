# Cambios implementados en EstanciaApp

## Navegación responsive

- En dispositivos móviles se utiliza un menú hamburguesa.
- El botón del menú está ubicado a la izquierda y la marca EstanciaApp a la derecha.
- El panel se abre desde el mismo lado que el botón.
- El menú contiene todas las secciones permitidas para el rol autenticado.
- En escritorio se conserva el panel lateral.

## Animales y catálogo

- El listado muestra una ficha consultable con identificador, especie, raza, ubicación, estado sanitario, fecha de nacimiento, edad calculada y último peso. La búsqueda también encuentra por especie.
- Se ordenó el alta de animales en pasos claros: identificador manual obligatorio, nombre opcional, especie, raza de esa especie, fecha de nacimiento opcional, peso inicial opcional y corral general con capacidad disponible.
- La edad se calcula a partir de la fecha de nacimiento; no se guarda un valor de edad que quede desactualizado. Las fechas se validan y no se aceptan fechas inexistentes o futuras.
- El backend rechaza identificadores duplicados con un mensaje comprensible y evita crear animales directamente en enfermería. El ingreso a enfermería sigue el flujo sanitario de movimiento.
- El dueño puede abrir “Especies y razas”, agregar especies y crear cada raza desde la tarjeta de su especie. El administrador conserva estas acciones y la revisión de propuestas pendientes.
- El peón consulta el mismo catálogo y puede proponer una especie o una raza eligiendo la especie de una lista; las propuestas siguen pendientes de aprobación administrativa según los requisitos.
- Las altas directas de especies y razas se protegen por rol y se registran en la auditoría.
- Un acceso directo a Animales del veterinario abre enfermería, que solo consulta animales ubicados allí.
- Los errores al cargar animales y corrales se muestran por separado; un fallo al cargar corrales ya no oculta una lista de animales que sí pudo cargar.
- El peón puede seleccionar como destino corrales generales o de enfermería con lugar disponible. El backend sigue exigiendo el alta veterinaria para sacar un animal de enfermería.

La caravana/identificador es obligatoria y siempre la ingresa la persona; no se genera automáticamente. Para la edad, esta implementación usa la fecha de nacimiento si está disponible.

## Conexión local con la API

- El backend y la configuración web utilizan el puerto `3010`, disponible en el entorno local. El puerto anterior `3001` estaba reservado por Windows e impedía iniciar la API.
- Se alinearon la configuración local, los archivos de ejemplo y el valor de respaldo utilizado por la aplicación.
- Se corrigió el origen de red local declarado en CORS para incluir el protocolo HTTP.

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
- Lint completo del frontend: correcto.
- Conexión SMTP: correcta.
- Envío real de correo de recuperación: correcto.
- Cambio de contraseña con contraseña actual válida: correcto.
- Rechazo de una contraseña actual incorrecta: correcto.
- Estructura de recuperación en la base de datos: correcta.

Para el flujo de animales y catálogo se verificaron el lint completo del frontend y las compilaciones TypeScript del frontend y backend. No se ejecutaron operaciones contra la base de datos ni una prueba visual del flujo conectado al servidor.
