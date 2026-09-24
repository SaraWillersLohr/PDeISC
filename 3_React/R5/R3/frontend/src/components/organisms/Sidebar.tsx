// barra lateral verde � navegaci�n del panel admin
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Fence,
  PawPrint,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import styles from "./Sidebar.module.css";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/corrales", label: "Gestión de Corrales", icon: Fence },
  { to: "/dashboard/animales", label: "Mis animales", icon: PawPrint },
  { to: "/dashboard/equipo", label: "Mi Equipo", icon: Users },
];

// ejecuto sidebar
export function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ejecuto handlelogout
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span>🌿</span>
        <div>
          <strong>Gestión de Campo</strong>
          <small>Panel admin</small>
        </div>
      </div>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        id="main-navigation"
        className={`${styles.menuContent} ${isMenuOpen ? styles.menuOpen : ""}`}
      >
        <nav className={styles.nav}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
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

        {/* El selector queda al final para que también sea accesible en el menú móvil. */}
        <div className={styles.themeControl}>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
