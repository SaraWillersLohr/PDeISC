import { cargarTema, cambiarTema } from "../context/theme.js";
import { obtenerPalabra, guardarScore, obtenerRanking } from "./modules/api.js";
import JuegoAhorcado from "./modules/juego.js";
import { crearTeclado } from "./modules/teclado.js";
import { manejarLetra, configurarScrollTop } from "./modules/eventos.js";
import { renderAhorcado } from "./modules/render.js";
import { cargarRanking } from "./modules/ranking.js";
import { validarNombre } from "./modules/validaciones.js";
import { descargarPDF } from "./modules/pdf.js";

// ── Instancia de Juego ──
const juego = new JuegoAhorcado();

// ── Estado de Sesión ──
let puntosSession    = 0;
let tiempoSession    = 0;
let cronometro       = null;
let especialidadActual = "";
let palabrasJugadas  = [];
let juegoActivo      = false;

// ── Elementos del DOM ──
const btnTema        = document.getElementById("btnTema");
const iconTema       = document.getElementById("iconTema");
const palabraRender  = document.getElementById("palabraRender");
const pistaEl        = document.getElementById("pista");
const tecladoEl      = document.getElementById("teclado");
const letrasUsadasEl = document.getElementById("letrasUsadas");
const letrasPlaceholder = document.getElementById("letrasUsadasPlaceholder");
const btnGuardarScore= document.getElementById("btnGuardarScore");
const nombreJugador  = document.getElementById("nombreJugador");
const tiempoSpan     = document.getElementById("tiempo");
const puntosSpan     = document.getElementById("puntos");
const intentosSpan   = document.getElementById("intentos");
const statEsp        = document.getElementById("statEspecialidad");
const btnTop         = document.getElementById("btnTop");
const btnPdf         = document.getElementById("btnPdf");
const errorNombreDOM = document.getElementById("errorNombreDOM");

// ── Helpers de Modal ──
function abrirModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.hidden = false;
    el.removeAttribute("hidden");
    // Agregar animación
    const box = el.querySelector(".modal-box");
    if (box) { box.classList.remove("animate"); void box.offsetWidth; box.classList.add("animate"); }
    // Foco accesibilidad
    const firstBtn = el.querySelector(".btn-modal");
    if (firstBtn) setTimeout(() => firstBtn.focus(), 60);
  }
}

function cerrarModal(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

// Cerrar modal al hacer click en el overlay
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    // Solo si se hace click directamente en el overlay, no en el box
    if (e.target === overlay) {
      // No cerrar modales de fin de juego (evitar cierre accidental)
    }
  });
});


// ── Tema ──
cargarTema();
actualizarIconTema();

btnTema.addEventListener("click", () => {
  cambiarTema();
  actualizarIconTema();
});

function actualizarIconTema() {
  const tema = localStorage.getItem("tema") || "light";
  // Cambiar ícono
  if (iconTema) {
    iconTema.setAttribute("data-lucide", tema === "dark" ? "sun" : "moon");
    lucide.createIcons();
  }
}

// ── Inicialización ──
cargarRanking();
configurarScrollTop(btnTop);

// ── Formateo de tiempo ──
function formatTiempo(segundos) {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
}

// ── Cronómetro ──
function iniciarCronometro() {
  detenerCronometro();
  cronometro = setInterval(() => {
    tiempoSession++;
    tiempoSpan.textContent = formatTiempo(tiempoSession);
  }, 1000);
}

function detenerCronometro() {
  if (cronometro) { clearInterval(cronometro); cronometro = null; }
}

// ── Reset de sesión ──
function resetearSesionCompleta() {
  detenerCronometro();
  puntosSession    = 0;
  tiempoSession    = 0;
  palabrasJugadas  = [];
  especialidadActual = "";
  juegoActivo      = false;

  tiempoSpan.textContent   = "00:00";
  puntosSpan.textContent   = "0";
  intentosSpan.textContent = "6";
  statEsp.textContent      = "–";

  palabraRender.innerHTML = '<span class="placeholder-chico">Seleccioná una especialidad</span>';
  pistaEl.textContent     = "Seleccioná una especialidad para comenzar";
  letrasUsadasEl.innerHTML = "";
  if (letrasPlaceholder) letrasPlaceholder.style.display = "";
  tecladoEl.innerHTML     = "";
  renderAhorcado(0);

  document.querySelectorAll(".btn-especialidad").forEach(b => b.classList.remove("activa"));
}


// ── Nueva Ronda ──
async function iniciarNuevaRonda() {
  try {
    const dato = await obtenerPalabra(especialidadActual, palabrasJugadas);

    if (dato.fin) {
      detenerCronometro();
      juegoActivo = false;
      abrirModal("modalFinPalabras");
      return;
    }

    palabrasJugadas.push(dato.palabra);
    juego.iniciar(dato.palabra, dato.pista);
    juegoActivo = true;

    palabraRender.textContent = juego.palabraOculta();
    pistaEl.textContent       = dato.pista;
    letrasUsadasEl.innerHTML  = "";
    if (letrasPlaceholder) letrasPlaceholder.style.display = "";
    renderAhorcado(0);

    intentosSpan.textContent = juego.maxErrores;
    puntosSpan.textContent   = puntosSession;
    tiempoSpan.textContent   = formatTiempo(tiempoSession);

    crearTeclado(tecladoEl, (letra) => procesarLetra(letra));
    iniciarCronometro();

  } catch (error) {
    console.error("Error al iniciar nueva ronda:", error);
    mostrarError("Ocurrió un error al obtener la palabra. Reintentá.");
  }
}

// ── Procesar Letra ──
function procesarLetra(letra) {
  if (!juegoActivo || juego.gano() || juego.perdio()) return;

  const exito = manejarLetra(juego, letra, palabraRender, letrasUsadasEl);
  if (!exito) return;

  // Ocultar placeholder de letras
  if (letrasPlaceholder) letrasPlaceholder.style.display = "none";

  intentosSpan.textContent = juego.maxErrores - juego.errores;

  const normalizar = (c) => c.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  if (normalizar(juego.palabra).includes(normalizar(letra))) {
    puntosSession += 10;
    puntosSpan.textContent = puntosSession;
  }

  if (juego.gano()) {
    detenerCronometro();
    juegoActivo = false;
    puntosSession += 100;
    puntosSpan.textContent = puntosSession;

    document.getElementById("modalVictoriaPuntos").textContent = puntosSession;
    document.getElementById("modalVictoriaTiempo").textContent = formatTiempo(tiempoSession);
    abrirModal("modalVictoria");
  }

  if (juego.perdio()) {
    detenerCronometro();
    juegoActivo = false;

    document.getElementById("palabraCorrectaDerrota").textContent = juego.palabra;
    document.getElementById("modalDerrotaPuntos").textContent     = puntosSession;
    document.getElementById("modalDerrotaTiempo").textContent     = formatTiempo(tiempoSession);
    abrirModal("modalDerrota");
  }
}

// ── Helpers de UI ──
function mostrarError(msg) {
  errorNombreDOM.textContent = msg;
  errorNombreDOM.className = "error-mensaje";
  setTimeout(() => { errorNombreDOM.textContent = ""; }, 5000);
}

function mostrarExito(msg) {
  errorNombreDOM.textContent = msg;
  errorNombreDOM.className = "error-mensaje success";
  setTimeout(() => { errorNombreDOM.textContent = ""; errorNombreDOM.className = "error-mensaje"; }, 3000);
}


// ── Eventos de Especialidades ──
document.querySelectorAll(".btn-especialidad").forEach((boton) => {
  boton.addEventListener("click", () => {
    if (boton.classList.contains("activa") && juegoActivo) return;

    document.querySelectorAll(".btn-especialidad").forEach(b => b.classList.remove("activa"));
    boton.classList.add("activa");

    especialidadActual = boton.dataset.especialidad;
    statEsp.textContent = boton.querySelector(".esp-nombre").textContent.trim();

    puntosSession  = 0;
    tiempoSession  = 0;
    palabrasJugadas = [];

    iniciarNuevaRonda();
  });
});

// ── Teclado Físico ──
window.addEventListener("keydown", (e) => {
  if (!juegoActivo) return;
  if (document.querySelector(".modal-overlay:not([hidden])")) return;
  if (document.activeElement === nombreJugador) return;

  const tecla = e.key.toUpperCase();
  const letraNorm = tecla.normalize("NFD").replace(/[\u0300-\u036f]/g,"");

  if (/^[A-ZÑ]$/.test(letraNorm)) procesarLetra(letraNorm);
});

// ── Modales: Victoria ──
document.getElementById("btnSeguir")?.addEventListener("click", () => {
  cerrarModal("modalVictoria");
  iniciarNuevaRonda();
});

document.getElementById("btnGuardar")?.addEventListener("click", () => {
  cerrarModal("modalVictoria");
  document.getElementById("nombreJugador").scrollIntoView({ behavior: "smooth" });
  nombreJugador.focus();
});

// ── Modales: Derrota ──
document.getElementById("btnDerrotaReiniciar")?.addEventListener("click", () => {
  cerrarModal("modalDerrota");
  resetearSesionCompleta();
});

document.getElementById("btnDerrotaGuardar")?.addEventListener("click", () => {
  cerrarModal("modalDerrota");
  document.getElementById("nombreJugador").scrollIntoView({ behavior: "smooth" });
  nombreJugador.focus();
});

// ── Modales: Fin de Palabras ──
document.getElementById("btnFinEspecialidad")?.addEventListener("click", () => {
  cerrarModal("modalFinPalabras");
  const espContainer = document.getElementById("especialidades");
  espContainer.scrollIntoView({ behavior: "smooth" });
  espContainer.classList.add("highlight-pulse");
  setTimeout(() => espContainer.classList.remove("highlight-pulse"), 3600);
});

document.getElementById("btnFinGuardar")?.addEventListener("click", () => {
  cerrarModal("modalFinPalabras");
  document.getElementById("nombreJugador").scrollIntoView({ behavior: "smooth" });
  nombreJugador.focus();
});

// ── Modal Score Guardado ──
document.getElementById("btnModalGuardarCerrar")?.addEventListener("click", () => {
  cerrarModal("modalGuardarScore");
  resetearSesionCompleta();
});


// ── Guardar Score ──
btnGuardarScore?.addEventListener("click", async () => {
  const nombre = nombreJugador.value;

  if (!validarNombre(nombre)) {
    errorNombreDOM.textContent = "Nombre inválido (entre 3 y 20 caracteres: letras, números y espacios)";
    errorNombreDOM.className   = "error-mensaje";
    nombreJugador.classList.add("is-invalid");
    return;
  }

  errorNombreDOM.textContent = "";
  nombreJugador.classList.remove("is-invalid");

  if (!especialidadActual) {
    mostrarError("Debés elegir una especialidad e iniciar una partida antes de guardar.");
    return;
  }

  try {
    btnGuardarScore.disabled = true;

    await guardarScore({
      nombre:      nombre.trim(),
      tiempo:      tiempoSession,
      puntos:      puntosSession,
      especialidad:especialidadActual,
    });

    await cargarRanking();

    // Mostrar modal de éxito
    document.getElementById("modalGuardarNombre").textContent = nombre.trim();
    document.getElementById("modalGuardarPuntos").textContent = puntosSession;
    nombreJugador.value = "";
    abrirModal("modalGuardarScore");

  } catch (error) {
    console.error("Error al guardar score:", error);
    mostrarError(error.message || "Error al intentar registrar el score en el servidor.");
  } finally {
    btnGuardarScore.disabled = false;
  }
});

// ── Descarga PDF ──
btnPdf?.addEventListener("click", async () => {
  try {
    btnPdf.disabled = true;
    const ranking = await obtenerRanking();
    descargarPDF(ranking);
  } catch (error) {
    console.error("Error al descargar PDF:", error);
    mostrarError("Error obteniendo ranking para exportar PDF.");
  } finally {
    btnPdf.disabled = false;
  }
});

// ── Portrait Warning ──
document.getElementById("btnIgnorePortrait")?.addEventListener("click", () => {
  document.body.classList.add("ignore-portrait");
});

// ── Init Lucide ──
lucide.createIcons();

