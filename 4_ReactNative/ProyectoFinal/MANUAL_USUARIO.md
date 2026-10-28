# Manual de usuario de EstanciaApp

## Acceso

1. Abrí EstanciaApp e ingresá con el correo y la contraseña de una cuenta aprobada.
2. Si todavía no tenés cuenta, solicitá acceso con tu correo. Verificá el código que recibas y esperá la aprobación del administrador.
3. Al aprobar la solicitud, el administrador asigna el rol y envía un código de activación. Usalo para ingresar por primera vez.
4. Desde **Mi perfil** podés actualizar tus datos, cambiar la contraseña y cerrar la sesión.

La conexión con Google, Facebook o GitHub solo permite ingresar si ya existe una cuenta activa aprobada con el mismo correo verificado.

## Navegación por rol

- **Administrador:** administra solicitudes de acceso, cuentas, tareas y catálogos; revisa muertes pendientes y puede consultar enfermería.
- **Dueño:** consulta indicadores, animales, corrales, reproducción, eventos, equipo y sanidad; administra corrales y catálogo.
- **Peón:** consulta animales y tareas; registra pesajes, movimientos, reportes sanitarios, muertes, servicios de monta y nacimientos. No cambia la capacidad de corrales.
- **Veterinario:** consulta animales en enfermería, registra tratamientos y notas, cambia el diagnóstico y da el alta médica. El peón registra después el traslado físico fuera de enfermería.

Las opciones visibles dependen del rol y el servidor vuelve a comprobar cada permiso.

## Animales y corrales

- Abrí **Mis animales** para buscar, revisar la ficha y cargar altas o ediciones permitidas.
- Desde la ficha podés registrar un pesaje o movimiento si tu rol lo permite.
- Para informar una enfermedad, elegí el corral de enfermería disponible; el animal y el reporte se guardan como una operación conjunta.
- Para informar una muerte desde el rol de peón, obtené la ubicación GPS y enviá el reporte. La baja operativa evita nuevos movimientos y el reporte queda pendiente de revisión administrativa. Si se rechaza, el administrador debe dejar el motivo y el animal se reactiva.
- El dueño puede dar de baja la ficha por venta, muerte u otro motivo, conservando el historial. También puede eliminar definitivamente una ficha inactiva después de confirmar.
- **Mi estancia** permite consultar y editar corrales según el rol. No se puede reducir la capacidad por debajo de la ocupación ni dar de baja un corral con animales activos.

## Reproducción, tareas y avisos

- **Reproducción** muestra montas recientes, preñeces confirmadas y nacimientos. Para confirmar una preñez se calcula la fecha estimada según la especie.
- **Tareas** permite al peón actualizar el estado de sus tareas y al administrador asignar tareas.
- La campana muestra avisos dirigidos al usuario o a su rol. Abrí el módulo relacionado para revisar los animales involucrados.

## Sin conexión

La app conserva localmente las listas consultadas de animales, corrales y enfermería. Puede encolar pesajes, traslados, reportes sanitarios, muertes con GPS y notas veterinarias; al volver la conexión, el servidor procesa cada operación con un identificador único para que un reintento no duplique escrituras.

Una muerte encolada queda marcada como baja operativa en el dispositivo; al sincronizar, el backend registra el reporte pendiente de revisión. Si una operación no puede aplicarse, la app conserva el cambio y muestra el motivo. No cierres sesión ni borres los datos de la app hasta que el contador de operaciones pendientes llegue a cero.

## Ayuda

Si la app informa un error de permisos, pedile al administrador que revise tu rol. Si informa un problema de conexión o migración, compartí con el administrador el mensaje visible y la fecha aproximada; no envíes contraseñas ni códigos de activación.
