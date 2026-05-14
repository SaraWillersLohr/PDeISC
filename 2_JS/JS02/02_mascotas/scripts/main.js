// 1. Importaciones
import {
  validarTextoMascota,
  validarEdadPeso,
  validarEmail,
} from "/modules/validations.js";

const formulario = document.getElementById("petForm");
const botonEnviar = document.getElementById("submitBtn");
const checkTerminos = document.getElementById("termsCheck");
const selectVacunas = document.getElementById("vacunas");
const inputCantVacunas = document.getElementById("cantidadVacunas");
const contenedorLista = document.getElementById("petList");

// Cargo las mascotas desde localStorage al iniciar (o array vacío si no hay nada)
let listaMascotas = JSON.parse(localStorage.getItem("mascotas")) || [];

const razasPorEspecie = {
  Perro: ["Labrador", "Border Collie", "Pastor Alemán", "Bulldog", "Cane corso"],
  Gato: ["Siamés", "Persa", "Bengala", "Mestizo", "Ragdoll", "Angora"],
  Hamster: ["Sirio", "Ruso", "Roborovski", "Anillo"],
  Tortuga: ["De agua", "Terrestre", "Sulcata"],
  Ave: ["Canario", "Loro", "Cacatúa", "Periquito"],
};

/**
 * Función central de feedback visual (Sin Alerts)
 */
const mostrarFeedback = (input, resultado) => {
  if (!input) return;
  
  const mensajeError = input.parentElement.querySelector(".invalid-feedback");
  
  if (resultado.valido) {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    if (mensajeError) {
      mensajeError.style.display = "none";
      mensajeError.textContent = "";
    }
  } else {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    if (mensajeError) {
      mensajeError.style.display = "block";
      mensajeError.textContent = resultado.mensaje;
    }
  }
};

/**
 * Valida el estado general del botón
 */
const validarFormularioCompleto = () => {
  if (!formulario) return;

  const resNombre = validarTextoMascota(formulario.nombreMascota.value);
  const resDueno = validarTextoMascota(formulario.nombreDueno.value);
  const resEmail = validarEmail(formulario.email.value);
  const resEdadPeso = validarEdadPeso(
    formulario.especie.value,
    formulario.raza.value,
    formulario.edad.value,
    formulario.peso.value
  );
  
  const terminosAceptados = checkTerminos.checked;

  botonEnviar.disabled = !(
    resNombre.valido &&
    resDueno.valido &&
    resEmail.valido &&
    resEdadPeso.valido &&
    terminosAceptados
  );
};

const actualizarRazas = () => {
  const especieElegida = formulario.especie.value;
  const razas = razasPorEspecie[especieElegida] || [];

  formulario.raza.innerHTML = "";
  razas.forEach((raza) => {
    const opcion = document.createElement("option");
    opcion.value = raza;
    opcion.textContent = raza;
    formulario.raza.appendChild(opcion);
  });

  validarFormularioCompleto();
};

formulario.especie.addEventListener("change", actualizarRazas);
formulario.raza.addEventListener("change", validarFormularioCompleto);

selectVacunas.addEventListener("change", () => {
  inputCantVacunas.disabled = selectVacunas.value === "no";
  if (inputCantVacunas.disabled) {
    inputCantVacunas.value = "";
    inputCantVacunas.classList.remove("is-valid", "is-invalid");
  }
});

// ESCUCHA DE INPUTS
formulario.addEventListener("input", (e) => {
  const input = e.target;
  let resultado = { valido: true, mensaje: "" };

  if (input.id === "nombreMascota" || input.id === "nombreDueno") {
    resultado = validarTextoMascota(input.value);
  } 
  else if (input.id === "email") {
    resultado = validarEmail(input.value);
  } 
  else if (input.id === "edad" || input.id === "peso" || input.id === "especie" || input.id === "raza") {
    resultado = validarEdadPeso(
      formulario.especie.value,
      formulario.raza.value,
      formulario.edad.value,
      formulario.peso.value
    );

    if (!resultado.valido && resultado.campo && resultado.campo !== input.id) {
       if (input.id === "especie" || input.id === "raza") {
          mostrarFeedback(document.getElementById("edad"), resultado.campo === "edad" ? resultado : { valido: true });
          mostrarFeedback(document.getElementById("peso"), resultado.campo === "peso" ? resultado : { valido: true });
       }
       resultado = { valido: true }; 
    }
  }

  if (input.tagName === "INPUT" && input.type !== "checkbox") {
    mostrarFeedback(input, resultado);
  }

  validarFormularioCompleto();
});

checkTerminos.addEventListener("change", validarFormularioCompleto);

formulario.addEventListener("submit", (e) => {
  e.preventDefault();

  const nuevaMascota = {
    id: Date.now(),
    nombre: formulario.nombreMascota.value,
    especie: formulario.especie.value,
    raza: formulario.raza.value,
    edad: formulario.edad.value,
    peso: formulario.peso.value,
    dueno: formulario.nombreDueno.value,
    email: formulario.email.value,
    vacunas: formulario.vacunas.value,
  };

  listaMascotas.push(nuevaMascota);
  
  // Guardo la lista actualizada en localStorage
  localStorage.setItem("mascotas", JSON.stringify(listaMascotas));

  dibujarListaMascotas();
  formulario.reset();

  Array.from(formulario.elements).forEach((el) => {
    el.classList.remove("is-valid", "is-invalid");
    const msg = el.parentElement.querySelector(".invalid-feedback");
    if (msg) msg.style.display = "none";
  });

  actualizarRazas();
});

const dibujarListaMascotas = () => {
  contenedorLista.innerHTML = "";
  
  listaMascotas.forEach((mascota, indice) => {
    const columna = document.createElement("div");
    columna.className = "col-md-4 mb-4";
    columna.innerHTML = `
            <div class="card h-100 p-3 shadow-sm border-0 rounded-3">
                <h3 class="h5 mb-2">🐾 ${mascota.nombre}</h3>
                <p class="small text-muted mb-1">${mascota.especie} (${mascota.raza})</p>
                <p class="small text-muted mb-0">Dueño: ${mascota.dueno}</p>
                <button class="btn btn-outline-danger btn-sm mt-3 btn-borrar">BORRAR</button>
            </div>
        `;
    
    columna.querySelector(".btn-borrar").addEventListener("click", () => {
      listaMascotas.splice(indice, 1);
      
      // Guardo la lista actualizada después de borrar
      localStorage.setItem("mascotas", JSON.stringify(listaMascotas));
      
      dibujarListaMascotas();
    });
    
    contenedorLista.appendChild(columna);
  });
};

// Carga inicial: actualizamos razas y dibujamos lo que haya en localStorage
actualizarRazas();
dibujarListaMascotas();