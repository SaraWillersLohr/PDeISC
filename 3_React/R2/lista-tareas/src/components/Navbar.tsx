import { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

export const Navbar = () => {
  // uso el contexto para obtener y cambiar el tema
  const { tema, alternarTema } = useContext(ThemeContext);
  const textoTema = tema === 'claro' ? '🌙 Modo oscuro' : '☀️ Modo claro';

  const enlaces = (
    <>
      <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/"><span aria-hidden="true">⌂</span> Inicio</NavLink>
      <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/crear"><span aria-hidden="true">+</span> Crear tarea</NavLink>
    </>
  );

  return (
    <>
      <aside className="sidebar d-none d-lg-flex" aria-label="Navegación principal">
        <Link className="sidebar-brand" to="/">Mis Tareas</Link>
        <nav className="sidebar-links">{enlaces}</nav>
        <button onClick={alternarTema} className="theme-button mt-auto" aria-label={`Activar modo ${tema === 'claro' ? 'oscuro' : 'claro'}`}>{textoTema}</button>
      </aside>

      <nav className="navbar navbar-expand-lg app-navbar d-lg-none" aria-label="Navegación principal">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">Mis Tareas</Link>
          <button className="navbar-toggler mobile-menu-button" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Abrir menú de navegación"><span className="navbar-toggler-icon" /></button>
          <div className="collapse navbar-collapse mobile-menu" id="navbarNav">
            <div className="navbar-nav">
              {enlaces}
              <button onClick={alternarTema} className="mobile-theme-button" aria-label={`Activar modo ${tema === 'claro' ? 'oscuro' : 'claro'}`}>{textoTema}</button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
