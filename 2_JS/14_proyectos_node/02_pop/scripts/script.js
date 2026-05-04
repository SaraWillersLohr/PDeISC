// proyecto 02_pop

// los datos
const INICIAL_ANIMALES = ["Perro", "Gato", "Loro", "Pez"];
const INICIAL_COMPRAS = ["Leche", "Pan", "Frutas", "Café"];
const INICIAL_VACIADO = ["A", "B", "C", "D", "E"];

// las variables
let animales = [...INICIAL_ANIMALES];
let compras = [...INICIAL_COMPRAS];
let vaciado = [...INICIAL_VACIADO];

// el html
const dom = {
    // Ejercicio 1
    listaAni: document.getElementById('listaAni'),
    btnAni: document.getElementById('btnAni'),
    
    // Ejercicio 2
    listaCom: document.getElementById('listaCom'),
    btnCom: document.getElementById('btnCom'),
    resCom: document.getElementById('resCom'),

    // Ejercicio 3
    listaVac: document.getElementById('listaVac'),
    btnVac: document.getElementById('btnVac'),

    // Global
    btnReset: document.getElementById('btnReset')
};

// dibujar en pantalla

const renderArray = (arr, elementId) => {
    const container = dom[elementId];
    container.innerHTML = arr.map(item => `
        <span class="array-item animate__animated animate__fadeIn">
            ${item}
        </span>
    `).join('');
};

const updateUI = () => {
    renderArray(animales, 'listaAni');
    renderArray(compras, 'listaCom');
    renderArray(vaciado, 'listaVac');
    
    // Deshabilitar botones si el array está vacío
    dom.btnAni.disabled = animales.length === 0;
    dom.btnCom.disabled = compras.length === 0;
    dom.btnVac.disabled = vaciado.length === 0;
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Elimina el último elemento de un array de animales
dom.btnAni.onclick = () => {
    if (animales.length > 0) {
        // MÉTODO ARRAY: pop() - Ejercicio 1
        animales.pop();
        updateUI();
    }
};

// 2. Quita el último producto de una lista de compras y muestra cuál fue eliminado
dom.btnCom.onclick = () => {
    if (compras.length > 0) {
        // MÉTODO ARRAY: pop() - Ejercicio 2
        const eliminado = compras.pop();
        
        dom.resCom.className = "feedback-box mt-3 feedback-danger animate__animated animate__bounceIn";
        dom.resCom.innerHTML = `<i class="fas fa-trash me-2"></i>Eliminado: <strong>${eliminado}</strong>`;
        updateUI();
    }
};

// 3. Usa un bucle while para vaciar un array con pop()
dom.btnVac.onclick = () => {
    // LÓGICA LITERAL: while (vaciado.length > 0) { vaciado.pop(); }
    // Usamos un pequeño delay para que el usuario vea el proceso académico
    dom.btnVac.disabled = true;
    const interval = setInterval(() => {
        if (vaciado.length > 0) {
            vaciado.pop();
            renderArray(vaciado, 'listaVac');
        } else {
            clearInterval(interval);
            updateUI();
        }
    }, 200);
};

// resetear

dom.btnReset.onclick = () => {
    animales = [...INICIAL_ANIMALES];
    compras = [...INICIAL_COMPRAS];
    vaciado = [...INICIAL_VACIADO];
    
    dom.resCom.className = "feedback-box mt-3 feedback-waiting";
    dom.resCom.textContent = "Esperando...";
    
    updateUI();
};

// inicio
window.addEventListener('DOMContentLoaded', updateUI);

