import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { LocalState } from '../domain/models';
import { getSnapshot } from '../lib/supabase';
import { appLifecycle, type RealtimeStatus } from '../services/appLifecycle';

type NearlyValue = {
  snapshot: LocalState | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  realtimeStatus: RealtimeStatus;
  reload: () => Promise<void>;
  perform: (operation: () => Promise<void>) => Promise<boolean>;
  clearError: () => void;
};

const NearlyContext = createContext<NearlyValue | null>(null);

export function NearlyProvider({ children, userId }: PropsWithChildren<{ userId: string }>) {
  const [snapshot, setSnapshot] = useState<LocalState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('stopped');

  const reload = useCallback(async () => {
    setError(null);
    try {
      setSnapshot(await getSnapshot());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de charger votre espace Nearly.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void reload();
    appLifecycle.start(userId, {
      refresh: reload,
      status: status => {
        if (active) setRealtimeStatus(status);
      },
    });
    return () => {
      active = false;
      appLifecycle.stop();
    };
  }, [reload, userId]);

  const perform = useCallback(async (operation: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await operation();
      await reload();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Cette action Nearly a échoué.');
      return false;
    } finally {
      setBusy(false);
    }
  }, [reload]);

  const value = useMemo(() => ({
    snapshot, loading, busy, error, realtimeStatus, reload, perform, clearError: () => setError(null),
  }), [snapshot, loading, busy, error, realtimeStatus, reload, perform]);

  return <NearlyContext.Provider value={value}>{children}</NearlyContext.Provider>;
}

export function useNearly() {
  const value = useContext(NearlyContext);
  if (!value) throw new Error('useNearly doit être utilisé dans NearlyProvider.');
  return value;
}

export function useOptionalBusy() {
  return useContext(NearlyContext)?.busy ?? false;
}
