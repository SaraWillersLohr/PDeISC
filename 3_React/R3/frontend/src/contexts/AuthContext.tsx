/** contexto de sesion y login */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthSession, LoginFormData, LoginMode, Usuario } from '@/types';
import {
  getSessionStorage,
  removeStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from '@/utils/storage';
import { getMeApi, loginApi } from '@/api/authApi';
import { getApiErrorMessage } from '@/api/axiosInstance';

interface AuthContextValue {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  loginMode: LoginMode | null;
  /** modo useState: controla si mostramos login sin cambiar url */
  showStateLogin: boolean;
  setShowStateLogin: (show: boolean) => void;
  login: (data: LoginFormData, mode: LoginMode) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loginMode, setLoginMode] = useState<LoginMode | null>(null);
  const [showStateLogin, setShowStateLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUsuario(null);
    setLoginMode(null);
    removeStorageItem(STORAGE_KEYS.SESSION);
  }, []);

  // restauro y valido sesión al montar — protección de datos
  useEffect(() => {
    const restoreSession = async () => {
      const stored = getSessionStorage<AuthSession>(STORAGE_KEYS.SESSION);

      if (!stored?.data.token) {
        setIsLoading(false);
        return;
      }

      try {
        const perfil = await getMeApi();
        setUsuario(perfil);
        setLoginMode(stored.data.loginMode);
      } catch {
        // token inválido o expirado — limpio storage
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [clearSession]);

  const persistSession = useCallback((session: AuthSession) => {
    setStorageItem(STORAGE_KEYS.SESSION, session, session.rememberMe);
  }, []);

  const login = useCallback(
    async (data: LoginFormData, mode: LoginMode) => {
      setIsLoading(true);
      try {
        const { token, usuario: userData } = await loginApi(data);

        const session: AuthSession = {
          token,
          usuario: userData,
          loginMode: mode,
          rememberMe: data.rememberMe,
        };

        setUsuario(userData);
        setLoginMode(mode);
        persistSession(session);
      } catch (error) {
        throw new Error(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    clearSession();
    setShowStateLogin(false);
  }, [clearSession]);

  const value = useMemo(
    () => ({
      usuario,
      isAuthenticated: !!usuario,
      loginMode,
      showStateLogin,
      setShowStateLogin,
      login,
      logout,
      isLoading,
    }),
    [usuario, loginMode, showStateLogin, login, logout, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
