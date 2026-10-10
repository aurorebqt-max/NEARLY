import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import type { LocalState } from '../domain/models';
import { initialState } from '../data/fixtures';
import { localStorageAdapter } from '../adapters/storage';
const Context = createContext<{ state: LocalState; update: (fn: (draft: LocalState) => void) => void; error: string } | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => localStorageAdapter.load() || initialState());
  const current = useRef(state);
  const [error, setError] = useState('');
  function update(fn: (draft: LocalState) => void) {
    const next = structuredClone(current.current); fn(next);
    try { localStorageAdapter.save(next); setError(''); current.current = next; setState(next); } catch { setError('Stockage local indisponible ou plein. Modification non enregistrée.'); }
  }
  return <Context.Provider value={{ state, update, error }}>{children}</Context.Provider>;
}
// Context hook shares this module with its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useStore() { const value = useContext(Context); if (!value) throw new Error('StoreProvider missing'); return value; }
