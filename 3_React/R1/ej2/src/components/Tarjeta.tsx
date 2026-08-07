import BorderGlow from './BorderGlow'
import './Tarjeta.css'

interface TarjetaProps {
  nombre: string
  apellido: string
  profesion: string
  imagen: string
}

// muestra la tarjeta de presentación con imagen arriba y datos abajo
function Tarjeta({ nombre, apellido, profesion, imagen }: TarjetaProps) {
  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="270 80 80"
      backgroundColor="var(--color-card)"
      borderRadius={24}
      glowRadius={40}
      glowIntensity={1}
      coneSpread={25}
      animated={false}
      colors={['#c084fc', '#f472b6', '#38bdf8']}
      className="tarjeta-glow"
    >
      <article className="tarjeta">
        {/* imagen que ocupa la parte superior de la tarjeta */}
        <div className="tarjeta__imagen-wrapper">
          <img
            className="tarjeta__imagen"
            src={imagen}
            alt={`Foto de perfil de ${nombre} ${apellido}`}
          />
        </div>

        {/* información del perfil centrada debajo de la imagen */}
        <div className="tarjeta__info">
          <p className="tarjeta__nombre-completo">{nombre} {apellido}</p>
          <p className="tarjeta__profesion">{profesion}</p>
          {/* línea decorativa corta */}
          <span className="tarjeta__linea" aria-hidden="true" />
        </div>
      </article>
    </BorderGlow>
  )
}

export default Tarjeta
