import "./HolaMundo.css";

// componente principal: tarjeta de bienvenida con temática del planeta tierra
function HolaMundo() {
  return (
    <section className="hm-tarjeta">

      {/* escena visual: cielo o espacio según el tema activo */}
      <div className="hm-escena">

        {/* estrellas — solo visibles en modo oscuro */}
        <span className="hm-estrella hm-estrella--1" />
        <span className="hm-estrella hm-estrella--2" />
        <span className="hm-estrella hm-estrella--3" />

        {/* sol — solo visible en modo claro */}
        <span className="hm-sol" />

        {/* planeta tierra con dos continentes */}
        <span className="hm-tierra">
          <span className="hm-tierra__continente hm-tierra__continente--1" />
          <span className="hm-tierra__continente hm-tierra__continente--2" />
        </span>

      </div>

      {/* línea divisora entre la escena y el contenido */}
      <div className="hm-divisor" />

      {/* contenido: badge, título y descripción */}
      <div className="hm-contenido">
        <span className="hm-badge">React + TypeScript</span>

        <h1 className="hm-titulo">¡Hola Mundo!</h1>


      </div>

    </section>
  );
}

export default HolaMundo;
