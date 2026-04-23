import { formValidator } from '../modules/form-validator.js';
import { resultRenderer } from '../modules/result-renderer.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('event-form');
    const formSection = document.getElementById('form-section');
    const resultSection = document.getElementById('result-section');
    const btnBack = document.getElementById('btn-back');
    const btnSubmit = document.getElementById('btn-submit');

    const clearErrors = () => {
        document.querySelectorAll('.error').forEach(el => el.textContent = '');
    };

    const showErrors = (errors) => {
        for (const [field, message] of Object.entries(errors)) {
            const errEl = document.getElementById(`err-${field}`);
            if (errEl) errEl.textContent = message;
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        // UI Feedback durante validación asíncrona
        btnSubmit.disabled = true;
        const originalText = btnSubmit.textContent;
        btnSubmit.textContent = 'Verificando datos...';

        const formData = new FormData(form);
        const errors = await formValidator.validate(formData);

        if (Object.keys(errors).length === 0) {
            const data = Object.fromEntries(formData.entries());
            resultRenderer.render(data, 'result-data');
            formSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
        } else {
            showErrors(errors);
        }

        btnSubmit.disabled = false;
        btnSubmit.textContent = originalText;
    });

    btnBack.addEventListener('click', () => {
        resultSection.classList.add('hidden');
        formSection.classList.remove('hidden');
        form.reset();
        clearErrors();
    });
});
