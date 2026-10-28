// comparto la sesión autenticada con las pantallas protegidas.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import type { PropsWithChildren } from 'react';
import type { Session } from '../types/auth';
import { refreshSession as renewSession, SessionRefreshError } from '../services/authApi';
import { getSession, removeSession, saveSession, updateStoredSessionIfPresent } from '../services/sessionStorage';
import { synchronizePendingOperations } from '../services/offlineSync';

interface SessionContextValue { session: Session | null; setSession: (session: Session | null) => void; restoring: boolean; }
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);
  useEffect(() => {
    let active = true;
    void getSession().then(async (saved) => {
      if (!saved) return null;
      try { const renewed = await renewSession(saved); await saveSession(renewed); return renewed; }
      catch (error) {
        if (error instanceof SessionRefreshError && error.status === 401) { await removeSession(); return null; }
        return saved;
      }
    }).then((saved) => { if (active) { setSession(saved); setRestoring(false); } })
      .catch(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, []);

  // renuevo antes del vencimiento y vuelvo a intentar si la conexión está temporalmente caída.
  useEffect(() => {
    if (!session) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const renew = async () => {
      try {
        const updated = await renewSession(session);
        if (!active) return;
        await updateStoredSessionIfPresent(updated);
        if (active) setSession(updated);
      } catch (error) {
        if (!active) return;
        if (error instanceof SessionRefreshError && error.status === 401) {
          await removeSession();
          if (active) setSession(null);
          return;
        }
        timer = setTimeout(renew, 30_000);
      }
    };
    const expiresAt = session.accessTokenExpiresAt ?? Date.now();
    timer = setTimeout(renew, Math.max(0, expiresAt - Date.now() - 60_000));
    return () => { active = false; clearTimeout(timer); };
  }, [session]);

  // envío los cambios locales al iniciar sesión y cada vez que vuelve la conexión.
  useEffect(() => {
    if (!session) return;
    const sync = () => { void synchronizePendingOperations(session).catch(() => undefined); };
    sync();
    return NetInfo.addEventListener((state) => { if (state.isConnected) sync(); });
  }, [session]);
  const value = useMemo(() => ({ session, setSession, restoring }), [session, restoring]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession requiere SessionProvider');
  return value;
}
