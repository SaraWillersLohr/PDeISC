/** enrutador principal — rutas públicas, login dual y dashboard protegido */
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomeSelectorPage } from '@/pages/HomeSelectorPage';
import { LoginRouterPage } from '@/pages/login/LoginRouterPage';
import { StateLoginOverlay } from '@/pages/login/StateLoginOverlay';
import { MainLayout } from '@/components/layouts/MainLayout';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ModulePlaceholderPage } from '@/pages/dashboard/ModulePlaceholderPage';
import { useAuth } from '@/contexts/AuthContext';
import type { RolNombre } from '@/types';

/** redirige a / si no hay sesión activa */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen">cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** redirige al dashboard si ya hay sesión */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen">cargando...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** solo dueño y copropietario — fase 4 */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { usuario, isLoading } = useAuth();
  const admin: RolNombre[] = ['dueno', 'copropietario'];
  if (isLoading) return <div className="loading-screen">cargando...</div>;
  if (!usuario || !admin.includes(usuario.rol)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  const { showStateLogin, isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeSelectorPage />} />
        <Route path="/login" element={<GuestRoute><LoginRouterPage /></GuestRoute>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <MainLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="corrales" element={<ModulePlaceholderPage title="Gestión de Corrales" />} />
          <Route path="animales" element={<ModulePlaceholderPage title="Mis animales" />} />
          <Route path="equipo" element={<ModulePlaceholderPage title="Mi Equipo" fase={5} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showStateLogin && !isAuthenticated && <StateLoginOverlay />}
    </>
  );
}
