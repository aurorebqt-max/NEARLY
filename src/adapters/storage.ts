import type { LocalState } from '../domain/models';
export interface StorageAdapter {
  load(): LocalState | null;
  save(state: LocalState): void;
  clear(): void;
}
const key = 'nearly.demo.v1';
/** Reject incomplete/obsolete snapshots instead of crashing during hydration. Not a security boundary. */
function isSnapshot(value: unknown): value is LocalState {
  if (!value || typeof value !== 'object') return false;
  const s = value as LocalState;
  if (s.version !== 1 || !s.accounts || !s.preferences || !Array.isArray(s.profiles) || !s.profiles.some(p => p.id === s.active)) return false;
  if (![s.hearts, s.suggestions, s.conversations, s.blocks, s.reports].every(Array.isArray)) return false;
  return s.profiles.every(p => {
    const prefs = s.preferences[p.id];
    return typeof p.name === 'string' && typeof p.birthDate === 'string' && typeof p.bio === 'string' && Array.isArray(p.photos) && Array.isArray(p.interests) && Array.isArray(p.personality) && !!p.traits && !!prefs && Array.isArray(prefs.ageRange) && !!prefs.physical?.traits && Array.isArray(prefs.interests?.values) && Array.isArray(prefs.personality?.values) && Array.isArray(prefs.portraits);
  }) && s.hearts.every(h => s.profiles.some(p => p.id === h.from) && s.profiles.some(p => p.id === h.to)) && s.conversations.every(c => Array.isArray(c.members) && c.members.length === 2 && c.members.every(id => s.profiles.some(p => p.id === id)) && Array.isArray(c.messages));
}
export const localStorageAdapter: StorageAdapter = {
  load() {
    try {
      const data: unknown = JSON.parse(localStorage.getItem(key) || 'null');
      return isSnapshot(data) ? data : null;
    } catch { return null; }
  },
  save(state) { localStorage.setItem(key, JSON.stringify(state)); },
  clear() { localStorage.removeItem(key); },
};
