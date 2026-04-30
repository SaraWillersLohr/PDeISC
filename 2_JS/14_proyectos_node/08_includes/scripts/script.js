/**
 * Proyecto: 08 - includes() "Pertenencia Maestra"
 * Objetivo: Demostrar includes() mediante 3 casos literales e independientes.
 */

// --- DATOS INICIALES ---
const INICIAL_USUARIOS = ["pepe", "admin", "maria", "lucas"];
const INICIAL_COLORES = ["rojo", "azul", "amarillo", "blanco"];
const INICIAL_NUMEROS = [10, 20, 30, 40];

// --- ESTADO ---
let usuarios = [...INICIAL_USUARIOS];
let colores = [...INICIAL_COLORES];
let numeros = [...INICIAL_NUMEROS];

// --- DOM ---
const dom = {
    // Ejercicio 1
    displayUsers: document.getElementById('displayUsers'),
    btnCheckAdmin: document.getElementById('btnCheckAdmin'),
    resAdmin: document.getElementById('resAdmin'),

    // Ejercicio 2
    displayColores: document.getElementById('displayColores'),
    btnCheckVerde: document.getElementById('btnCheckVerde'),
    resVerde: document.getElementById('resVerde'),

    // Ejercicio 3
    displayNumeros: document.getElementById('displayNumeros'),
    inputNumero: document.getElementById('inputNumero'),
    btnAddNumero: document.getElementById('btnAddNumero'),
    resNumero: document.getElementById('resNumero'),

    // Global
    btnReset: document.getElementById('btnReset')
};

// --- RENDERERS ---

const renderArray = (arr, elementId) => {
    const container = dom[elementId];
    container.innerHTML = arr.map(item => `
        <span class="array-item animate__animated animate__fadeIn">
            ${item}
        </span>
    `).join('');
};

const updateUI = () => {
    renderArray(usuarios, 'displayUsers');
    renderArray(colores, 'displayColores');
    renderArray(numeros, 'displayNumeros');
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Comprueba si un array contiene la palabra "admin"
dom.btnCheckAdmin.onclick = () => {
    const hasAdmin = usuarios.includes("admin");
    
    dom.resAdmin.className = `feedback-box mt-3 animate__animated animate__pulse ${hasAdmin ? 'feedback-success' : 'feedback-danger'}`;
    dom.resAdmin.innerHTML = hasAdmin 
        ? '<i class="fas fa-check-circle me-2"></i>¡Confirmado! "admin" está presente.' 
        : '<i class="fas fa-times-circle me-2"></i>"admin" NO se encuentra.';
    
    dom.btnCheckAdmin.disabled = true; // Deshabilitar después de verificar
};

// 2. Dado un array de colores, indica si existe "verde"
dom.btnCheckVerde.onclick = () => {
    const hasVerde = colores.includes("verde");
    
    dom.resVerde.className = `feedback-box mt-3 animate__animated animate__pulse ${hasVerde ? 'feedback-success' : 'feedback-danger'}`;
    dom.resVerde.innerHTML = hasVerde 
        ? '<i class="fas fa-leaf me-2"></i>¡El color verde EXISTE!' 
        : '<i class="fas fa-ghost me-2"></i>El color verde NO existe.';
    
    dom.btnCheckVerde.disabled = true; // Deshabilitar después de verificar
};

// 3. Verifica si un número está presente antes de sumarlo al array
dom.btnAddNumero.onclick = () => {
    const val = parseInt(dom.inputNumero.value);
    
    if (isNaN(val)) {
        dom.resNumero.className = "feedback-box mt-3 feedback-danger animate__animated animate__shakeX";
        dom.resNumero.textContent = "Ingresa un número válido";
        return;
    }

    // LÓGICA LITERAL: Verificar si está presente ANTES de sumarlo
    if (numeros.includes(val)) {
        dom.resNumero.className = "feedback-box mt-3 feedback-danger animate__animated animate__shakeX";
        dom.resNumero.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>El ${val} ya existe.`;
    } else {
        numeros.push(val);
        renderArray(numeros, 'displayNumeros');
        dom.inputNumero.value = "";
        dom.resNumero.className = "feedback-box mt-3 feedback-success animate__animated animate__bounceIn";
        dom.resNumero.innerHTML = `<i class="fas fa-plus me-2"></i>${val} agregado con éxito.`;
    }
};

// --- RESET ---

dom.btnReset.onclick = () => {
    usuarios = [...INICIAL_USUARIOS];
    colores = [...INICIAL_COLORES];
    numeros = [...INICIAL_NUMEROS];
    
    // Habilitar botones
    dom.btnCheckAdmin.disabled = false;
    dom.btnCheckVerde.disabled = false;

    // Limpiar feedbacks
    [dom.resAdmin, dom.resVerde, dom.resNumero].forEach(el => {
        el.className = "feedback-box mt-3 feedback-waiting";
        el.textContent = "Esperando...";
    });
    dom.resNumero.textContent = "Ingresa un número";
    dom.inputNumero.value = "";
    
    updateUI();
};

// --- INIT ---
window.addEventListener('DOMContentLoaded', updateUI);
