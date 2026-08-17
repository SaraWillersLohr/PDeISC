import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// tipos y datos
import type { Tarea } from './types/Tarea'
import { tareasIniciales } from './data/tareas'

// contextos
import { ThemeProvider } from './context/ThemeContext'

// componentes
import { Navbar } from './components/Navbar'

// páginas
import { Inicio } from './pages/Inicio'
import { DetalleTarea } from './pages/DetalleTarea'
import { CrearTarea } from './pages/CrearTarea'

function App() {
  // acá guardo todas las tareas
  const [tareas, setTareas] = useState<Tarea[]>(tareasIniciales);

  // agrego la nueva tarea al estado
  const agregarTarea = (nuevaTarea: Tarea) => {
    setTareas((tareasActuales) => [...tareasActuales, nuevaTarea]);
  };

  // elimino la tarea por su id
  const eliminarTarea = (id: number) => {
    setTareas((tareasActuales) => tareasActuales.filter((tarea) => tarea.id !== id));
  };

  // cambio el estado de completa a incompleta y viceversa
  const cambiarEstadoTarea = (id: number) => {
    setTareas((tareasActuales) => tareasActuales.map((tarea) => {
      if (tarea.id === id) {
        return { ...tarea, completa: !tarea.completa };
      }
      return tarea;
    }));
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-container min-vh-100">
          <Navbar />
          <main id="main-content" className="app-content">
            <Routes>
            {/* inicio */}
              <Route path="/" element={<Inicio tareas={tareas} cambiarEstadoTarea={cambiarEstadoTarea} />} />
            
            {/* detalle */}
              <Route path="/tarea/:id" element={<DetalleTarea tareas={tareas} eliminarTarea={eliminarTarea} cambiarEstadoTarea={cambiarEstadoTarea} />} />
            
            {/* crear */}
              <Route path="/crear" element={<CrearTarea agregarTarea={agregarTarea} />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
