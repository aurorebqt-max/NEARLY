import { createContext, useContext } from 'react';
import type { LocalState } from '../domain/models';
import type { AppCommand } from '../domain/commands';
import type { SupabaseBackend } from '../adapters/supabase/backend';
export type BackendMode = 'local' | 'supabase';
export type Store = {
 state: LocalState; update: (fn: (draft: LocalState) => void) => void;
 execute: (command: AppCommand) => Promise<boolean>;
 error: string; loading: boolean; busy: boolean; mode: BackendMode; setMode: (mode: BackendMode) => void;
 backend?: SupabaseBackend; refresh: () => Promise<void>;
};
export const StoreContext = createContext<Store | null>(null);
export function useStore() { const value = useContext(StoreContext); if (!value) throw new Error('StoreProvider missing'); return value; }
export const emptyState = (): LocalState => ({ version: 1, active: '', accounts: {}, profiles: [], preferences: {}, hearts: [], suggestions: [], conversations: [], blocks: [], reports: [] });
