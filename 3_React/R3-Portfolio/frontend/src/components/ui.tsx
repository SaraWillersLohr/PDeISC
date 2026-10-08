import { type ReactNode, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Anima la aparición del contenido cuando entra en pantalla.
export function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}

// Muestra el título de una sección y, si se indica, su contenido adicional.
export function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children && <div className="section-copy">{children}</div>}
    </Reveal>
  );
}

// Presenta un diálogo para confirmar o cancelar una acción.
export function ConfirmModal({
  open,
  title,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  // Guarda el botón de cancelar para enfocarlo al abrir el diálogo.
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          onMouseDown={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
          >
            <p className="eyebrow">confirmar acción</p>
            <h3 id="modal-title">{title}</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button ref={ref} className="button ghost" onClick={onCancel}>
                cancelar
              </button>
              <button className="button danger" onClick={onConfirm}>
                eliminar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
