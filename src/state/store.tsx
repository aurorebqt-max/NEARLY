import { useRef, useState, type ReactNode } from 'react';
import { initialState } from '../data/fixtures';
import { localStorageAdapter } from '../adapters/storage';
import { applyLocalCommand } from '../services/commands';
import { StoreContext, type BackendMode, type Store } from './context';
import { RemoteProvider } from './RemoteProvider';
// Kept as a compatibility export for the existing screens.
// eslint-disable-next-line react-refresh/only-export-components
export { useStore } from './context';
export function StoreProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<BackendMode>(import.meta.env.VITE_BACKEND_MODE === 'supabase' ? 'supabase' : 'local');
  return mode === 'supabase' ? <RemoteProvider setMode={setMode}>{children}</RemoteProvider> : <LocalProvider setMode={setMode}>{children}</LocalProvider>;
}
function LocalProvider({ children, setMode }: { children: ReactNode; setMode: (mode: BackendMode) => void }) {
  const [state, setState] = useState(() => localStorageAdapter.load() || initialState());
  const current = useRef(state); const [error, setError] = useState('');
  const update: Store['update'] = fn => {
    const next = structuredClone(current.current); fn(next);
    try { localStorageAdapter.save(next); setError(''); current.current = next; setState(next); }
    catch { throw new Error('Stockage local indisponible ou plein. Modification non enregistrée.'); }
  };
  const execute: Store['execute'] = async command => {
    try { update(s => applyLocalCommand(s, command)); return true; }
    catch (error) { setError((error as Error).message); return false; }
  };
  return <StoreContext.Provider value={{ state, update, execute, error, mode: 'local', loading: false, busy: false, setMode, refresh: async () => {} }}>{children}</StoreContext.Provider>;
}
