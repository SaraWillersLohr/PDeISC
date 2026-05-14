/**
 * acá manejo toda la lógica del analizador de números.
 * proceso los archivos subidos, resuelvo ambigüedades y calculo estadísticas.
 */

import { procesarDato } from '../modulos/numberProcessor.js';

// estado de mi aplicación para el análisis
let lineasBrutas = [];
let objetosProcesados = [];
let indiceDudaActual = -1;
let indicesAmbiguos = [];
let temaVisual = 'dark';

// busco los elementos que voy a manipular en el dom
const entradaArchivo = document.getElementById('file-input');
const zonaDrop = document.getElementById('drop-area');
const feedbackArchivo = document.getElementById('info-archivo');
const contenedorResultados = document.getElementById('resultados-analisis');
const contenedorUtiles = document.getElementById('lista-utiles');
const seccionEstadisticas = document.getElementById('seccion-stats');
const botonExportar = document.getElementById('btn-exportar');
const seccionExportacion = document.getElementById('seccion-exportar');
const interruptorTema = document.getElementById('theme-toggle');
const enlaceTema = document.getElementById('theme-link');
const botonIrArriba = document.getElementById('back-to-top');

// indicadores de estadísticas
const visorUtiles = document.getElementById('stat-utiles');
const visorInvalidos = document.getElementById('stat-invalidos');
const visorFactoriales = document.getElementById('stat-factorials');
const visorPorcentaje = document.getElementById('stat-porcentaje');

// inicio la configuración visual
async function cargarPreferencias() {
    try {
        const respuesta = await fetch('/api/configuracion');
        const datosConfiguracion = await respuesta.json();
        aplicarTema(datosConfiguracion.tema || 'dark');
    } catch (e) { aplicarTema('dark'); }
}

function aplicarTema(tema) {
    temaVisual = tema;
    enlaceTema.href = `/estilos/${tema}.css`;
    const icono = interruptorTema.querySelector('i');
    icono.className = tema === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

async function cambiarModoVisual() {
    const proximoTema = temaVisual === 'dark' ? 'light' : 'dark';
    aplicarTema(proximoTema);
    await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: proximoTema })
    });
}

/**
 * valido el archivo antes de mandarlo al servidor
 */
function esArchivoValido(archivo) {
    if (!archivo) return false;
    const extension = archivo.name.split('.').pop().toLowerCase();
    
    if (extension !== 'txt') {
        mostrarErrorVisual("Solo aceptamos archivos .txt reales.");
        return false;
    }
    
    if (archivo.size > 2 * 1024 * 1024) {
        mostrarErrorVisual("El archivo es muy pesado para ser solo texto.");
        return false;
    }
    
    return true;
}

function mostrarErrorVisual(mensaje) {
    feedbackArchivo.innerHTML = `
        <div class="alert alert-danger fade-in py-2 px-3 small d-flex align-items-center rounded-3">
            <i class="fa-solid fa-circle-xmark me-2"></i>
            <span>${mensaje}</span>
        </div>
    `;
    contenedorResultados.innerHTML = '<div class="text-center py-5 opacity-25"><p>Esperando análisis...</p></div>';
    seccionEstadisticas.classList.add('d-none');
    seccionExportacion.classList.add('d-none');
}

/**
 * subo el archivo al servidor y espero las líneas
 */
async function procesarSubidaDeArchivo(archivo) {
    if (!esArchivoValido(archivo)) return;

    feedbackArchivo.innerHTML = `<div class="text-primary small fade-in"><i class="fa-solid fa-sync fa-spin me-1"></i> Validando: ${archivo.name}</div>`;
    
    const formulario = new FormData();
    formulario.append('archivo', archivo);

    try {
        contenedorResultados.innerHTML = '<div class="text-center py-5"><i class="fa-solid fa-magnifying-glass fa-spin fa-2x mb-3"></i><p>Escaneando contenido...</p></div>';
        
        const respuesta = await fetch('/api/subir-archivo', { method: 'POST', body: formulario });
        const data = await respuesta.json();

        if (data.success) {
            feedbackArchivo.innerHTML = `<div class="text-success small fade-in"><i class="fa-solid fa-check-double me-1"></i> Archivo cargado correctamente</div>`;
            lineasBrutas = data.lineas;
            comenzarAnalisisProfundo();
        } else {
            mostrarErrorVisual(data.error);
        }
    } catch (error) {
        mostrarErrorVisual("No pude conectar con el servidor.");
    }
}

/**
 * acá empiezo a analizar línea por línea y detecto ambigüedades
 */
function comenzarAnalisisProfundo() {
    objetosProcesados = [];
    indicesAmbiguos = [];
    
    lineasBrutas.forEach((linea, pos) => {
        const info = procesarDato(linea);
        if (info.esAmbiguo) {
            indicesAmbiguos.push(pos);
        } else {
            objetosProcesados[pos] = info;
        }
    });

    if (indicesAmbiguos.length > 0) {
        indiceDudaActual = 0;
        pedirResolucionAlUsuario();
    } else {
        finalizarYMostrarEstadisticas();
    }
}

// muestro la cajita para que el usuario elija el tipo de dato
function pedirResolucionAlUsuario() {
    const posActual = indicesAmbiguos[indiceDudaActual];
    const textoLinea = lineasBrutas[posActual];
    const opciones = procesarDato(textoLinea);

    contenedorResultados.innerHTML = `
        <div class="fade-in p-3">
            <h3 class="h6 mb-3 text-warning">
                <i class="fa-solid fa-question-circle me-2"></i> Resolución de Línea ${indiceDudaActual + 1}
            </h3>
            <div class="mb-3">
                <small class="opacity-50">Dato detectado:</small>
                <div class="h4 fw-bold text-truncate">${textoLinea}</div>
            </div>
            <div class="d-grid gap-2">
                ${opciones.posiblesTipos.map(t => `
                    <button class="btn btn-outline-primary text-start px-3 py-2" onclick="window.resolverDuda('${t}')">
                        <i class="fa-solid fa-check me-2 small"></i> Interpretar como ${t.toUpperCase()}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// guardo la elección del usuario y sigo con la siguiente línea
window.resolverDuda = (tipoElegido) => {
    const posActual = indicesAmbiguos[indiceDudaActual];
    const textoLinea = lineasBrutas[posActual];
    objetosProcesados[posActual] = procesarDato(textoLinea, tipoElegido);
    
    indiceDudaActual++;
    if (indiceDudaActual < indicesAmbiguos.length) {
        pedirResolucionAlUsuario();
    } else {
        finalizarYMostrarEstadisticas();
    }
};

/**
 * acá termino el proceso, dibujo todo y calculo las métricas finales
 */
function finalizarYMostrarEstadisticas() {
    const listaFinal = objetosProcesados.filter(item => item !== undefined);
    
    // dibujo los resultados generales
    contenedorResultados.innerHTML = listaFinal.map(d => `
        <div class="number-item fade-in">
            <div class="overflow-hidden me-2">
                <span class="${d.valido ? 'fw-bold' : 'text-danger'} text-truncate d-block" style="max-width: 150px;">${d.original}</span>
                <small class="opacity-50 text-uppercase" style="font-size:0.6rem;">${d.valido ? d.tipo : 'Inválido'}</small>
            </div>
            <div class="small opacity-50 text-end">
                ${d.valido ? `-> ${d.valor}` : 'Fallo'}
            </div>
        </div>
    `).join('');

    // filtro los útiles y los ordeno ascendentemente
    const utilesFiltrados = listaFinal
        .filter(d => d.valido && d.esUtil)
        .sort((a, b) => {
            const valA = typeof a.valor === 'string' ? parseFloat(a.valor) : a.valor;
            const valB = typeof b.valor === 'string' ? parseFloat(b.valor) : b.valor;
            return valA - valB;
        });

    if (utilesFiltrados.length === 0) {
        contenedorUtiles.innerHTML = '<div class="text-center py-5 opacity-25"><p>No hay números útiles</p></div>';
    } else {
        contenedorUtiles.innerHTML = utilesFiltrados.map(u => `
            <div class="number-item fade-in border-start border-success border-4">
                <div>
                    <span class="fw-bold">${u.valor}</span>
                    <small class="d-block opacity-50 text-uppercase" style="font-size:0.6rem;">${u.tipo}</small>
                </div>
                <i class="fa-solid fa-star text-success"></i>
            </div>
        `).join('');
    }

    // actualizo los numeritos de las tarjetas
    const cantidadUtiles = utilesFiltrados.length;
    const cantidadInvalidos = listaFinal.filter(d => !d.valido).length;
    const cantidadFactoriales = listaFinal.filter(d => d.esFactorial).length;
    const totalLineas = listaFinal.length;
    
    visorUtiles.textContent = cantidadUtiles;
    visorInvalidos.textContent = cantidadInvalidos;
    visorFactoriales.textContent = cantidadFactoriales;
    visorPorcentaje.textContent = totalLineas > 0 ? `${Math.round((cantidadUtiles / totalLineas) * 100)}%` : '0%';

    seccionEstadisticas.classList.remove('d-none');
    seccionExportacion.classList.remove('d-none');
}

/**
 * exporto los números útiles ordenados a un nuevo archivo txt
 */
async function exportarResultadosUtiles() {
    const soloValoresUtiles = objetosProcesados
        .filter(d => d && d.valido && d.esUtil)
        .sort((a, b) => {
            const valA = typeof a.valor === 'string' ? parseFloat(a.valor) : a.valor;
            const valB = typeof b.valor === 'string' ? parseFloat(b.valor) : b.valor;
            return valA - valB;
        })
        .map(u => u.valor.toString());

    if (soloValoresUtiles.length === 0) return;

    try {
        botonExportar.disabled = true;
        const respuesta = await fetch('/api/exportar-resultados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ datos: soloValoresUtiles })
        });
        const data = await respuesta.json();
        if (data.success) {
            window.location.href = `/api/descargar/${data.fileName}`;
        }
    } catch (e) { console.error('error al exportar:', e); } 
    finally { botonExportar.disabled = false; }
}

// manejo de drag & drop
zonaDrop.addEventListener('dragover', (e) => { e.preventDefault(); zonaDrop.classList.add('bg-primary', 'bg-opacity-10'); });
zonaDrop.addEventListener('dragleave', () => zonaDrop.classList.remove('bg-primary', 'bg-opacity-10'));
zonaDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    zonaDrop.classList.remove('bg-primary', 'bg-opacity-10');
    procesarSubidaDeArchivo(e.dataTransfer.files[0]);
});

entradaArchivo.addEventListener('change', (e) => procesarSubidaDeArchivo(e.target.files[0]));
botonExportar.addEventListener('click', exportarResultadosUtiles);
interruptorTema.addEventListener('click', cambiarModoVisual);

// botón volver arriba
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        botonIrArriba.style.display = 'flex';
    } else {
        botonIrArriba.style.display = 'none';
    }
});

botonIrArriba.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// arranco todo
cargarPreferencias();
