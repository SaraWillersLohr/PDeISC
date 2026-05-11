/**
 * Módulo para gestionar los indicadores económicos (Dólar API)
 */

export async function cargarIndicadores(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    try {
        const response = await fetch('https://dolarapi.com/v1/dolares');
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const data = await response.json();

        const oficial = data.find(d => d.casa === 'oficial');
        const blue = data.find(d => d.casa === 'blue');
        const bolsa = data.find(d => d.casa === 'bolsa');

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
