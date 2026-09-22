// overlay login con usestate
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import styles from './LoginPages.module.css';

// login opci�n a � overlay controlado por usestate, url sin cambios
export function StateLoginOverlay() {
  const navigate = useNavigate();
  const { setShowStateLogin } = useAuth();

  // bloqueo scroll y cierre con escape para mejor ux en overlay
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // ejecuto onkeydown
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowStateLogin(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [setShowStateLogin]);

  // ejecuto handleclose
  const handleClose = () => {
    setShowStateLogin(false);
  };

  const handleSuccess = (user?: import('@/types').Usuario) => {
    setShowStateLogin(false);
    const dest = user?.rol === 'peon' ? '/peon' : user?.rol === 'veterinario' ? '/veterinario' : '/dashboard';
    navigate(dest, { replace: true });
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="login useState">
      <div className={styles.overlayBackdrop} onClick={handleClose} aria-hidden="true" />
      <div className={styles.overlayContent}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="cerrar login"
        >
          <X size={20} />
        </button>
        <AuthLayout compact>
          <LoginForm mode="useState" onSuccess={handleSuccess} />
        </AuthLayout>
      </div>
    </div>
  );
}

