// Módulo para gestionar los indicadores económicos (Dólar API)
// Esta función se encarga de cargar los indicadores económicos del Dólar API y mostrarlos en el contenedor especificado
export async function cargarIndicadores(contenedorId) {
    
    // Obtengo el contenedor donde voy a mostrar los indicadores
    const contenedor = document.getElementById(contenedorId);
    // Si no existe el contenedor, salgo de la función
    if (!contenedor) return;

    try {
        // Hago la petición a la API de Dólar API
        const response = await fetch('https://dolarapi.com/v1/dolares');
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const data = await response.json();

        const oficial = data.find(d => d.casa === 'oficial');
        const blue = data.find(d => d.casa === 'blue');
        const bolsa = data.find(d => d.casa === 'bolsa');
// Si existe el dólar oficial y el blue, muestro los indicadores en el contenedor
        if (oficial && blue) {
            contenedor.innerHTML = `
                USD Oficial: $${oficial.compra} | 
                Blue: $${blue.compra} | 
                Bolsa: $${bolsa ? bolsa.compra : 'N/D'}
            `;
        }
    } catch (error) {
        console.error('Error API Dólar:', error);
        contenedor.innerHTML = 'Dólar no disponible';
    }
}
