// proyecto 12_reduce

// los datos
const INICIAL_ELEMENTOS = [5, 10, 15, 20];
const INICIAL_ENTEROS = [1, 2, 3, 4, 5];
const INICIAL_CARRITO = [
    { nombre: "Producto A", precio: 100 },
    { nombre: "Producto B", precio: 250 },
    { nombre: "Producto C", precio: 500 }
];

// las variables
let elementos = [...INICIAL_ELEMENTOS];
let enteros = [...INICIAL_ENTEROS];
let carrito = [...INICIAL_CARRITO];

// el html
const dom = {
    // Ejercicio 1
    displayOriginal1: document.getElementById('displayOriginal1'),
    resSum: document.getElementById('resSum'),
    btnSum: document.getElementById('btnSum'),

    // Ejercicio 2
    displayOriginal2: document.getElementById('displayOriginal2'),
    resMult: document.getElementById('resMult'),
    btnMult: document.getElementById('btnMult'),

    // Ejercicio 3
    displayOriginal3: document.getElementById('displayOriginal3'),
    resTotalObj: document.getElementById('resTotalObj'),
    btnTotalObj: document.getElementById('btnTotalObj'),

    // Global
    btnReset: document.getElementById('btnReset')
};

// dibujar en pantalla

const updateUI = () => {
    dom.displayOriginal1.textContent = `Array: [${elementos.join(', ')}]`;
    dom.displayOriginal2.textContent = `Array: [${enteros.join(', ')}]`;
    dom.displayOriginal3.textContent = `[${carrito.map(item => '{' + item.precio + '}').join(', ')}]`;
};

// --- LÓGICA DE EJERCICIOS ---

// 1. Suma todos los elementos de un array
dom.btnSum.onclick = () => {
    // MÉTODO ARRAY: reduce() - Ejercicio 1
    const sumaTotal = elementos.reduce((acc, curr) => acc + curr, 0);
    
    dom.resSum.className = "result-box mt-3 animate__animated animate__pulse";
    dom.resSum.textContent = `Resultado: ${sumaTotal}`;
    dom.btnSum.disabled = true; // Deshabilitar después de reducir
};

// 2. Multiplica todos los elementos de un array de enteros
dom.btnMult.onclick = () => {
    // MÉTODO ARRAY: reduce() - Ejercicio 2
    const productoTotal = enteros.reduce((acc, curr) => acc * curr, 1);
    
    dom.resMult.className = "result-box mt-3 animate__animated animate__pulse";
    dom.resMult.textContent = `Resultado: ${productoTotal}`;
    dom.btnMult.disabled = true; // Deshabilitar después de reducir
};

// 3. Dado un array de objetos {precio}, obtiene el total de precios
dom.btnTotalObj.onclick = () => {
    // MÉTODO ARRAY: reduce() - Ejercicio 3
    const totalCarrito = carrito.reduce((acc, curr) => acc + curr.precio, 0);
    
    dom.resTotalObj.className = "result-box mt-3 animate__animated animate__pulse";
    dom.resTotalObj.textContent = `Resultado: $${totalCarrito}`;
    dom.btnTotalObj.disabled = true; // Deshabilitar después de reducir
};

// resetear

dom.btnReset.onclick = () => {
    elementos = [...INICIAL_ELEMENTOS];
    enteros = [...INICIAL_ENTEROS];
    carrito = [...INICIAL_CARRITO];
    
    // Habilitar botones
    dom.btnSum.disabled = false;
    dom.btnMult.disabled = false;
    dom.btnTotalObj.disabled = false;

    // Limpiar resultados
    [dom.resSum, dom.resMult, dom.resTotalObj].forEach((el, index) => {
        el.textContent = index === 2 ? "Resultado: $0" : "Resultado: 0";
        el.className = "result-box mt-3";
    });
    
    updateUI();
};

// inicio
window.addEventListener('DOMContentLoaded', updateUI);

