/** pagina login con react router */
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import styles from './LoginPages.module.css';

/** login opción B — ruta formal /login con react router */
export function LoginRouterPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout>
      <button
        type="button"
        className={styles.backBtn}
        onClick={() => navigate('/')}
        aria-label="volver al selector"
      >
        <ArrowLeft size={18} />
        volver
      </button>
      <LoginForm mode="router" onSuccess={handleSuccess} />
    </AuthLayout>
  );
}
