// componente principal de la app
// aquí se maneja el estado global de las tareas

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

import type { Task } from './types/Task';
import type { TabActiva } from './components/TaskTabs';

import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskTabs from './components/TaskTabs';
import TaskList from './components/TaskList';
import Footer from './components/Footer';

import './styles/app.css';

function App() {
  // estado principal con todas las tareas
  const [tareas, setTareas] = useState<Task[]>([]);

  // estado para la pestaña activa
  const [tabActiva, setTabActiva] = useState<TabActiva>('todas');

  // estado para el modo oscuro
  const [modoOscuro, setModoOscuro] = useState<boolean>(false);

  // estado para mostrar u ocultar el botón de volver arriba
  const [mostrarBotonArriba, setMostrarBotonArriba] = useState<boolean>(false);

  // carga las tareas guardadas en localStorage al iniciar la app
  useEffect(() => {
    const guardadas = localStorage.getItem('tareas');
    if (guardadas) {
      setTareas(JSON.parse(guardadas));
    }
  }, []);

  // carga el modo de tema guardado en localStorage al iniciar la app
  useEffect(() => {
    const modoGuardado = localStorage.getItem('modoOscuro');
    if (modoGuardado === 'true') {
      setModoOscuro(true);
    }
  }, []);

  // guarda las tareas en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem('tareas', JSON.stringify(tareas));
  }, [tareas]);

  // guarda el modo y aplica la clase al body cada vez que cambia
  useEffect(() => {
    localStorage.setItem('modoOscuro', String(modoOscuro));
    if (modoOscuro) {
      document.body.classList.add('modo-oscuro');
      document.body.classList.remove('modo-claro');
    } else {
      document.body.classList.add('modo-claro');
      document.body.classList.remove('modo-oscuro');
    }
  }, [modoOscuro]);

  // detecta el scroll para mostrar el botón volver arriba
  useEffect(() => {
    function handleScroll() {
      setMostrarBotonArriba(window.scrollY > 200);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // cambia entre modo claro y oscuro
  function toggleModo() {
    setModoOscuro(!modoOscuro);
  }

  // agrega una nueva tarea al arreglo
  function agregarTarea(texto: string) {
    const nuevaTarea: Task = {
      id: Date.now(),
      texto: texto,
      completada: false,
      fechaCreacion: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };
    setTareas([...tareas, nuevaTarea]);
  }

  // cambia el estado completada de una tarea
  function completarTarea(id: number) {
    const actualizadas = tareas.map((tarea) => {
      if (tarea.id === id) {
        return { ...tarea, completada: !tarea.completada };
      }
      return tarea;
    });
    setTareas(actualizadas);
  }

  // elimina una tarea del arreglo
  function eliminarTarea(id: number) {
    const filtradas = tareas.filter((tarea) => tarea.id !== id);
    setTareas(filtradas);
  }

  // vuelve al inicio de la página
  function volverArriba() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // filtra las tareas según la pestaña activa
  function obtenerTareasFiltradas(): Task[] {
    if (tabActiva === 'pendientes') {
      return tareas.filter((t) => !t.completada);
    }
    if (tabActiva === 'completadas') {
      return tareas.filter((t) => t.completada);
    }
    return tareas;
  }

  // calcula los contadores
  const total = tareas.length;
  const pendientes = tareas.filter((t) => !t.completada).length;
  const completadas = tareas.filter((t) => t.completada).length;

  // tareas que se muestran en pantalla según el filtro
  const tareasFiltradas = obtenerTareasFiltradas();

  return (
    <div>
      <Header modoOscuro={modoOscuro} onToggleModo={toggleModo} />

      <main className="contenedor">
        {/* formulario para agregar tareas */}
        <TaskForm onAgregar={agregarTarea} />

        {/* pestañas de filtro */}
        <TaskTabs tabActiva={tabActiva} onCambiarTab={setTabActiva} />

        {/* lista de tareas filtradas */}
        <TaskList
          tareas={tareasFiltradas}
          onCompletar={completarTarea}
          onEliminar={eliminarTarea}
        />

        {/* footer con contadores */}
        <Footer
          total={total}
          pendientes={pendientes}
          completadas={completadas}
        />
      </main>

      {/* botón flotante volver arriba */}
      {mostrarBotonArriba && (
        <button
          className="btn-volver-arriba"
          onClick={volverArriba}
          title="Volver arriba"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </div>
  );
}

export default App;
