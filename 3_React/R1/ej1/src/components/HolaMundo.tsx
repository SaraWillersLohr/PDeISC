import "./HolaMundo.css";

// componente principal: tarjeta de bienvenida con temática del planeta tierra
function HolaMundo() {
  return (
    <section
      className="hm-tarjeta"
      aria-label="Tarjeta de bienvenida Hola Mundo"
    >
      {/* escena visual: cielo o espacio según el tema activo */}
      <div className="hm-escena" aria-hidden="true">

        {/* estrellas — solo visibles en modo oscuro */}
        <span className="hm-estrella hm-estrella--1" />
        <span className="hm-estrella hm-estrella--2" />
        <span className="hm-estrella hm-estrella--3" />
        <span className="hm-estrella hm-estrella--4" />
        <span className="hm-estrella hm-estrella--5" />
        <span className="hm-estrella hm-estrella--6" />
        <span className="hm-estrella hm-estrella--7" />
        <span className="hm-estrella hm-estrella--8" />

        {/* sol — solo visible en modo claro */}
        <span className="hm-sol" />

        {/* planeta tierra con continentes y reflejo */}
        <span className="hm-tierra">
          <span className="hm-tierra__continente hm-tierra__continente--1" />
          <span className="hm-tierra__continente hm-tierra__continente--2" />
          <span className="hm-tierra__continente hm-tierra__continente--3" />
          <span className="hm-tierra__reflejo" />
        </span>

      </div>

      {/* contenido: badge, título y descripción */}
      <div className="hm-contenido">
        <span className="hm-badge" aria-label="Stack tecnológico">
          React + TypeScript
        </span>

        <h1 className="hm-titulo">¡Hola Mundo!</h1>

        <p className="hm-descripcion">
          Un componente simple con estilo — el primer paso de todo gran proyecto.
        </p>
      </div>

    </section>
  );
}

export default HolaMundo;
