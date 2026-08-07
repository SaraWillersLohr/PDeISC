import './TarjetaPresentacion.css'

interface TarjetaPresentacionProps {
  nombre: string
  apellido: string
  profesion: string
  imagen: string
}

const STACK = ['React', 'TypeScript', 'Vite', 'CSS']

function TarjetaPresentacion({
  nombre,
  apellido,
  profesion,
  imagen,
}: TarjetaPresentacionProps) {
  return (
    <article className="tarjeta">
      {/* Banda de color superior */}
      <div className="tarjeta__banner" aria-hidden="true" />

      {/* Avatar */}
      <div className="tarjeta__avatar-wrapper">
        <img
          className="tarjeta__avatar"
          src={imagen}
          alt={`Foto de perfil de ${nombre} ${apellido}`}
        />
      </div>

      {/* Nombre, rol y detalles */}
      <div className="tarjeta__info">
        <h1 className="tarjeta__nombre">
          {nombre} {apellido}
        </h1>
        <p className="tarjeta__profesion">{profesion}</p>

        <hr className="tarjeta__divider" />

        {/* Chips de tecnologías */}
        <ul className="tarjeta__stack" aria-label="Stack tecnológico">
          {STACK.map((tech) => (
            <li key={tech} className="tarjeta__chip">
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export default TarjetaPresentacion
