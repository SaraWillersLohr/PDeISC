/** layout principal del dashboard  sidebar + contenido */
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/organisms/Sidebar";
import { NotificationModal } from "@/components/molecules/NotificationModal";
import { listNotificacionesApi } from "@/api/notificacionApi";
import styles from "./MainLayout.module.css";

// ejecuto mainlayout
export function MainLayout() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    listNotificacionesApi()
      .then((notifications) => setNotificationCount(notifications.length))
      .catch(() => setNotificationCount(0));
  }, []);

  return (
    <div className={styles.shell}>
      <Sidebar
        notificationCount={notificationCount}
        onOpenNotifications={() => setNotifOpen(true)}
      />
      <div className={styles.content}>
        <Outlet />
      </div>
      <NotificationModal
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </div>
  );
}
