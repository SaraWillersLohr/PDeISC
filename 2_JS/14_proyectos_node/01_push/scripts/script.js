// proyecto 01_push

// los datos
const FRUTAS_POOL = ["🍎 Manzana", "🍌 Banana", "🍇 Uva"];
const AMIGOS_POOL = ["Alex", "Marcos", "Lucía"];

// las variables
let frutas = [];
let amigos = ["Juan"];
let numeros = [10];

// el html
const dom = {
    listaFrutas: document.getElementById('listaFrutas'),
    btnFrutas: document.getElementById('btnFrutas'),
    
    listaAmigos: document.getElementById('listaAmigos'),
    btnAmigos: document.getElementById('btnAmigos'),
    
    listaNums: document.getElementById('listaNums'),
    inputNum: document.getElementById('inputNum'),
    btnNum: document.getElementById('btnNum'),
    resNum: document.getElementById('resNum'),

    btnReset: document.getElementById('btnReset')
};

// dibujar en pantalla

const renderArray = (arr, elementId) => {
    const container = dom[elementId];
    container.innerHTML = arr.map(item => `
        <span class="array-item animate__animated animate__fadeInRight">
            ${item}
        </span>
    `).join('');
};

const updateUI = () => {
    renderArray(frutas, 'listaFrutas');
    renderArray(amigos, 'listaAmigos');
    renderArray(numeros, 'listaNums');
    
    // Deshabilitar si ya se cumplió la consigna literal
    dom.btnFrutas.disabled = frutas.length >= 3;
    dom.btnAmigos.disabled = amigos.length >= 4;
};

// --- LÓGICA ---

// 1. Crea un array vacío y agrega tres frutas usando push()
dom.btnFrutas.onclick = () => {
    if (frutas.length === 0) {
        frutas.push(...FRUTAS_POOL);
        updateUI();
    }
};

// 2. Agrega los nombres de tus 3 amigos a un array existente llamado amigos
dom.btnAmigos.onclick = () => {
    if (amigos.length === 1) {
        amigos.push(...AMIGOS_POOL);
        updateUI();
    }
};

// 3. Dado un array de números, agrega un nuevo número solo si es mayor que el último número
dom.btnNum.onclick = () => {
    const val = parseInt(dom.inputNum.value);
    if (isNaN(val)) return;

    const ultimo = numeros[numeros.length - 1];

    if (val > ultimo) {
        numeros.push(val);
        dom.resNum.className = "feedback-box mt-3 feedback-success animate__animated animate__bounceIn";
        dom.resNum.innerHTML = `<i class="fas fa-check me-2"></i>${val} es mayor que ${ultimo}. Agregado.`;
    } else {
        dom.resNum.className = "feedback-box mt-3 feedback-danger animate__animated animate__shakeX";
        dom.resNum.innerHTML = `<i class="fas fa-times me-2"></i>${val} NO es mayor que ${ultimo}.`;
    }
    dom.inputNum.value = "";
    updateUI();
};

dom.btnReset.onclick = () => {
    frutas = [];
    amigos = ["Juan"];
    numeros = [10];
    dom.resNum.className = "feedback-box mt-3 feedback-waiting";
    dom.resNum.textContent = "Esperando...";
    updateUI();
};

// Init
window.addEventListener('DOMContentLoaded', updateUI);

