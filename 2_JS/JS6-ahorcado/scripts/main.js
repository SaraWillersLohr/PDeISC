import { cargarTema, cambiarTema } from "../context/theme.js";
import { obtenerPalabra, guardarScore, obtenerRanking } from "./modules/api.js";
import JuegoAhorcado from "./modules/juego.js";
import { crearTeclado } from "./modules/teclado.js";
import { manejarLetra, configurarScrollTop } from "./modules/eventos.js";
import { renderAhorcado } from "./modules/render.js";
import { cargarRanking } from "./modules/ranking.js";
import { validarNombre } from "./modules/validaciones.js";
import { descargarPDF } from "./pdf.js";

// Instancia de Juego
const juego = new JuegoAhorcado();

// Estado de la Sesión de Juego (Partida Acumulada)
let puntosSession = 0;
let tiempoSession = 0; // en segundos
let cronometro = null;
let especialidadActual = "";
let palabrasJugadas = []; // Almacena palabras jugadas en la sesión actual
let juegoActivo = false;

// Instancias de Modales Bootstrap (inicialización lazy)
let bootstrapModalVictoria = null;
let bootstrapModalDerrota = null;
let bootstrapModalFinPalabras = null;

// --------------------
// Elementos del DOM
// --------------------
const btnTema = document.getElementById("btnTema");
const palabraRender = document.getElementById("palabraRender");
const pista = document.getElementById("pista");
const teclado = document.getElementById("teclado");
const letrasUsadas = document.getElementById("letrasUsadas");
const btnGuardarScore = document.getElementById("btnGuardarScore");
const nombreJugador = document.getElementById("nombreJugador");
const tiempoSpan = document.getElementById("tiempo");
const puntosSpan = document.getElementById("puntos");
const intentosSpan = document.getElementById("intentos");
const btnTop = document.getElementById("btnTop");
const btnPdf = document.getElementById("btnPdf");

// Errores e inputs de validación
const errorNombreDOM = document.createElement("div");
errorNombreDOM.className = "text-danger mt-2 fw-bold";
errorNombreDOM.id = "errorNombreDOM";
nombreJugador.parentNode.appendChild(errorNombreDOM);

// Modales y botones internos
const btnSeguir = document.getElementById("btnSeguir");
const btnGuardar = document.getElementById("btnGuardar");

// --------------------
// Inicialización
// --------------------
cargarTema();
btnTema.addEventListener("click", cambiarTema);
cargarRanking();
configurarScrollTop(btnTop);

// --------------------
// Formateadores
// --------------------
function formatTiempo(segundos) {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// --------------------
// Cronómetro
// --------------------
function iniciarCronometro() {
  detenerCronometro();
  cronometro = setInterval(() => {
    tiempoSession++;
    tiempoSpan.textContent = formatTiempo(tiempoSession);
  }, 1000);
}

function detenerCronometro() {
  if (cronometro) {
    clearInterval(cronometro);
    cronometro = null;
  }
}

// Resetear sesión completa (para reiniciar de cero)
function resetearSesionCompleta() {
  detenerCronometro();
  puntosSession = 0;
  tiempoSession = 0;
  palabrasJugadas = [];
  especialidadActual = "";
  juegoActivo = false;
  
  tiempoSpan.textContent = "00:00";
  puntosSpan.textContent = "0";
  intentosSpan.textContent = "6";
  palabraRender.textContent = "Seleccioná una especialidad";
  pista.textContent = "-";
  letrasUsadas.innerHTML = "";
  teclado.innerHTML = "";
  renderAhorcado(0);

  document.querySelectorAll(".especialidad").forEach((btn) => btn.classList.remove("activa"));
}

// --------------------
// Lógica de Juego
// --------------------
async function iniciarNuevaRonda() {
  try {
    // Fetch palabra de la especialidad actual excluyendo jugadas
    const dato = await obtenerPalabra(especialidadActual, palabrasJugadas);

    // Si terminó el banco de palabras
    if (dato.fin) {
      detenerCronometro();
      juegoActivo = false;
      
      if (!bootstrapModalFinPalabras) {
        bootstrapModalFinPalabras = new bootstrap.Modal(document.getElementById("modalFinPalabras"));
      }
      bootstrapModalFinPalabras.show();
      return;
    }

    // Registrar palabra jugada
    palabrasJugadas.push(dato.palabra);

    // Iniciar juego
    juego.iniciar(dato.palabra, dato.pista);
    juegoActivo = true;

    // Renderizar
    palabraRender.textContent = juego.palabraOculta();
    pista.textContent = dato.pista;
    letrasUsadas.innerHTML = "";
    renderAhorcado(0);

    intentosSpan.textContent = juego.maxErrores;
    puntosSpan.textContent = puntosSession;
    tiempoSpan.textContent = formatTiempo(tiempoSession);

    // Generar teclado virtual
    crearTeclado(teclado, (letra) => {
      procesarLetra(letra);
    });

    // Iniciar cronómetro
    iniciarCronometro();

  } catch (error) {
    console.error("Error al iniciar nueva ronda:", error);
    errorNombreDOM.textContent = "Ocurrió un error al obtener la palabra. Reintentá.";
    setTimeout(() => { errorNombreDOM.textContent = ""; }, 5000);
  }
}

function procesarLetra(letra) {
  if (!juegoActivo || juego.gano() || juego.perdio()) return;

  const exito = manejarLetra(juego, letra, palabraRender, letrasUsadas);
  if (!exito) return; // Ya fue jugada

  // Actualizar intentos en pantalla
  intentosSpan.textContent = juego.maxErrores - juego.errores;

  // Sumar 10 puntos si acertó
  const normalizar = (c) => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const palabraNorm = normalizar(juego.palabra);
  const letraNorm = normalizar(letra);

  if (palabraNorm.includes(letraNorm)) {
    puntosSession += 10;
    puntosSpan.textContent = puntosSession;
  }

  // Verificar victoria
  if (juego.gano()) {
    detenerCronometro();
    juegoActivo = false;
    puntosSession += 100;
    puntosSpan.textContent = puntosSession;

    // Actualizar datos del modal de victoria
    document.getElementById("modalVictoriaPuntos").textContent = puntosSession;
    document.getElementById("modalVictoriaTiempo").textContent = formatTiempo(tiempoSession);

    if (!bootstrapModalVictoria) {
      bootstrapModalVictoria = new bootstrap.Modal(document.getElementById("modalVictoria"));
    }
    bootstrapModalVictoria.show();
  }

  // Verificar derrota
  if (juego.perdio()) {
    detenerCronometro();
    juegoActivo = false;

    // Mostrar palabra correcta en modal de derrota
    document.getElementById("palabraCorrectaDerrota").textContent = juego.palabra;
    document.getElementById("modalDerrotaPuntos").textContent = puntosSession;
    document.getElementById("modalDerrotaTiempo").textContent = formatTiempo(tiempoSession);

    if (!bootstrapModalDerrota) {
      bootstrapModalDerrota = new bootstrap.Modal(document.getElementById("modalDerrota"));
    }
    bootstrapModalDerrota.show();
  }
}

// --------------------
// Eventos Especialidades
// --------------------
document.querySelectorAll(".especialidad").forEach((boton) => {
  boton.addEventListener("click", () => {
    // Si ya está activa y hay un juego en marcha, no reiniciar
    if (boton.classList.contains("activa") && juegoActivo) return;

    // Limpiar clases activas
    document.querySelectorAll(".especialidad").forEach((btn) => btn.classList.remove("activa"));
    boton.classList.add("activa");

    especialidadActual = boton.dataset.especialidad;
    
    // Al hacer click en una especialidad desde el menú principal, reiniciamos la sesión acumulada
    puntosSession = 0;
    tiempoSession = 0;
    palabrasJugadas = [];
    
    iniciarNuevaRonda();
  });
});

// --------------------
// Eventos del Teclado Físico
// --------------------
window.addEventListener("keydown", (e) => {
  if (!juegoActivo) return;

  // Si hay algún modal abierto, ignorar teclado
  if (document.querySelector(".modal.show")) return;

  // Si se está escribiendo en el input de nombre, ignorar teclado del juego
  if (document.activeElement === nombreJugador) return;

  // Capturar tecla y normalizar
  const tecla = e.key.toUpperCase();
  const letraNorm = tecla.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Verificar si es letra del abecedario o Ñ
  if (/^[A-ZÑ]$/.test(letraNorm)) {
    procesarLetra(letraNorm);
  }
});

// --------------------
// Eventos Modales
// --------------------

// Modal Victoria: Seguir Jugando
btnSeguir?.addEventListener("click", () => {
  if (bootstrapModalVictoria) {
    bootstrapModalVictoria.hide();
  }
  iniciarNuevaRonda();
});

// Modal Victoria: Guardar Score
btnGuardar?.addEventListener("click", () => {
  if (bootstrapModalVictoria) {
    bootstrapModalVictoria.hide();
  }
  // Hacer scroll e ir al formulario
  document.getElementById("nombreJugador").scrollIntoView({ behavior: "smooth" });
  nombreJugador.focus();
});

// Modal Derrota: Volver a jugar (reinicia sesión completa)
document.getElementById("btnDerrotaReiniciar")?.addEventListener("click", () => {
  if (bootstrapModalDerrota) {
    bootstrapModalDerrota.hide();
  }
  resetearSesionCompleta();
});

// Modal Derrota: Guardar score
document.getElementById("btnDerrotaGuardar")?.addEventListener("click", () => {
  if (bootstrapModalDerrota) {
    bootstrapModalDerrota.hide();
  }
  document.getElementById("nombreJugador").scrollIntoView({ behavior: "smooth" });
  nombreJugador.focus();
});

// Modal Fin Palabras: Cambiar Especialidad
document.getElementById("btnFinEspecialidad")?.addEventListener("click", () => {
  if (bootstrapModalFinPalabras) {
    bootstrapModalFinPalabras.hide();
  }
  // Resalta los botones de especialidad
  const espContainer = document.getElementById("especialidades");
  espContainer.scrollIntoView({ behavior: "smooth" });
  espContainer.classList.add("highlight-pulse");
  setTimeout(() => { espContainer.classList.remove("highlight-pulse"); }, 2000);
});

// Modal Fin Palabras: Guardar score
document.getElementById("btnFinGuardar")?.addEventListener("click", () => {
  if (bootstrapModalFinPalabras) {
    bootstrapModalFinPalabras.hide();
  }
  document.getElementById("nombreJugador").scrollIntoView({ behavior: "smooth" });
  nombreJugador.focus();
});

// --------------------
// Eventos Guardar Score
// --------------------
btnGuardarScore?.addEventListener("click", async () => {
  const nombre = nombreJugador.value;

  // Validación Frontend
  if (!validarNombre(nombre)) {
    errorNombreDOM.textContent = "Nombre inválido (debe tener entre 3 y 20 caracteres alfanuméricos y espacios)";
    nombreJugador.classList.add("is-invalid");
    return;
  }

  errorNombreDOM.textContent = "";
  nombreJugador.classList.remove("is-invalid");

  if (!especialidadActual) {
    errorNombreDOM.textContent = "Debés elegir una especialidad e iniciar una partida antes de guardar.";
    return;
  }

  try {
    btnGuardarScore.disabled = true;
    
    await guardarScore({
      nombre: nombre.trim(),
      tiempo: tiempoSession,
      puntos: puntosSession,
      especialidad: especialidadActual,
    });

    // Éxito: recargar ranking y resetear
    await cargarRanking();
    
    // Mensaje de éxito contextual en el DOM
    errorNombreDOM.className = "text-success mt-2 fw-bold";
    errorNombreDOM.textContent = "¡Partida guardada con éxito!";
    nombreJugador.value = "";
    
    setTimeout(() => {
      errorNombreDOM.textContent = "";
      errorNombreDOM.className = "text-danger mt-2 fw-bold";
      resetearSesionCompleta();
    }, 2000);

  } catch (error) {
    console.error("Error al guardar score:", error);
    errorNombreDOM.textContent = error.message || "Error al intentar registrar el score en el servidor.";
  } finally {
    btnGuardarScore.disabled = false;
  }
});

// --------------------
// Evento Descarga PDF
// --------------------
btnPdf?.addEventListener("click", async () => {
  try {
    btnPdf.disabled = true;
    const ranking = await obtenerRanking();
    descargarPDF(ranking);
  } catch (error) {
    console.error("Error al descargar PDF:", error);
    errorNombreDOM.textContent = "Error obteniendo ranking para exportar PDF.";
    setTimeout(() => { errorNombreDOM.textContent = ""; }, 5000);
  } finally {
    btnPdf.disabled = false;
  }
});

// Inicializar Lucide
lucide.createIcons();
