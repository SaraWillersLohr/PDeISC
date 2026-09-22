// Completa desde React el canje seguro del código devuelto tras un login social.
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

/** Canjea el código OAuth una sola vez, informa errores y navega a la pantalla autorizada por rol. */
export function SocialLoginCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeSocialLogin } = useAuth();
  const { showToast } = useToast();
  const processed = useRef(false);

  useEffect(() => {
    const code = params.get('socialCode');
    const error = params.get('socialError');
    if (processed.current) return;
    if (error) {
      processed.current = true;
      showToast('error', error);
      navigate('/login', { replace: true });
      return;
    }
    if (!code) return;
    processed.current = true;
    void completeSocialLogin(code).then((user) => {
      showToast('success', 'sesión social iniciada correctamente');
      navigate(user.rol === 'peon' ? '/peon' : user.rol === 'veterinario' ? '/veterinario' : '/dashboard', { replace: true });
    }).catch((reason: unknown) => {
      showToast('error', reason instanceof Error ? reason.message : 'no se pudo completar el inicio social');
      navigate('/login', { replace: true });
    });
  }, [completeSocialLogin, navigate, params, showToast]);

  return params.get('socialCode') ? <p className="loading-screen">validando acceso social...</p> : null;
}
