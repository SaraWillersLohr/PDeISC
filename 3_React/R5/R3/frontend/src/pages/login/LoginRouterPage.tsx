// pagina login con react router
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import styles from './LoginPages.module.css';

import type { Usuario } from '@/types';
import { SocialLoginCallback } from './SocialLoginCallback';

// login opci�n b � ruta formal /login con react router
export function LoginRouterPage() {
  const navigate = useNavigate();

  // ejecuto handlesuccess
  const handleSuccess = (user?: Usuario) => {
    const dest = user?.rol === 'peon' ? '/peon' : user?.rol === 'veterinario' ? '/veterinario' : '/dashboard';
    navigate(dest, { replace: true });
  };

  return (
    <AuthLayout>
      <SocialLoginCallback />
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

