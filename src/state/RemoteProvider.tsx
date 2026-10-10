import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createSupabaseClient } from '../adapters/supabase/client';
import { SupabaseBackend } from '../adapters/supabase/backend';
import { StoreContext, emptyState, type BackendMode, type Store } from './context';
export function RemoteProvider({ children, setMode }: { children: ReactNode; setMode: (mode: BackendMode) => void }) {
  const setup = useMemo(() => { try { return { backend: new SupabaseBackend(createSupabaseClient()), error: '' }; } catch (e) { return { backend: undefined, error: (e as Error).message }; } }, []);
  const backend = setup.backend;
  const [state, setState] = useState(emptyState); const [error, setError] = useState(setup.error);
  const [loading, setLoading] = useState(Boolean(backend)); const [busy, setBusy] = useState(false);
  const generation = useRef(0); const active = useRef(''); const working = useRef(false);
  const refresh = useCallback(async () => {
    if (!backend) return;
    const ticket = ++generation.current;
    try {
      const { data, error } = await backend.client.auth.getSession(); if (error) throw error;
      if (!data.session) { active.current = ''; if (ticket === generation.current) setState(emptyState()); return; }
      const snapshot = await backend.snapshot();
      if (ticket === generation.current) { active.current = data.session.user.id; setState(snapshot); setError(''); }
    } catch (e) { if (ticket === generation.current) { setError((e as Error).message); setState(emptyState()); } }
    finally { if (ticket === generation.current) setLoading(false); }
  }, [backend]);
  useEffect(() => {
    if (!backend) return;
    let alive = true; const epoch = generation;
    const { data } = backend.client.auth.onAuthStateChange((_event, session) => {
      // No awaited Supabase calls inside the auth callback (avoids the auth lock deadlock).
      if (session?.user.id !== active.current) { generation.current++; setState(emptyState()); setLoading(Boolean(session)); active.current = session?.user.id || ''; }
      queueMicrotask(() => { if (alive) void refresh(); });
    });
    const timer = window.setInterval(() => { if (!working.current && document.visibilityState === 'visible') void refresh(); }, 10000);
    const onFocus = () => { if (!working.current) void refresh(); }; window.addEventListener('focus', onFocus);
    return () => { alive = false; epoch.current++; data.subscription.unsubscribe(); clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, [backend, refresh]);
  const execute: Store['execute'] = async command => {
    if (!backend || working.current) return false;
    working.current = true; setBusy(true); setError('');
    try { await backend.execute(command); await refresh(); return true; }
    catch (e) { setError((e as Error).message); return false; }
    finally { working.current = false; setBusy(false); }
  };
  return <StoreContext.Provider value={{ state, execute, error, loading, busy, backend, mode: 'supabase', setMode, refresh, update: () => { throw new Error('Les mutations de démonstration sont interdites en mode Supabase.'); } }}>{children}</StoreContext.Provider>;
}
