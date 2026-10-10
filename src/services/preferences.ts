import type { AttractionPreferences, LocalState } from '../domain/models';
export function validatePreferences(p: AttractionPreferences) {
  return !Number.isInteger(p.ageRange[0]) || !Number.isInteger(p.ageRange[1]) || p.ageRange[0] < 18 || p.ageRange[1] > 120 || p.ageRange[0] > p.ageRange[1] ? 'Choisissez une plage d’âge valide entre 18 et 120 ans.' : '';
}
export function savePreferences(s: LocalState, p: AttractionPreferences) { const error = validatePreferences(p); if (error) throw new Error(error); s.preferences[s.active] = p; }
