import { UserCheck } from "lucide-react";

// define las props que necesita la tarjeta de bienvenida
interface WelcomeCardProps {
  nombre: string;
  onCambiarNombre: () => void;
}

// muestra el saludo personalizado al usuario
function WelcomeCard({ nombre, onCambiarNombre }: WelcomeCardProps) {
  return (
    <div className="bienvenida-contenedor">
      <div className="bienvenida-icono">👋</div>

      <p className="bienvenida-titulo">Bienvenido</p>
      <h2 className="bienvenida-nombre">{nombre}</h2>
      <p className="bienvenida-mensaje">
        Gracias por utilizar la aplicación.
      </p>

      {/* botón para volver al formulario y cambiar el nombre */}
      <button className="boton-cambiar" onClick={onCambiarNombre}>
        <UserCheck size={18} />
        Cambiar nombre
      </button>
    </div>
  );
}

export default WelcomeCard;
