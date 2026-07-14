// controlador principal del juego del ahorcado.
// organiza la interfaz, la sesión del jugador, las rondas, la conexión con la api
// y la integración con los módulos de teclado, ranking, validaciones y pdf.
import { obtenerPalabra, guardarScore, obtenerRanking } from "./modules/api.js";
import JuegoAhorcado from "./modules/juego.js";
import Jugador from "./modules/jugador.js";
import Score from "./modules/score.js";
import { crearTeclado, mostrarTecladoInactivo } from "./modules/teclado.js";
import { manejarLetra, configurarScrollTop } from "./modules/eventos.js";
import { renderAhorcado } from "./modules/render.js";
import { cargarRanking } from "./modules/ranking.js";
import { validarNombre } from "./modules/validaciones.js";
import { descargarPDF } from "./modules/pdf.js";

// instancia principal del juego.
const juego = new JuegoAhorcado();

// instancia del jugador activo para guardar datos de la sesión.
const jugadorActual = new Jugador();

// estado actual de la partida: puntos, tiempo, ronda y especialidad.
let puntosSession = 0;
let tiempoSession = 0;
let cronometro = null;
let especialidadActual = "";
let palabrasJugadas = [];
let juegoActivo = false;

// referencias a los elementos del html que se actualizan durante la partida.
const btnTema = document.getElementById("btnTema");
const iconTema = document.getElementById("iconTema");
const palabraRender = document.getElementById("palabraRender");
const pistaEl = document.getElementById("pista");
const tecladoEl = document.getElementById("teclado");
const letrasUsadasEl = document.getElementById("letrasUsadas");
const letrasPlaceholder = document.getElementById("letrasUsadasPlaceholder");
const btnGuardarScore = document.getElementById("btnGuardarScore");
const nombreJugador = document.getElementById("nombreJugador");
const tiempoSpan = document.getElementById("tiempo");
const puntosSpan = document.getElementById("puntos");
const intentosSpan = document.getElementById("intentos");
const statEsp = document.getElementById("statEspecialidad");
const btnTop = document.getElementById("btnTop");
const btnPdf = document.getElementById("btnPdf");
const errorNombreDOM = document.getElementById("errorNombreDOM");
const btnInstrucciones = document.getElementById("btnInstrucciones");

// abre un modal por su id y le da una animación simple.
function abrirModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.hidden = false;
    el.removeAttribute("hidden");
    // Agregar animación
    const box = el.querySelector(".modal-box");
    if (box) {
      box.classList.remove("animate");
      void box.offsetWidth;
      box.classList.add("animate");
    }
    // Foco accesibilidad
    const firstBtn = el.querySelector(".btn-modal");
    if (firstBtn) setTimeout(() => firstBtn.focus(), 60);
  }
}
// cierra un modal por su id.
function cerrarModal(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

// cierra el modal al hacer clic sobre la capa de fondo.
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    // solo si se hace clic directamente sobre la capa, no sobre el cuadro del modal.
    if (e.target === overlay) {
      // no cerrar los modales de fin de juego para evitar cierres accidentales.
    }
  });
});

// carga el tema guardado y actualiza el icono del botón.
cargarTema();
actualizarIconTema();

btnTema.addEventListener("click", () => {
  cambiarTema();
  actualizarIconTema();
});
// cambia el icono según el tema que esté activo.
function actualizarIconTema() {
  const tema = localStorage.getItem("tema") || "light";
  if (iconTema) {
    iconTema.setAttribute("data-lucide", tema === "dark" ? "sun" : "moon");
    lucide.createIcons();
  }
}

// muestra las instrucciones al abrir la página si el usuario no las ha ocultado antes.
function mostrarInstruccionesAuto() {
  const noMostrar = localStorage.getItem("instruccionesOmitidas") === "true";
  if (!noMostrar) abrirModal("modalInstrucciones");
}

btnInstrucciones?.addEventListener("click", () => {
  abrirModal("modalInstrucciones");
});

document
  .getElementById("btnInstruccionesComenzar")
  ?.addEventListener("click", () => {
    const check = document.getElementById("checkNoMostrar");
    if (check?.checked) localStorage.setItem("instruccionesOmitidas", "true");
    cerrarModal("modalInstrucciones");
  });

document
  .getElementById("btnInstruccionesOmitir")
  ?.addEventListener("click", () => {
    const check = document.getElementById("checkNoMostrar");
    if (check?.checked) localStorage.setItem("instruccionesOmitidas", "true");
    cerrarModal("modalInstrucciones");
  });

// ── inicio ──
// carga el ranking, activa el botón de subir, muestra el teclado inactivo
// y abre las instrucciones si corresponde.
cargarRanking();
configurarScrollTop(btnTop);
mostrarTecladoInactivo(tecladoEl);
mostrarInstruccionesAuto();

// ── formato de tiempo ──
// convierte los segundos a un formato fácil de leer: minutos y segundos.
function formatTiempo(segundos) {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// ── cronómetro ──
// inicia el contador de la partida y actualiza el tiempo cada segundo.
function iniciarCronometro() {
  detenerCronometro();
  cronometro = setInterval(() => {
    tiempoSession++;
    tiempoSpan.textContent = formatTiempo(tiempoSession);
  }, 1000);
}

// detiene el cronómetro cuando la partida termina, se reinicia o se pausa.
function detenerCronometro() {
  if (cronometro) {
    clearInterval(cronometro);
    cronometro = null;
  }
}

// ── reinicio de sesión ──
// reinicia todo el estado de la sesión para empezar de nuevo.
function resetearSesionCompleta() {
  detenerCronometro();
  puntosSession = 0;
  tiempoSession = 0;
  palabrasJugadas = [];
  especialidadActual = "";
  juegoActivo = false;

  // reinicia la instancia del jugador.
  jugadorActual.nombre = "";
  jugadorActual.puntos = 0;
  jugadorActual.tiempo = 0;

  tiempoSpan.textContent = "00:00";
  puntosSpan.textContent = "0";
  intentosSpan.textContent = "6";
  statEsp.textContent = "–";

  palabraRender.innerHTML =
    '<span class="placeholder-chico">Seleccioná una especialidad</span>';
  pistaEl.textContent = "Seleccioná una especialidad para comenzar";
  letrasUsadasEl.innerHTML = "";
  if (letrasPlaceholder) letrasPlaceholder.style.display = "";
  mostrarTecladoInactivo(tecladoEl);
  renderAhorcado(0);

  document
    .querySelectorAll(".btn-especialidad")
    .forEach((b) => b.classList.remove("activa"));
}

// ── nueva ronda ──
// obtiene una nueva palabra desde la api, inicia el juego y muestra la ronda actual.
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
    pistaEl.textContent = dato.pista;
    letrasUsadasEl.innerHTML = "";
    if (letrasPlaceholder) letrasPlaceholder.style.display = "";
    renderAhorcado(0);

    intentosSpan.textContent = juego.maxErrores;
    puntosSpan.textContent = puntosSession;
    tiempoSpan.textContent = formatTiempo(tiempoSession);

    crearTeclado(tecladoEl, (letra) => procesarLetra(letra));
    iniciarCronometro();
  } catch (error) {
    console.error("Error al iniciar nueva ronda:", error);
    mostrarError("Ocurrió un error al obtener la palabra. Reintentá.");
  }
}

// ── procesar letra ──
// procesa una letra escrita con el teclado virtual o físico, actualiza el juego
// y controla los puntos, la victoria y la derrota.
function procesarLetra(letra) {
  if (!juegoActivo || juego.gano() || juego.perdio()) return;

  const exito = manejarLetra(juego, letra, palabraRender, letrasUsadasEl);
  if (!exito) return;

  // Ocultar placeholder de letras
  if (letrasPlaceholder) letrasPlaceholder.style.display = "none";

  intentosSpan.textContent = juego.maxErrores - juego.errores;

  const normalizar = (c) => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
    document.getElementById("modalVictoriaTiempo").textContent =
      formatTiempo(tiempoSession);
    abrirModal("modalVictoria");
  }

  if (juego.perdio()) {
    detenerCronometro();
    juegoActivo = false;

    document.getElementById("palabraCorrectaDerrota").textContent =
      juego.palabra;
    document.getElementById("modalDerrotaPuntos").textContent = puntosSession;
    document.getElementById("modalDerrotaTiempo").textContent =
      formatTiempo(tiempoSession);
    abrirModal("modalDerrota");
  }
}

// ── ayuda visual ──
// muestra mensajes de error en la interfaz cuando algo falla.
function mostrarError(msg) {
  errorNombreDOM.textContent = msg;
  errorNombreDOM.className = "error-mensaje";
  setTimeout(() => {
    errorNombreDOM.textContent = "";
  }, 5000);
}

// muestra mensajes positivos para confirmar que una acción salió bien.
function mostrarExito(msg) {
  errorNombreDOM.textContent = msg;
  errorNombreDOM.className = "error-mensaje success";
  setTimeout(() => {
    errorNombreDOM.textContent = "";
    errorNombreDOM.className = "error-mensaje";
  }, 3000);
}

// ── eventos de especialidades ──
document.querySelectorAll(".btn-especialidad").forEach((boton) => {
  boton.addEventListener("click", () => {
    if (boton.classList.contains("activa") && juegoActivo) return;

    document
      .querySelectorAll(".btn-especialidad")
      .forEach((b) => b.classList.remove("activa"));
    boton.classList.add("activa");

    especialidadActual = boton.dataset.especialidad;
    statEsp.textContent = boton.querySelector(".esp-nombre").textContent.trim();

    puntosSession = 0;
    tiempoSession = 0;
    palabrasJugadas = [];

    iniciarNuevaRonda();
  });
});

// ── teclado físico ──
window.addEventListener("keydown", (e) => {
  if (!juegoActivo) return;
  if (document.querySelector(".modal-overlay:not([hidden])")) return;
  if (document.activeElement === nombreJugador) return;

  const tecla = e.key.toUpperCase();

  // Aceptar letras del abecedario español (A-Z y Ñ)
  if (/^[A-ZÁÉÍÓÚÑÜZ]$/.test(tecla)) procesarLetra(tecla);
});

// ── modales: victoria ──
document.getElementById("btnSeguir")?.addEventListener("click", () => {
  cerrarModal("modalVictoria");
  iniciarNuevaRonda();
});

document.getElementById("btnGuardar")?.addEventListener("click", () => {
  cerrarModal("modalVictoria");
  document
    .getElementById("nombreJugador")
    .scrollIntoView({ behavior: "smooth" });
  nombreJugador.focus();
});

// ── modales: derrota ──
document
  .getElementById("btnDerrotaReiniciar")
  ?.addEventListener("click", () => {
    cerrarModal("modalDerrota");
    resetearSesionCompleta();
  });

document.getElementById("btnDerrotaGuardar")?.addEventListener("click", () => {
  cerrarModal("modalDerrota");
  document
    .getElementById("nombreJugador")
    .scrollIntoView({ behavior: "smooth" });
  nombreJugador.focus();
});

// ── modales: fin de palabras ──
document.getElementById("btnFinEspecialidad")?.addEventListener("click", () => {
  cerrarModal("modalFinPalabras");
  const espContainer = document.getElementById("especialidades");
  espContainer.scrollIntoView({ behavior: "smooth" });
  espContainer.classList.add("highlight-pulse");
  setTimeout(() => espContainer.classList.remove("highlight-pulse"), 3600);
});

document.getElementById("btnFinGuardar")?.addEventListener("click", () => {
  cerrarModal("modalFinPalabras");
  document
    .getElementById("nombreJugador")
    .scrollIntoView({ behavior: "smooth" });
  nombreJugador.focus();
});

// ── modal de score guardado ──
document
  .getElementById("btnModalGuardarCerrar")
  ?.addEventListener("click", () => {
    cerrarModal("modalGuardarScore");
    resetearSesionCompleta();
  });

// ── guardar score ──
btnGuardarScore?.addEventListener("click", async () => {
  const nombre = nombreJugador.value;

  if (!validarNombre(nombre)) {
    errorNombreDOM.textContent =
      "Nombre inválido (entre 3 y 20 caracteres: letras, números y espacios)";
    errorNombreDOM.className = "error-mensaje";
    nombreJugador.classList.add("is-invalid");
    return;
  }

  errorNombreDOM.textContent = "";
  nombreJugador.classList.remove("is-invalid");

  if (!especialidadActual) {
    mostrarError(
      "Debés elegir una especialidad e iniciar una partida antes de guardar.",
    );
    return;
  }

  try {
    btnGuardarScore.disabled = true;

    // Crear instancia Score con los datos de la partida
    const scoreData = new Score(
      nombre.trim(),
      tiempoSession,
      puntosSession,
      especialidadActual,
    );

    // Actualizar jugadorActual
    jugadorActual.nombre = scoreData.nombre;
    jugadorActual.puntos = scoreData.puntos;
    jugadorActual.tiempo = scoreData.tiempo;

    await guardarScore({
      nombre: scoreData.nombre,
      tiempo: scoreData.tiempo,
      puntos: scoreData.puntos,
      especialidad: scoreData.especialidad,
    });

    await cargarRanking();

    // Mostrar modal de éxito
    document.getElementById("modalGuardarNombre").textContent =
      scoreData.nombre;
    document.getElementById("modalGuardarPuntos").textContent =
      scoreData.puntos;
    nombreJugador.value = "";
    abrirModal("modalGuardarScore");
  } catch (error) {
    console.error("Error al guardar score:", error);
    mostrarError(
      error.message || "Error al intentar registrar el score en el servidor.",
    );
  } finally {
    btnGuardarScore.disabled = false;
  }
});

// ── descarga pdf ──
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

// ── aviso de orientación ──
document.getElementById("btnIgnorePortrait")?.addEventListener("click", () => {
  document.body.classList.add("ignore-portrait");
});

// ── iniciar lucide ──
lucide.createIcons();
