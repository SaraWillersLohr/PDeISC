// proyecto 03_unshift

// los datos
const POOL_COLORES = ["Rojo", "Azul", "Verde"];
const INICIAL_TAREAS = ["Lavar platos", "Hacer ejercicio"];
const INICIAL_USUARIOS = ["Maria99", "Juan_Dev"];

// las variables
let colores = [];
let tareas = [...INICIAL_TAREAS];
let usuarios = [...INICIAL_USUARIOS];

// el html
const dom = {
    // Ejercicio 1
    listaCol: document.getElementById('listaCol'),
    btnCol: document.getElementById('btnCol'),
    resCol: document.getElementById('resCol'),

    // Ejercicio 2
    listaTask: document.getElementById('listaTask'),
    inputTask: document.getElementById('inputTask'),
    btnTask: document.getElementById('btnTask'),
    resTask: document.getElementById('resTask'),

    // Ejercicio 3
    listaUser: document.getElementById('listaUser'),
    inputUser: document.getElementById('inputUser'),
    btnUser: document.getElementById('btnUser'),
    resUser: document.getElementById('resUser'),

    // Global
    btnReset: document.getElementById('btnReset')
};

// dibujar en pantalla

const renderArray = (arr, elementId) => {
    const container = dom[elementId];
    container.innerHTML = arr.map(item => `
        <span class="array-item animate__animated animate__fadeInLeft">
            ${item}
        </span>
    `).join('');
};

const updateUI = () => {
    renderArray(colores, 'listaCol');
    renderArray(tareas, 'listaTask');
    renderArray(usuarios, 'listaUser');
    
    // Deshabilitar botón de colores si ya se agregaron
    dom.btnCol.disabled = colores.length > 0;
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Agrega tres colores al principio de un array vacío
dom.btnCol.onclick = () => {
    if (colores.length === 0) {
        // MÉTODO ARRAY: unshift() - Ejercicio 1
        colores.unshift(...POOL_COLORES);
        
        dom.resCol.className = "feedback-box mt-3 feedback-success animate__animated animate__pulse";
        dom.resCol.innerHTML = '<i class="fas fa-check-circle me-2"></i>3 colores agregados al inicio.';
        updateUI();
    }
};

// 2. Dado un array de tareas, agrega una nueva tarea urgente al principio
dom.btnTask.onclick = () => {
    const val = dom.inputTask.value.trim();
    if (!val) {
        dom.resTask.className = "feedback-box mt-3 feedback-danger animate__animated animate__shakeX";
        dom.resTask.textContent = "Escribe una tarea";
        return;
    }

    // MÉTODO ARRAY: unshift() - Ejercicio 2
    tareas.unshift(`⚠️ ${val}`);
    
    dom.inputTask.value = "";
    dom.resTask.className = "feedback-box mt-3 feedback-success animate__animated animate__bounceIn";
    dom.resTask.innerHTML = '<i class="fas fa-bolt me-2"></i>Tarea urgente agregada.';
    updateUI();
};

// 3. Inserta el nombre de un usuario al principio de un array de usuarios conectados
dom.btnUser.onclick = () => {
    const val = dom.inputUser.value.trim();
    if (!val) {
        dom.resUser.className = "feedback-box mt-3 feedback-danger animate__animated animate__shakeX";
        dom.resUser.textContent = "Ingresa un nombre";
        return;
    }

    // MÉTODO ARRAY: unshift() - Ejercicio 3
    usuarios.unshift(val);
    
    dom.inputUser.value = "";
    dom.resUser.className = "feedback-box mt-3 feedback-success animate__animated animate__bounceIn";
    dom.resUser.innerHTML = '<i class="fas fa-user-plus me-2"></i>Usuario conectado al inicio.';
    updateUI();
};

// resetear

dom.btnReset.onclick = () => {
    colores = [];
    tareas = [...INICIAL_TAREAS];
    usuarios = [...INICIAL_USUARIOS];
    
    // Limpiar feedbacks
    [dom.resCol, dom.resTask, dom.resUser].forEach((el, index) => {
        el.className = "feedback-box mt-3 feedback-waiting";
        if (index === 0) el.textContent = "Esperando...";
        if (index === 1) el.textContent = "Agrega una tarea urgente";
        if (index === 2) el.textContent = "Ingresa un nombre";
    });
    
    dom.inputTask.value = "";
    dom.inputUser.value = "";
    
    updateUI();
};

// inicio
window.addEventListener('DOMContentLoaded', updateUI);

