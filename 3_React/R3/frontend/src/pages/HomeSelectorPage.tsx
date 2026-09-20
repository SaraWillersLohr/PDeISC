/** selector login useState vs router */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, ToggleLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import styles from './HomeSelectorPage.module.css';

/** pantalla inicial: el usuario elige el sistema de login */
export function HomeSelectorPage() {
  const navigate = useNavigate();
  const { setShowStateLogin, isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  // si ya hay sesión activa, redirijo al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const handleRouterLogin = () => {
    navigate('/login');
  };

  const handleStateLogin = () => {
    setShowStateLogin(true);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.leafIcon}>🌿</span>
          <h1>EstanciaApp</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h2>Gestión de Campo</h2>
          <p>Controlá tu campo, en un solo lugar</p>
          <span className={styles.badge}>
            {isDark ? 'modo oscuro activo' : 'modo claro activo'}
          </span>
        </div>

        <div className={styles.cards}>
          {/* opción A: login con useState (sin cambiar url) */}
          <button
            type="button"
            className={styles.card}
            onClick={handleStateLogin}
          >
            <div className={styles.cardIcon}>
              <ToggleLeft size={32} />
            </div>
            <h3>Opción A — useState</h3>
            <p>
              el login se gestiona con un estado booleano interno. la url permanece en{' '}
              <code>/</code> sin usar react router para navegar al formulario.
            </p>
            <span className={styles.cardCta}>iniciar con useState →</span>
          </button>

          {/* opción B: login con react router */}
          <button
            type="button"
            className={`${styles.card} ${styles.cardPrimary}`}
            onClick={handleRouterLogin}
          >
            <div className={styles.cardIcon}>
              <Route size={32} />
            </div>
            <h3>Opción B — React Router</h3>
            <p>
              el login redirige formalmente a la ruta <code>/login</code> usando el
              sistema de enrutamiento de react router v6.
            </p>
            <span className={styles.cardCta}>iniciar con router →</span>
          </button>
        </div>
      </main>
    </div>
  );
}
