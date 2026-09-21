/** pantalla temporal para modulos aun no implementados */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import styles from './DashboardPlaceholderPage.module.css';

/** placeholder del dashboard — se implementará en fase 4 según referencia visual */
export function DashboardPlaceholderPage() {
  const navigate = useNavigate();
  const { usuario, logout, loginMode } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>¡Hola, {usuario?.nombre}!</h1>
          <p>{usuario?.rolLabel}</p>
          <span className={styles.modeBadge}>
            login vía: {loginMode === 'router' ? 'React Router' : 'useState'}
          </span>
        </div>
        <div className={styles.actions}>
          <ThemeToggle />
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            cerrar sesión
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.placeholder}>
          <h2>Dashboard — Fase 4</h2>
          <p>
            acá irá el panel completo con sidebar verde, tarjetas de métricas y gráficos
            según tu referencia visual.
          </p>
        </div>
      </main>
    </div>
  );
}
