/** layout visual del login */
import type { ReactNode } from 'react';
import imgLogin from '@/assets/img_login.png';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: ReactNode;
  compact?: boolean;
}

/** layout de login — vaca a la izquierda, formulario a la derecha (referencia visual) */
export function AuthLayout({ children, compact = false }: AuthLayoutProps) {
  return (
    <div
      className={`${styles.wrapper} ${compact ? styles.compact : ''}`}
      style={{ ['--login-bg-image' as string]: `url(${imgLogin})` }}
    >
      <div className={styles.card}>
        <div className={styles.imageCol}>
          <img
            src={imgLogin}
            alt="vaca en el campo — estanciaapp"
            className={styles.cowImage}
          />
        </div>
        <div className={styles.formCol}>{children}</div>
      </div>
    </div>
  );
}
