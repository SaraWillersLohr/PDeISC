// inicio el servidor http con la configuración declarada en el entorno.
import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, '0.0.0.0', () => {
  console.info(`api disponible en el puerto ${env.port}`);
});
