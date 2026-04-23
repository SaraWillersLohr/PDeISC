import { validator } from '../modules/validator.js';
import { stateManager } from '../modules/state.js';

document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.step');
    const indicator = document.getElementById('step-indicator');
    const summaryContent = document.getElementById('summary-content');

    const updateUI = () => {
        const state = stateManager.get();
        steps.forEach((step, idx) => {
            step.classList.toggle('active', (idx + 1) === state.currentStep);
        });

        if (state.currentStep <= 3) {
            indicator.textContent = `Paso ${state.currentStep} de 3`;
        } else {
            indicator.textContent = '¡Finalizado!';
        }

        if (state.theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }

        if (state.currentStep === 3) {
            renderSummary();
        }
    };

    const renderSummary = () => {
        const state = stateManager.get();
        summaryContent.innerHTML = '';
        
        const details = [
            { label: 'Nombre Completo', value: state.name },
            { label: 'Tema Elegido', value: state.theme === 'light' ? 'Claro' : 'Oscuro' }
        ];

        details.forEach(item => {
            const p = document.createElement('p');
            const b = document.createElement('strong');
            b.textContent = `${item.label}: `;
            p.appendChild(b);
            p.appendChild(document.createTextNode(item.value));
            summaryContent.appendChild(p);
        });
    };

    const btnCount = document.getElementById('btn-count-children');
    const childrenDemo = document.getElementById('children-demo');
    const childrenResult = document.getElementById('children-result');

    btnCount.addEventListener('click', () => {
        const count = childrenDemo.children.length;
        childrenResult.textContent = `El contenedor tiene ${count} hijos (p, button, div).`;
    });

    // Listeners Paso 1 (ACTUALIZADO PARA ASYNC)
    document.getElementById('next-1').addEventListener('click', async () => {
        const nameInput = document.getElementById('name');
        const errorSpan = document.getElementById('error-name');
        const nextBtn = document.getElementById('next-1');
        
        nextBtn.disabled = true;
        nextBtn.textContent = 'Validando...';
        
        const validation = await validator.isRealName(nameInput.value);
        
        if (validation.valid) {
            stateManager.update('name', nameInput.value);
            stateManager.update('currentStep', 2);
            errorSpan.textContent = '';
            updateUI();
        } else {
            errorSpan.textContent = validation.message;
        }
        
        nextBtn.disabled = false;
        nextBtn.textContent = 'Siguiente';
    });

    // Listeners Paso 2
    document.getElementById('prev-2').addEventListener('click', () => {
        stateManager.update('currentStep', 1);
        updateUI();
    });

    document.getElementById('next-2').addEventListener('click', () => {
        const themeSelect = document.getElementById('theme');
        stateManager.update('theme', themeSelect.value);
        stateManager.update('currentStep', 3);
        updateUI();
    });

    // Listeners Paso 3
    document.getElementById('prev-3').addEventListener('click', () => {
        stateManager.update('currentStep', 2);
        updateUI();
    });

    document.getElementById('finish').addEventListener('click', () => {
        stateManager.update('currentStep', 4);
        updateUI();
    });

    document.getElementById('restart').addEventListener('click', () => {
        stateManager.reset();
        document.getElementById('name').value = '';
        document.getElementById('theme').value = 'light';
        updateUI();
    });

    updateUI();
});
