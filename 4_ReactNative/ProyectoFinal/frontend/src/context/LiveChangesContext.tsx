import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { apiUrl } from '../config/api';
import { useSession } from './SessionContext';

const LiveChangesContext = createContext(0);

export function LiveChangesProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const token = session?.accessToken;
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!token || !apiUrl) return;
    let cursor = '';
    let request: AbortController | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;

    function stop(): void {
      request?.abort();
      request = undefined;
      clearTimeout(retry);
    }

    async function listen(): Promise<void> {
      const controller = new AbortController();
      request = controller;
      let delay = 0;
      const timeout = setTimeout(() => controller.abort(), 30_000);
      try {
        const response = await fetch(`${apiUrl}/changes?since=${encodeURIComponent(cursor)}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('No se pudieron consultar los cambios');
        const data = await response.json() as { revision?: string };
        if (typeof data.revision !== 'string') throw new Error('Respuesta de cambios inválida');
        if (request === controller && cursor !== data.revision) {
          cursor = data.revision;
          setRevision((current) => current + 1);
        }
      } catch {
        if (request === controller) cursor = '';
        delay = 5_000;
      } finally {
        clearTimeout(timeout);
        if (request === controller) retry = setTimeout(() => { void listen(); }, delay);
      }
    }

    const subscription = AppState.addEventListener('change', (state) => {
      stop();
      if (state === 'active') {
        cursor = '';
        void listen();
      }
    });
    if (AppState.currentState !== 'background') void listen();
    return () => { stop(); subscription.remove(); };
  }, [token]);

  return <LiveChangesContext.Provider value={revision}>{children}</LiveChangesContext.Provider>;
}

export function useLiveChanges(): number {
  return useContext(LiveChangesContext);
}
