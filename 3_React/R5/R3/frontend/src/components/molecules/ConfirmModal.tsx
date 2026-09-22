// componente de confirmaci�n accesible para erradicar alerts y confirms del navegador
import React, { useEffect } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// modal reutilizable de confirmaci�n dentro de la interfaz
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  // cierro al presionar escape
  useEffect(() => {
    if (!isOpen) return;

    // ejecuto handlekeydown
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={`${styles.iconWrapper} ${isDestructive ? '' : styles.info}`}>
            {isDestructive ? <AlertTriangle size={22} /> : <Info size={22} />}
          </div>
          <h3 className={styles.title}>{title}</h3>
        </div>

        <div className={styles.body}>
          <p>{message}</p>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${isDestructive ? '' : styles.standard}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

