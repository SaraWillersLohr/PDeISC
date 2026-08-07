import { useState, useEffect } from 'react'
import imgTarjeta from './assets/img-tarjeta.jpeg'
import Tarjeta from './components/Tarjeta'
import CambioTema from './components/CambioTema'
import './App.css'

function App() {
  // Inicializa el tema según la preferencia del sistema operativo
  const [isDark, setIsDark] = useState<boolean>(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  // Aplica el atributo data-theme en <html> cada vez que cambia el tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className="app">
      {/* barra superior con título y botón de tema */}
      <header className="app__header">
        <div className="app__header-titulo">
          <div className="app__header-icono" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <div>
            <p className="app__header-nombre">Ejercicio 2 - Tarjeta de Perfil</p>
            <p className="app__header-subtitulo">React + TypeScript</p>
          </div>
        </div>
        <CambioTema isDark={isDark} onToggle={() => setIsDark((prev) => !prev)} />
      </header>

      <main className="app__main">
        <Tarjeta
          nombre="Sara"
          apellido="Willers Löhr"
          profesion="Estudiante de Informática"
          imagen={imgTarjeta}
        />
      </main>
    </div>
  )
}

export default App
