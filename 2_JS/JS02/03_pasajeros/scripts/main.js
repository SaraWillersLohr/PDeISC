// Traigo las funciones de otros archivos para organizar mejor el código
import { checkGender } from "../modules/genderApi.js";
import { validateRealName, validateAgeAndBirth, validateDNI, validatePhone, validateEmail } from "../modules/validations.js";

// Obtengo los elementos del HTML para poder usarlos en JS
const form = document.getElementById("passengerForm");
const submitBtn = document.getElementById("submitBtn");
const termsCheck = document.getElementById("termsCheck");
const genderWarning = document.getElementById("genderWarning");
const listContainer = document.getElementById("passengerList");
const tieneHijosSelect = document.getElementById("tieneHijos");
const cantHijosInput = document.getElementById("cantidadHijos");

// Intento traer los datos del navegador (Consigna 3)
let people = JSON.parse(localStorage.getItem("peopleList")) || [];

/**
 * Muestra el feedback visual dinámico
 */
const showFeedback = (input, result) => {
    input.classList.toggle("is-valid", result.valid);
    input.classList.toggle("is-invalid", !result.valid);
    
    let feedback = input.parentElement.querySelector(".invalid-feedback");
    if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback";
        input.parentNode.appendChild(feedback);
    }
    feedback.textContent = result.msg || "";
};

// Habilitar/Deshabilitar campo de hijos
tieneHijosSelect.addEventListener("change", () => {
    cantHijosInput.disabled = tieneHijosSelect.value === "no";
    if (cantHijosInput.disabled) {
        cantHijosInput.value = "0";
        cantHijosInput.classList.remove("is-valid", "is-invalid");
    }
});

// Esta función chequea que todo esté bien antes de habilitar el botón
const validateForm = () => {
    const isNameValid = validateRealName(form.nombre.value).valid;
    const isSurnameValid = validateRealName(form.apellido.value).valid;
    const isAgeBirthValid = validateAgeAndBirth(form.edad.value, form.fechaNac.value).valid;
    const isDniValid = validateDNI(form.documento.value).valid;
    const isEmailValid = validateEmail(form.email.value).valid;
    const isTerms = termsCheck.checked;
    
    submitBtn.disabled = !(isNameValid && isSurnameValid && isAgeBirthValid && isDniValid && isEmailValid && isTerms);
};

// Reacciono a lo que el usuario tipea
form.addEventListener("input", async (e) => {
    const input = e.target;
    let result = { valid: true, msg: "" };

    if (input.id === "nombre" || input.id === "apellido" || input.id === "nacionalidad") {
        result = validateRealName(input.value);
    } else if (input.id === "documento") {
        result = validateDNI(input.value);
    } else if (input.id === "telefono") {
        result = validatePhone(input.value);
    } else if (input.id === "email") {
        result = validateEmail(input.value);
    } else if (input.id === "edad" || input.id === "fechaNac") {
        result = validateAgeAndBirth(form.edad.value, form.fechaNac.value);
        
        // Sincronizar feedback entre edad y fecha si corresponde
        if (input.id === "fechaNac") {
            showFeedback(document.getElementById("edad"), result.field === "edad" ? result : {valid: true});
        }
        
        if (!result.valid && result.field && result.field !== input.id) {
            result = { valid: true };
        }
    }

    if (input.tagName === "INPUT" && input.type !== "checkbox") {
        showFeedback(input, result);
    }

    // Gender API para el nombre
    if (input.id === "nombre" && input.value.length > 3 && result.valid) {
        const data = await checkGender(input.value);
        if (data && data.gender) {
            genderWarning.classList.toggle("hidden", data.gender === form.sexo.value);
        }
    }
    
    validateForm();
});

termsCheck.addEventListener("change", validateForm);

const renderPeopleList = () => {
    listContainer.innerHTML = "";
    if (people.length === 0) return;

    const title = document.createElement("h4");
    title.className = "col-12 mt-4 mb-3";
    title.textContent = "Personas Registradas (LocalStorage):";
    listContainer.appendChild(title);

    people.forEach((p, index) => {
        const item = document.createElement("div");
        item.className = "col-md-6 mb-3";
        item.innerHTML = `
            <div class="card p-3 shadow-sm border-0 border-start border-primary border-4 bg-white">
                <div class="d-flex justify-content-between">
                    <strong>${p.nombre} ${p.apellido}</strong>
                    <span class="badge bg-light text-dark">${p.edad} años</span>
                </div>
                <small class="text-muted">DNI: ${p.documento} | ${p.nacionalidad}</small>
                <div class="mt-2 x-small text-muted">
                    ${p.email} | ${p.telefono}
                    <br>Hijos: ${p.hijos}
                </div>
            </div>
        `;
        listContainer.appendChild(item);
    });
};

// Manejo el envío del formulario
form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const newPerson = {
        nombre: form.nombre.value,
        apellido: form.apellido.value,
        edad: form.edad.value,
        fechaNac: form.fechaNac.value,
        sexo: form.sexo.value,
        documento: form.documento.value,
        estadoCivil: form.estadoCivil.value,
        nacionalidad: form.nacionalidad.value,
        telefono: form.telefono.value,
        email: form.email.value,
        hijos: form.tieneHijos.value === "si" ? form.cantidadHijos.value : 0
    };

    people.push(newPerson);
    localStorage.setItem("peopleList", JSON.stringify(people));
    
    alert("¡Registro exitoso y guardado en LocalStorage!");

    renderPeopleList();
    form.reset();
    
    Array.from(form.elements).forEach(el => {
        el.classList.remove("is-valid", "is-invalid");
    });
    
    validateForm();
});

renderPeopleList();
