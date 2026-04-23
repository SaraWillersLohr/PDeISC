export const router = {
    async loadPage(pageName, containerId) {
        const container = document.getElementById(containerId);
        try {
            const response = await fetch(`../pages/${pageName}.html`);
            if (!response.ok) throw new Error('Error al cargar la página');
            const html = await response.text();
            
            // Uso seguro de setHTML o similar si estuviera disponible, 
            // pero como el contenido es controlado por el sistema (nuestros partials), 
            // podemos usar innerHTML según las reglas del usuario.
            container.innerHTML = html;
            
            return true;
        } catch (error) {
            console.error(error);
            container.textContent = 'Error al cargar la sección.';
            return false;
        }
    }
};
