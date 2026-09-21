// enrutador principal � rutas p�blicas, login dual y dashboard protegido
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomeSelectorPage } from '@/pages/HomeSelectorPage';
import { LoginRouterPage } from '@/pages/login/LoginRouterPage';
import { StateLoginOverlay } from '@/pages/login/StateLoginOverlay';
import { MainLayout } from '@/components/layouts/MainLayout';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { CorralesPage } from '@/pages/corrales/CorralesPage';
import { AnimalesPage } from '@/pages/animales/AnimalesPage';
import { EquipoPage } from '@/pages/equipo/EquipoPage';
import { PeonPage } from '@/pages/peon/PeonPage';
import { VeterinarioPage } from '@/pages/veterinario/VeterinarioPage';
import { useAuth } from '@/contexts/AuthContext';
import type { RolNombre } from '@/types';

// redirige a / si no hay sesi�n activa
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen">cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// redirige a la vista correspondiente al rol si ya hay sesi�n
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, usuario } = useAuth();
  if (isLoading) return <div className="loading-screen">cargando...</div>;
  if (isAuthenticated) {
    const dest = usuario?.rol === 'peon' ? '/peon' : usuario?.rol === 'veterinario' ? '/veterinario' : '/dashboard';
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
}

// solo due�o y copropietario � panel general
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { usuario, isLoading } = useAuth();
  const admin: RolNombre[] = ['dueno', 'copropietario'];
  if (isLoading) return <div className="loading-screen">cargando...</div>;
  if (!usuario || !admin.includes(usuario.rol)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// solo pe�n (o admin para supervisi�n)
function PeonRoute({ children }: { children: React.ReactNode }) {
  const { usuario, isLoading } = useAuth();
  const permitidos: RolNombre[] = ['peon', 'dueno', 'copropietario'];
  if (isLoading) return <div className="loading-screen">cargando...</div>;
  if (!usuario || !permitidos.includes(usuario.rol)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// solo veterinario (o admin para supervisi�n)
function VeterinarioRoute({ children }: { children: React.ReactNode }) {
  const { usuario, isLoading } = useAuth();
  const permitidos: RolNombre[] = ['veterinario', 'dueno', 'copropietario'];
  if (isLoading) return <div className="loading-screen">cargando...</div>;
  if (!usuario || !permitidos.includes(usuario.rol)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ejecuto approuter
export function AppRouter() {
  const { showStateLogin, isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeSelectorPage />} />
        <Route path="/login" element={<GuestRoute><LoginRouterPage /></GuestRoute>} />
        
        {/* rutas exclusivas de administracion (dueno y copropietario) */}
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
          <Route path="corrales" element={<CorralesPage />} />
          <Route path="animales" element={<AnimalesPage />} />
          <Route path="equipo" element={<EquipoPage />} />
        </Route>

        {/* ruta operativa de campo (peon) */}
        <Route
          path="/peon"
          element={
            <ProtectedRoute>
              <PeonRoute>
                <PeonPage />
              </PeonRoute>
            </ProtectedRoute>
          }
        />

        {/* ruta sanitaria y enfermeria (veterinario) */}
        <Route
          path="/veterinario"
          element={
            <ProtectedRoute>
              <VeterinarioRoute>
                <VeterinarioPage />
              </VeterinarioRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showStateLogin && !isAuthenticated && <StateLoginOverlay />}
    </>
  );
}

