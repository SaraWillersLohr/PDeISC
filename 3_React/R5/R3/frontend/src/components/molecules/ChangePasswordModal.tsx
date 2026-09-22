// modal obligatorio de cambio de contrase�a en el primer inicio de sesi�n
import React, { useState } from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { cambiarPasswordInicialApi } from '@/api/authApi';
import styles from './ChangePasswordModal.module.css';

// modal que bloquea la navegaci�n hasta que el usuario reemplace la clave temporal
export const ChangePasswordModal: React.FC = () => {
  const { usuario, updateUsuario } = useAuth();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // solo se renderiza si el usuario tiene el flag de primer cambio pendiente
  if (!usuario || !usuario.debe_cambiar_password) {
    return null;
  }

  // ejecuto handlesubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('la contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('las contraseñas no coinciden');
      return;
    }

    if (password === 'Estancia2025!') {
      setError('no podés volver a usar la contraseña predeterminada');
      return;
    }

    try {
      setLoading(true);
      const usuarioActualizado = await cambiarPasswordInicialApi(password);
      updateUsuario(usuarioActualizado);
      showToast('success', 'contraseña actualizada correctamente');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <ShieldCheck size={28} />
          </div>
          <h2 className={styles.title}>Actualizá tu Contraseña</h2>
          <p className={styles.subtitle}>
            Detectamos tu primer ingreso al sistema con contraseña temporal. Por seguridad, definí una clave
            personal para tu cuenta de {usuario.rolLabel}.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="nueva-password">
              Nueva Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="nueva-password"
                type="password"
                className={styles.input}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="confirmar-password">
              Confirmar Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="confirmar-password"
                type="password"
                className={styles.input}
                placeholder="Repetí la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className={styles.errorText}>{error}</div>}

          <div className={styles.footer}>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <Check size={18} />
              {loading ? 'Guardando contraseña...' : 'Establecer Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

