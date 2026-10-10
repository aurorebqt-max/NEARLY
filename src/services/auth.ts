import type { LocalState } from '../domain/models';
import { defaultPreferences } from '../data/config';
export function register(s: LocalState, email: string) {
  const key = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) throw new Error('Adresse e-mail invalide.');
  if (s.accounts[key]) throw new Error('Ce compte local existe déjà. Utilisez Connexion.');
  const id = crypto.randomUUID(); s.accounts[key] = id; s.active = id;
  s.profiles.push({ id, name: '', birthDate: '', bio: '', gender: '', intention: '', photos: [], interests: [], personality: [], traits: {}, verified: false, radar: false, invisible: false, onboarded: false });
  s.preferences[id] = defaultPreferences();
}
export function login(s: LocalState, email: string) {
  const id = s.accounts[email.trim().toLowerCase()]; if (!id) throw new Error('Aucun compte local pour cette adresse.'); s.active = id;
}
export function logout(s: LocalState) { s.active = 'aurore'; }
