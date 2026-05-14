/**
 * este es el servidor del generador de números.
 * acá manejo las rutas para guardar el tema y generar el archivo txt físico.
 */

import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const rutaArchivo = fileURLToPath(import.meta.url);
const directorioActual = path.dirname(rutaArchivo);

const servidor = express();
const puertoServidor = 3000;

// configuro los middlewares necesarios
servidor.use(express.json());
servidor.use('/paginas', express.static(path.join(directorioActual, 'paginas')));
servidor.use('/estilos', express.static(path.join(directorioActual, 'estilos')));
servidor.use('/scripts', express.static(path.join(directorioActual, 'scripts')));
servidor.use('/modulos', express.static(path.join(directorioActual, 'modulos')));

// cargo la página principal
servidor.get('/', (peticion, respuesta) => {
    respuesta.sendFile(path.join(directorioActual, 'paginas', 'index.html'));
});

// acá guardo la preferencia del tema (oscuro/claro) en un archivito json
servidor.post('/api/configuracion', async (peticion, respuesta) => {
    try {
        const rutaConfig = path.join(directorioActual, 'configuracion.json');
        await fs.writeFile(rutaConfig, JSON.stringify(peticion.body, null, 2));
        respuesta.json({ success: true });
    } catch (error) {
        respuesta.status(500).json({ error: 'error al guardar la config' });
    }
});

// devuelvo la configuración guardada
servidor.get('/api/configuracion', async (peticion, respuesta) => {
    try {
        const rutaConfig = path.join(directorioActual, 'configuracion.json');
        const contenidoConfig = await fs.readFile(rutaConfig, 'utf-8');
        respuesta.json(JSON.parse(contenidoConfig));
    } catch (error) {
        respuesta.json({ tema: 'dark' });
    }
});

// acá es donde sucede la magia: genero el archivo txt real en el disco
servidor.post('/api/generar-txt', async (peticion, respuesta) => {
    const { numeros, nombre } = peticion.body;
    
    if (!numeros || !Array.isArray(numeros)) {
        return respuesta.status(400).json({ error: 'faltan los números' });
    }

    const nombreArchivoFinal = `${nombre}_${Date.now()}.txt`;
    const rutaCarpetaDestino = path.join(directorioActual, 'archivos-generados');
    const rutaCompletaArchivo = path.join(rutaCarpetaDestino, nombreArchivoFinal);

    try {
        // me aseguro de que la carpeta exista
        await fs.mkdir(rutaCarpetaDestino, { recursive: true });
        
        // escribo los números uno por línea, usando saltos de línea universales
        const textoParaGuardar = numeros.join('\r\n');
        await fs.writeFile(rutaCompletaArchivo, textoParaGuardar, 'utf-8');

        respuesta.json({ success: true, fileName: nombreArchivoFinal });
    } catch (error) {
        respuesta.status(500).json({ error: 'no pude crear el archivo' });
    }
});

// esta ruta sirve para descargar el archivo que generamos recién
servidor.get('/api/descargar/:nombreArchivo', (peticion, respuesta) => {
    const nombreParaDescargar = peticion.params.nombreArchivo;
    const rutaDelArchivo = path.join(directorioActual, 'archivos-generados', nombreParaDescargar);
    respuesta.download(rutaDelArchivo);
});

// arranco el servidor en el puerto 3000
servidor.listen(puertoServidor, () => {
    console.log(`servidor del generador listo en http://localhost:${puertoServidor}`);
});
