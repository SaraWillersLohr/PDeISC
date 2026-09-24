// componente para visualizar y gestionar las alertas sanitarias y avisos
import { useEffect, useState } from "react";
import { Bell, X, Trash2 } from "lucide-react";
import {
  listNotificacionesApi,
  deleteNotificacionApi,
  clearNotificacionesApi,
} from "@/api/notificacionApi";
import type { NotificacionAlerta } from "@/types";
import styles from "./NotificationModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAlertClick?: () => void;
}

// panel lateral desplegable de notificaciones y alertas
export function NotificationModal({ isOpen, onClose, onAlertClick }: Props) {
  const [alertas, setAlertas] = useState<NotificacionAlerta[]>([]);
  const [loading, setLoading] = useState(true);

  // ejecuto loadalertas
  const loadAlertas = async () => {
    try {
      setLoading(true);
      const data = await listNotificacionesApi();
      setAlertas(data);
    } catch {
      setAlertas([]);
    } finally {
      setLoading(false);
    }
  };

  // ejecuto el callback del hook
  useEffect(() => {
    if (!isOpen) return;
    loadAlertas();
  }, [isOpen]);

  // ejecuto handledeleteone
  const handleDeleteOne = async (id: string) => {
    try {
      await deleteNotificacionApi(id);
      setAlertas((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // fallo silencioso
    }
  };

  // ejecuto handleclearall
  const handleClearAll = async () => {
    try {
      await clearNotificacionesApi();
      setAlertas([]);
    } catch {
      // fallo silencioso
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            <Bell size={18} />
            Alertas Sanitarias ({alertas.length})
          </h2>
          <div className={styles.headerActions}>
            {alertas.length > 0 && (
              <button
                type="button"
                className={styles.clearAllBtn}
                onClick={handleClearAll}
                title="Eliminar todas las notificaciones"
              >
                Limpiar todas
              </button>
            )}
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="cerrar panel"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.empty}>cargando alertas...</div>
          ) : alertas.length === 0 ? (
            <div className={styles.empty}>
              no hay alertas sanitarias activas
            </div>
          ) : (
            alertas.map((a) => (
              <div
                key={a.id}
                className={styles.item}
                onClick={onAlertClick}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ")
                    onAlertClick?.();
                }}
                role={onAlertClick ? "button" : undefined}
                tabIndex={onAlertClick ? 0 : undefined}
              >
                <div className={styles.itemHeader}>
                  <span className={styles.idBadge}>{a.identificador}</span>
                  <div className={styles.itemHeaderRight}>
                    <span
                      className={`${styles.stateTag} ${
                        a.estado_salud === "enfermo" ||
                        a.tipo === "alerta_sanitaria"
                          ? styles.tagEnfermo
                          : styles.tagTratamiento
                      }`}
                    >
                      {a.estado_salud === "en_tratamiento"
                        ? "en tratamiento"
                        : a.estado_salud}
                    </span>
                    <button
                      type="button"
                      className={styles.deleteItemBtn}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteOne(a.id);
                      }}
                      title="Eliminar notificación"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {a.titulo && <h4 className={styles.itemTitle}>{a.titulo}</h4>}

                <div className={styles.itemBody}>
                  <p>{a.mensaje}</p>
                </div>

                <div className={styles.itemFooter}>
                  <span>⚠️ {a.corral_nombre}</span>
                  {a.fecha && (
                    <span className={styles.itemTimestamp}>
                      {new Date(a.fecha).toLocaleDateString()}{" "}
                      {new Date(a.fecha).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
