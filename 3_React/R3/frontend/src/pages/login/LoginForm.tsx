/** formulario de login reutilizable */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import type { LoginFormData, LoginMode, Usuario } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  mode: LoginMode;
  onSuccess?: (user?: Usuario) => void;
}

/** formulario reutilizable para ambos sistemas de login */
export function LoginForm({ mode, onSuccess }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data, mode);
      showToast('success', `sesión iniciada (${mode === 'router' ? 'react router' : 'useState'})`);
      onSuccess?.(user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'credenciales inválidas';
      showToast('error', msg);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.brand}>
        <span className={styles.leaf}>🌿</span>
        <div>
          <h2>Gestión de Campo</h2>
          <p>Controlá tu campo, en un solo lugar</p>
        </div>
      </div>

      <div className={styles.field}>
        <Mail size={18} className={styles.fieldIcon} />
        <input
          type="email"
          placeholder="Correo electrónico"
          aria-label="correo electrónico"
          {...register('email', {
            required: 'el correo es obligatorio',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'ingresá un correo válido',
            },
          })}
        />
        {errors.email && <span className={styles.error}>{errors.email.message}</span>}
      </div>

      <div className={styles.field}>
        <Lock size={18} className={styles.fieldIcon} />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          aria-label="contraseña"
          {...register('password', {
            required: 'la contraseña es obligatoria',
            minLength: { value: 6, message: 'mínimo 6 caracteres' },
          })}
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'ocultar contraseña' : 'mostrar contraseña'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {errors.password && (
          <span className={styles.error}>{errors.password.message}</span>
        )}
      </div>

      <div className={styles.row}>
        <label className={styles.checkbox}>
          <input type="checkbox" {...register('rememberMe')} />
          <span>Recordarme</span>
        </label>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isLoading}>
        {isLoading ? 'iniciando...' : 'Iniciar sesión'}
        {!isLoading && <ArrowRight size={18} />}
      </button>

      <div className={styles.divider}>
        <span />
        <span className={styles.dividerDot} />
        <span />
      </div>

      <p className={styles.demoHint}>
        demo: <strong>dueno@estancia.app</strong> / <strong>Estancia2025!</strong>
      </p>
    </form>
  );
}
