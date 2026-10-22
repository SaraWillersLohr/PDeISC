// comparto la sesión autenticada con las pantallas protegidas.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Session } from '../types/auth';

interface SessionContextValue { session: Session | null; setSession: (session: Session | null) => void; restoring: boolean; }
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);
  useEffect(() => {
    let active = true;
    void import('../services/sessionStorage').then(({ getSession }) => getSession()).then((saved) => {
      if (active) { setSession(saved); setRestoring(false); }
    }).catch(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, []);
  const value = useMemo(() => ({ session, setSession, restoring }), [session, restoring]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession requiere SessionProvider');
  return value;
}
