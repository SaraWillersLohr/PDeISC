/**
 * este es el servidor del analizador de números.
 * acá recibo los archivos, los valido de forma estricta y genero las exportaciones.
 */

import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { procesarDato } from './modulos/numberProcessor.js';

const rutaArchivo = fileURLToPath(import.meta.url);
const directorioActual = path.dirname(rutaArchivo);

const servidor = express();
const puertoServidor = 3001;

// configuro multer para que sea muy estricto con lo que recibe
const almacenamiento = multer.diskStorage({
    destination: (peticion, archivo, callback) => {
        callback(null, path.join(directorioActual, 'archivos-subidos'));
    },
    filename: (peticion, archivo, callback) => {
        // le pongo un nombre seguro
        const nombreLimpio = archivo.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        callback(null, `analisis_${Date.now()}_${nombreLimpio}`);
    }
});

const subida = multer({ 
    storage: almacenamiento,
    limits: { fileSize: 2 * 1024 * 1024 }, // máximo 2 megas
    fileFilter: (peticion, archivo, callback) => {
        const extension = path.extname(archivo.originalname).toLowerCase();
        const tipoMime = archivo.mimetype;
        // acá valido que sea solo txt por fuera
        if (extension !== '.txt' || tipoMime !== 'text/plain') {
            return callback(new Error('FORMATO_PROHIBIDO'), false);
        }
        callback(null, true);
    }
}).single('archivo');

// middlewares
servidor.use(express.json());
servidor.use('/paginas', express.static(path.join(directorioActual, 'paginas')));
servidor.use('/estilos', express.static(path.join(directorioActual, 'estilos')));
servidor.use('/scripts', express.static(path.join(directorioActual, 'scripts')));
servidor.use('/modulos', express.static(path.join(directorioActual, 'modulos')));

// cargo la página del dashboard
servidor.get('/', (peticion, respuesta) => {
    respuesta.sendFile(path.join(directorioActual, 'paginas', 'index.html'));
});

// manejo de configuración de tema
servidor.post('/api/configuracion', async (peticion, respuesta) => {
    try {
        await fs.writeFile(path.join(directorioActual, 'configuracion.json'), JSON.stringify(peticion.body, null, 2));
        respuesta.json({ success: true });
    } catch (e) { respuesta.status(500).json({ error: 'error' }); }
});

servidor.get('/api/configuracion', async (peticion, respuesta) => {
    try {
        const datosConfiguracion = await fs.readFile(path.join(directorioActual, 'configuracion.json'), 'utf-8');
        respuesta.json(JSON.parse(datosConfiguracion));
    } catch (e) { respuesta.json({ tema: 'dark' }); }
});

/**
 * esta es la ruta principal de subida. acá valido el contenido real del txt.
 */
servidor.post('/api/subir-archivo', (peticion, respuesta) => {
    subida(peticion, respuesta, async (errorMulter) => {
        if (errorMulter) {
            if (errorMulter.message === 'FORMATO_PROHIBIDO') {
                return respuesta.status(400).json({ error: 'Solo aceptamos archivos .txt reales.' });
            }
            return respuesta.status(400).json({ error: 'Error al subir el archivo.' });
        }

        if (!peticion.file) {
            return respuesta.status(400).json({ error: 'No mandaste ningún archivo.' });
        }

        try {
            const contenidoTexto = await fs.readFile(peticion.file.path, 'utf-8');
            
            // si tiene caracteres nulos, es un binario disfrazado
            if (contenidoTexto.includes('\0')) {
                await fs.unlink(peticion.file.path);
                return respuesta.status(400).json({ error: 'Este archivo no es texto puro.' });
            }

            // separo por líneas o por comas
            let lineasExtraidas = [];
            if (contenidoTexto.includes(',')) {
                lineasExtraidas = contenidoTexto.split(',').map(item => item.trim());
            } else {
                lineasExtraidas = contenidoTexto.split(/\r?\n/).map(item => item.trim());
            }

            // acá aplico la validación estricta de contenido:
            // el txt solo debe tener números válidos, nada de texto raro como "hola"
            const lineasLimpias = lineasExtraidas.filter(l => l !== '');
            
            for (let linea of lineasLimpias) {
                const testDato = procesarDato(linea);
                if (!testDato.valido) {
                    await fs.unlink(peticion.file.path);
                    return respuesta.status(400).json({ 
                        error: `Contenido inválido detectado: "${linea}". El archivo solo debe tener números.` 
                    });
                }
            }

            respuesta.json({ 
                success: true, 
                lineas: lineasLimpias,
                fileName: peticion.file.originalname 
            });

        } catch (error) {
            respuesta.status(500).json({ error: 'No pude leer el archivo.' });
        }
    });
});

/**
 * ruta para exportar los útiles filtrados a un nuevo txt
 */
servidor.post('/api/exportar-resultados', async (peticion, respuesta) => {
    const { datos } = peticion.body;
    if (!datos || !Array.isArray(datos)) return respuesta.status(400).json({ error: 'faltan los datos' });
    
    const nombreResultado = `resultado_filtrado_${Date.now()}.txt`;
    const rutaCarpetaExport = path.join(directorioActual, 'archivos-generados');
    const rutaFinal = path.join(rutaCarpetaExport, nombreResultado);
    
    try {
        await fs.mkdir(rutaCarpetaExport, { recursive: true });
        await fs.writeFile(rutaFinal, datos.join('\r\n'), 'utf-8');
        respuesta.json({ success: true, fileName: nombreResultado });
    } catch (e) { respuesta.status(500).json({ error: 'no pude exportar' }); }
});

// nueva ruta para listar los archivos que ya están en el servidor
servidor.get('/api/listar-archivos', async (peticion, respuesta) => {
    try {
        const rutaSubidos = path.join(directorioActual, 'archivos-subidos');
        const rutaGenerados = path.join(directorioActual, 'archivos-generados');
        
        // aseguro que ambas carpetas existan
        await fs.mkdir(rutaSubidos, { recursive: true });
        await fs.mkdir(rutaGenerados, { recursive: true });
        
        const subidos = await fs.readdir(rutaSubidos);
        const generados = await fs.readdir(rutaGenerados);
        
        // combino y filtro solo los .txt
        const todos = [...subidos, ...generados].filter(f => f.endsWith('.txt'));
        
        // elimino duplicados por las dudas
        const unicos = [...new Set(todos)];
        
        respuesta.json({ success: true, archivos: unicos });
    } catch (e) {
        respuesta.status(500).json({ error: 'no pude listar los archivos' });
    }
});

// nueva ruta para leer el contenido de un archivo del servidor (busca en ambas carpetas)
servidor.get('/api/leer-archivo/:nombre', async (peticion, respuesta) => {
    try {
        const nombre = peticion.params.nombre;
        const rutaSubidos = path.join(directorioActual, 'archivos-subidos', nombre);
        const rutaGenerados = path.join(directorioActual, 'archivos-generados', nombre);
        
        let contenidoTexto = '';
        try {
            contenidoTexto = await fs.readFile(rutaSubidos, 'utf-8');
        } catch (e) {
            // si no está en subidos, busco en generados
            contenidoTexto = await fs.readFile(rutaGenerados, 'utf-8');
        }
        
        let lineasExtraidas = [];
        if (contenidoTexto.includes(',')) {
            lineasExtraidas = contenidoTexto.split(',').map(item => item.trim());
        } else {
            lineasExtraidas = contenidoTexto.split(/\r?\n/).map(item => item.trim());
        }
        
        respuesta.json({ 
            success: true, 
            lineas: lineasExtraidas.filter(l => l !== ''),
            fileName: nombre 
        });
    } catch (e) {
        respuesta.status(500).json({ error: 'no pude leer el archivo del servidor' });
    }
});

// ruta para descargar archivos generados
servidor.get('/api/descargar/:nombreArchivo', (peticion, respuesta) => {
    const rutaAbsoluta = path.join(directorioActual, 'archivos-generados', peticion.params.nombreArchivo);
    respuesta.download(rutaAbsoluta);
});

servidor.listen(puertoServidor, () => {
    console.log(`servidor del analizador listo en http://localhost:${puertoServidor}`);
});
