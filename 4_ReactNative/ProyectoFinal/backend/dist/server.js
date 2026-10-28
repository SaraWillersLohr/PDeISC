// inicio el servidor http con la configuración declarada en el entorno.
import { app } from './app.js';
import { env } from './config/env.js';
import { publishBirthReminders } from './controllers/modulesController.js';
import { synchronizeAssociationEvents } from './services/eventSources.js';
app.listen(env.port, '0.0.0.0', () => {
    console.info(`api disponible en el puerto ${env.port}`);
    const publish = () => {
        void publishBirthReminders().catch((error) => {
            const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'UNKNOWN';
            console.error(`No se pudieron procesar los recordatorios de nacimiento (${code}).`);
        });
    };
    publish();
    setInterval(publish, 60 * 60 * 1000);
    const syncEvents = () => {
        void synchronizeAssociationEvents().catch((error) => {
            const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'UNKNOWN';
            console.error(`No se pudieron actualizar las agendas de asociaciones (${code}).`);
        });
    };
    syncEvents();
    setInterval(syncEvents, 7 * 24 * 60 * 60 * 1000);
});
