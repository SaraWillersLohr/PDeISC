// layout visual del login
import type { ReactNode } from 'react';
import imgLogin from '@/assets/img_login.png';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: ReactNode;
  compact?: boolean;
}

/** layout de login  vaca a la izquierda, formulario a la derecha (referencia visual) */
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
            alt="vaca en el campo  estanciaapp"
            className={styles.cowImage}
          />
          <div className={styles.imageShade} />
          <div className={styles.story}>
            <div className={styles.storyBrand}>
              <span aria-hidden="true">🌿</span>
              <span>ESTANCIA APP</span>
            </div>
            <h1>Todo tu campo, en equilibrio.</h1>
            <p>Cuidamos cada detalle de tu estancia para que puedas enfocarte en lo que más importa.</p>
            <span className={styles.storyFoot}>Una estancia, todo bajo control.</span>
          </div>
        </div>
        <div className={styles.formCol}>{children}</div>
      </div>
    </div>
  );
}

