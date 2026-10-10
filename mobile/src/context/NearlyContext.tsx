import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { LocalState } from '../../../src/domain/models';
import { getSnapshot, supabase } from '../lib/supabase';

type NearlyValue = {
  snapshot: LocalState | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
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
    const load = async () => {
      try {
        const next = await getSnapshot();
        if (active) setSnapshot(next);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Impossible de charger votre espace Nearly.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();

    const channel = supabase?.channel(`nearly-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hearts' }, () => { void reload(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => { void reload(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => { void reload(); })
      .subscribe(status => {
        if (active && (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT')) {
          setError('Le temps réel est indisponible. Actualisez pour récupérer les dernières données.');
        }
      });

    return () => {
      active = false;
      if (channel) void supabase?.removeChannel(channel);
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
    snapshot, loading, busy, error, reload, perform, clearError: () => setError(null),
  }), [snapshot, loading, busy, error, reload, perform]);

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
