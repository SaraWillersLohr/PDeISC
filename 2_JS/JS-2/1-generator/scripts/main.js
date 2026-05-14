/**
 * acá manejo toda la lógica del generador de números.
 * controlo el ingreso, las validaciones y la comunicación con el servidor.
 */

import { procesarDato } from '../modulos/numberProcessor.js';

// estado global de mi aplicación
let listaDeNumeros = [];
let temaActual = 'dark';
let seleccionActual = null; // guardo el número procesado antes de agregarlo

// busco los elementos del dom que voy a usar
const inputNumero = document.getElementById('input-number');
const botonAgregar = document.getElementById('btn-add');
const visualizadorContador = document.getElementById('count-display');
const contenedorConjuntoActual = document.getElementById('current-set');
const visualizadorTransformacion = document.getElementById('transformation-preview');
const feedbackInput = document.getElementById('input-feedback');
const botonGenerar = document.getElementById('btn-generate');
const barraProgreso = document.getElementById('progress-bar');
const seccionGenerar = document.getElementById('generate-section');
const interruptorTema = document.getElementById('theme-toggle');
const enlaceTema = document.getElementById('theme-link');
const botonSubir = document.getElementById('back-to-top');

// inicio la configuración trayendo el tema guardado del servidor
async function iniciarConfiguracion() {
    try {
        const respuesta = await fetch('/api/configuracion');
        const datosConfiguracion = await respuesta.json();
        cambiarTema(datosConfiguracion.tema || 'dark');
    } catch (error) {
        cambiarTema('dark');
    }
}

// esta función cambia el estilo visual de la página
function cambiarTema(nuevoTema) {
    temaActual = nuevoTema;
    enlaceTema.href = `/estilos/${nuevoTema}.css`;
    const icono = interruptorTema.querySelector('i');
    icono.className = nuevoTema === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

// alterno entre modo claro y oscuro y le aviso al servidor para que lo guarde
async function alternarTema() {
    const temaSiguiente = temaActual === 'dark' ? 'light' : 'dark';
    cambiarTema(temaSiguiente);
    await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: temaSiguiente })
    });
}

// renderizo la parte donde el usuario resuelve si un número es ambiguo
function renderizarAmbiguedad(datos) {
    visualizadorTransformacion.innerHTML = `
        <div class="fade-in">
            <div class="mb-4">
                <span class="tech-label">Entrada detectada:</span>
                <div class="h4 fw-bold">${datos.original}</div>
            </div>
            
            <div class="p-3 rounded bg-primary bg-opacity-10 border border-primary border-opacity-25 mb-4">
                <p class="small mb-3">
                    <i class="fa-solid fa-circle-nodes me-2"></i>
                    <strong>Detección de Ambigüedad:</strong> 
                    Este valor puede interpretarse de varias formas. ¿Qué es exactamente?
                </p>
                <div class="d-grid gap-2">
                    ${datos.posiblesTipos.map(t => `
                        <button class="btn btn-outline-primary text-start px-3 py-2" onclick="window.resolverAmbiguedad('${t}')">
                            <i class="fa-solid fa-arrow-right me-2 small"></i> Interpretar como <strong>${t.toUpperCase()}</strong>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    botonAgregar.disabled = true;
    feedbackInput.innerHTML = '<span class="text-warning">Por favor, elegí una interpretación</span>';
}

// resuelvo la duda del usuario y muestro el resultado normalizado
window.resolverAmbiguedad = (tipoElegido) => {
    const textoEntrada = inputNumero.value.trim();
    const infoResuelta = procesarDato(textoEntrada, tipoElegido);
    seleccionActual = infoResuelta;
    renderizarPrevisualizacionResuelta(infoResuelta);
};

// acá muestro cómo quedó el número después de ser procesado
function renderizarPrevisualizacionResuelta(datos) {
    let htmlResultado = '';
    
    if (datos.tipo === 'complejo' || datos.tipo === 'imaginario') {
        htmlResultado = `
            <div class="tech-label">Parte Real:</div>
            <div class="tech-value">${datos.parteReal}</div>
            <div class="tech-label">Parte Imaginaria:</div>
            <div class="tech-value">${datos.parteImaginaria}i</div>
        `;
    } else {
        htmlResultado = `
            <div class="tech-label">Valor Normalizado (Base 10):</div>
            <div class="result-display">${datos.valor}</div>
        `;
    }

    visualizadorTransformacion.innerHTML = `
        <div class="fade-in">
            <div class="mb-3">
                <span class="tech-label">Entrada Original:</span>
                <div class="tech-value h5 text-truncate" title="${datos.original}">${datos.original}</div>
            </div>
            <div class="mb-3">
                <span class="tech-label">Tipo Confirmado:</span>
                <div class="tech-value text-primary text-uppercase">${datos.tipo}</div>
            </div>
            <div class="mb-3">
                ${htmlResultado}
            </div>
            <div class="mt-4 p-2 rounded bg-success bg-opacity-10 text-success text-center small">
                <i class="fa-solid fa-check-double me-1"></i> Listo para agregar
            </div>
        </div>
    `;
    
    botonAgregar.disabled = listaDeNumeros.length >= 20;
    feedbackInput.innerHTML = '<span class="text-success">Interpretación lista</span>';
}

// analizo lo que el usuario escribe en tiempo real
function actualizarPrevisualizacion() {
    const texto = inputNumero.value.trim();
    seleccionActual = null;

    if (!texto) {
        visualizadorTransformacion.innerHTML = `
            <div class="text-center py-5 opacity-25">
                <i class="fa-solid fa-microchip fa-3x mb-3"></i>
                <p>Esperando entrada...</p>
            </div>
        `;
        feedbackInput.textContent = '';
        inputNumero.classList.remove('is-invalid', 'is-valid');
        botonAgregar.disabled = true;
        return;
    }

    const analisis = procesarDato(texto);
    
    if (!analisis.valido) {
        inputNumero.classList.add('is-invalid');
        inputNumero.classList.remove('is-valid');
        feedbackInput.innerHTML = '<span class="text-danger">Formato no soportado</span>';
        visualizadorTransformacion.innerHTML = `<div class="text-center py-5 text-danger"><i class="fa-solid fa-circle-exclamation fa-3x mb-3"></i><p>Valor Inválido</p></div>`;
        botonAgregar.disabled = true;
    } else if (analisis.esAmbiguo) {
        inputNumero.classList.remove('is-invalid');
        inputNumero.classList.add('is-valid');
        renderizarAmbiguedad(analisis);
    } else {
        inputNumero.classList.remove('is-invalid');
        inputNumero.classList.add('is-valid');
        seleccionActual = analisis;
        renderizarPrevisualizacionResuelta(analisis);
    }
}

// agrego el número a la lista definitiva
function agregarNumeroALista() {
    if (!seleccionActual || listaDeNumeros.length >= 20) return;

    listaDeNumeros.push(seleccionActual);
    renderizarConjunto();
    inputNumero.value = '';
    seleccionActual = null;
    actualizarPrevisualizacion();
    verificarLimites();
}

// dibujo la lista de números que ya cargó el usuario
function renderizarConjunto() {
    if (listaDeNumeros.length === 0) {
        contenedorConjuntoActual.innerHTML = '<div class="text-center py-5 opacity-25"><p>No hay números cargados</p></div>';
        return;
    }

    contenedorConjuntoActual.innerHTML = listaDeNumeros.map((num, indice) => `
        <div class="number-item fade-in">
            <div class="overflow-hidden me-2">
                <div class="fw-bold text-truncate" style="max-width: 150px;" title="${num.original}">${num.original}</div>
                <small class="opacity-50 text-uppercase" style="font-size:0.6rem;">${num.tipo}</small>
            </div>
            <button class="btn btn-sm text-danger" onclick="window.quitarNumero(${indice})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// elimino un número de la lista
window.quitarNumero = (indice) => {
    listaDeNumeros.splice(indice, 1);
    renderizarConjunto();
    verificarLimites();
};

// controlo si llegamos al mínimo o al máximo permitido
function verificarLimites() {
    const cantidad = listaDeNumeros.length;
    visualizadorContador.textContent = `${cantidad} / 20`;
    
    const porcentaje = (cantidad / 20) * 100;
    barraProgreso.style.width = `${porcentaje}%`;

    if (cantidad >= 10) {
        seccionGenerar.classList.remove('d-none');
    } else {
        seccionGenerar.classList.add('d-none');
    }
    
    botonAgregar.disabled = cantidad >= 20 || !seleccionActual;
}

// le pido al servidor que me genere el archivo txt con los números
async function generarArchivoTxt() {
    try {
        botonGenerar.disabled = true;
        botonGenerar.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Generando...';
        
        const cuerpoPeticion = {
            numeros: listaDeNumeros.map(n => n.original),
            nombre: 'mi_dataset_numerico'
        };

        const respuesta = await fetch('/api/generar-txt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cuerpoPeticion)
        });

        const data = await respuesta.json();
        if (data.success) {
            window.location.href = `/api/descargar/${data.fileName}`;
        }
    } catch (error) { 
        console.error('error al generar:', error); 
    } finally {
        botonGenerar.disabled = false;
        botonGenerar.innerHTML = '<i class="fa-solid fa-file-export me-2"></i> Generar Archivo TXT';
    }
}

// manejo el botón de volver arriba
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        botonSubir.style.display = 'flex';
    } else {
        botonSubir.style.display = 'none';
    }
});

botonSubir.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// escucho los eventos del usuario
inputNumero.addEventListener('input', actualizarPrevisualizacion);
botonAgregar.addEventListener('click', agregarNumeroALista);
botonGenerar.addEventListener('click', generarArchivoTxt);
interruptorTema.addEventListener('click', alternarTema);

// arranco la app
iniciarConfiguracion();
verificarLimites();
