import type { LocalState } from '../domain/models';
export interface StorageAdapter { load(): LocalState | null; save(state: LocalState): void; clear(): void }
const key = 'nearly.demo.v1';
export const localStorageAdapter: StorageAdapter = {
  load() { try { const data = JSON.parse(localStorage.getItem(key) || 'null'); return data?.version === 1 && Array.isArray(data.profiles) && data.profiles.some((p: { id: string }) => p.id === data.active) ? data : null; } catch { return null; } },
  save(state) { localStorage.setItem(key, JSON.stringify(state)); },
  clear() { localStorage.removeItem(key); },
};
