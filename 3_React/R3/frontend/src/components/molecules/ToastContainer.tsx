// contenedor visual de toasts
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import type { ToastMessage } from '@/types';
import styles from './ToastContainer.module.css';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

// ejecuto toastitem
function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const Icon = iconMap[toast.type];

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} role="alert">
      <Icon size={20} className={styles.icon} />
      <p>{toast.message}</p>
      <button type="button" className={styles.close} onClick={onClose} aria-label="cerrar">
        <X size={16} />
      </button>
    </div>
  );
}

/** contenedor de toasts  reemplaza alert() */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

