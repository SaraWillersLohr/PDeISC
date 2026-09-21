// barra lateral verde � navegaci�n del panel admin
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Fence, PawPrint, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/corrales', label: 'Gestión de Corrales', icon: Fence },
  { to: '/dashboard/animales', label: 'Mis animales', icon: PawPrint },
  { to: '/dashboard/equipo', label: 'Mi Equipo', icon: Users },
];

// ejecuto sidebar
export function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // ejecuto handlelogout
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span>🌿</span>
        <div>
          <strong>Gestión de Campo</strong>
          <small>Panel admin</small>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className={styles.logout} onClick={handleLogout}>
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </aside>
  );
}

