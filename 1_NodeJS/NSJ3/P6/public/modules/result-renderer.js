// Comentarios claros: este archivo explica la lógica paso a paso.

/**
 * Renderizador de Resultados
 * Toma los datos validados del formulario y los muestra de forma prolija 
 * en una ventana modal de éxito.
 */
export const resultRenderer = {
    render(data, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Limpiar previo

        const fields = [
            { label: 'Nombre', key: 'fullname' },
            { label: 'Correo', key: 'email' },
            { label: 'Edad', key: 'age' },
            { label: 'Taller', key: 'workshop' },
            { label: 'Nivel', key: 'level' }
        ];

        fields.forEach(field => {
            const p = document.createElement('p');
            const b = document.createElement('strong');
            b.textContent = `${field.label}: `;
            p.appendChild(b);
            p.appendChild(document.createTextNode(data[field.key]));
            container.appendChild(p);
        });
    }
};
