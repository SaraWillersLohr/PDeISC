# Backend de EstanciaApp

Configurá `.env` con la conexión a una base que ya tenga las tablas base del proyecto. Antes de iniciar la API, ejecutá:

```sh
npm run db:migrate
npm run dev
```

`db:migrate` crea las tablas operativas que faltan y agrega las columnas necesarias para inventario, movimientos, enfermería y módulos productivos. Se puede repetir: conserva registros y omite las columnas existentes. No ejecuta los scripts de limpieza de datos ni cambia usuarios, contraseñas o roles.

Si el inventario responde con un error, revisá la salida del backend: registra el código del error de base sin mostrar credenciales. Después de aplicar las migraciones, reintentá la carga del inventario.
