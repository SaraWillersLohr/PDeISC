import { FaMoon, FaSun } from 'react-icons/fa'
import './CambioTema.css'

interface CambioTemaProps {
  isDark: boolean
  onToggle: () => void
}

// Este componente controla el cambio entre modo claro y oscuro
function CambioTema({ isDark, onToggle }: CambioTemaProps) {
  return (
    <button
      className="tema-btn"
      type="button"
      onClick={onToggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
    </button>
  )
}

export default CambioTema
