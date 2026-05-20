// Acá guardo todas mis funciones matemáticas básicas para poder reutilizarlas en otros archivos
// Uso la palabra clave "export" para que Node.js me permita importarlas desde ejercicio4.js y ejercicio5.js

// Acá sumo dos números que me pasen por parámetros y retorno el total de esa suma
export function suma(a, b) {
  return a + b;
}

// Acá resto dos números: al primero (a) le quito el segundo (b) y retorno la diferencia obtenida
export function resta(a, b) {
  return a - b;
}

// Acá multiplico los dos números que me pasen y retorno el producto obtenido de esa multiplicación
export function multiplicacion(a, b) {
  return a * b;
}

// Acá divido el primer número (a) sobre el segundo (b) y retorno el cociente resultante
export function division(a, b) {
  return a / b;
}