import { useState } from "react";
import { Send, Trash2, AlertCircle } from "lucide-react";

// define las props que recibe el formulario
interface UserFormProps {
  onEnviar: (nombre: string) => void;
}

// valida el nombre ingresado y devuelve un mensaje de error o string vacío
function validarNombre(valor: string): string {
  if (valor.length === 0) {
    return "El nombre es obligatorio.";
  }
  if (valor.trim().length === 0) {
    return "El nombre no puede contener solo espacios.";
  }
  if (valor.trim().length < 3) {
    return "El nombre debe tener al menos 3 caracteres.";
  }
  if (valor.length > 30) {
    return "El nombre no puede tener más de 30 caracteres.";
  }
  // solo permite letras, espacios y apóstrofes
  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']+$/;
  if (!soloLetras.test(valor)) {
    return "Solo se permiten letras, espacios y apóstrofes.";
  }

  // detecta repetición excesiva: una misma letra más de 3 veces seguidas
  const repeticion = /([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ])\1{3,}/;
  if (repeticion.test(valor)) {
    return "El nombre tiene demasiadas letras repetidas seguidas.";
  }

  // verifica que el nombre tenga al menos una vocal
  const tieneVocal = /[aeiouáéíóúüAEIOUÁÉÍÓÚÜ]/;
  if (!tieneVocal.test(valor)) {
    return "El nombre debe contener al menos una vocal.";
  }

  return "";
}

// formulario para ingresar el nombre del usuario
function UserForm({ onEnviar }: UserFormProps) {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [tocado, setTocado] = useState(false);

  // valida mientras el usuario escribe
  function manejarCambio(evento: React.ChangeEvent<HTMLInputElement>) {
    const valor = evento.target.value;
    setNombre(valor);
    setTocado(true);
    setError(validarNombre(valor));
  }

  // limpia el formulario y vuelve al estado inicial
  function limpiarFormulario() {
    setNombre("");
    setError("");
    setTocado(false);
  }

  // envía el formulario si el nombre es válido
  function manejarEnvio(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!error && nombre.trim().length > 0) {
      onEnviar(nombre.trim());
    }
  }

  // determina la clase del input según el estado de validación
  function claseInput(): string {
    if (!tocado) return "";
    if (error) return "input-error";
    return "input-valido";
  }

  // el botón enviar se deshabilita si hay error o si el campo está vacío
  const botonDeshabilitado = error !== "" || nombre.trim().length === 0;

  return (
    <div className="formulario-contenedor">
      <h2 className="formulario-titulo">
        ¿Cómo te llamás?
      </h2>
      <p className="formulario-subtitulo">
        Ingresá tu nombre para continuar.
      </p>

      <form onSubmit={manejarEnvio} noValidate>
        <div className="campo">
          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            type="text"
            placeholder="Ej: María García"
            value={nombre}
            onChange={manejarCambio}
            className={claseInput()}
            maxLength={30}
            autoComplete="off"
          />

          {/* muestra el error solo si el usuario ya tocó el campo */}
          {tocado && error && (
            <p className="mensaje-error">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
        </div>

        <div className="fila-botones">
          <button
            type="submit"
            className="boton-enviar"
            disabled={botonDeshabilitado}
          >
            <Send size={16} />
            Enviar
          </button>

          <button
            type="button"
            className="boton-limpiar"
            onClick={limpiarFormulario}
          >
            <Trash2 size={16} />
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;
