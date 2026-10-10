import type { LocalState, UserProfile } from '../domain/models';
import { ageAt } from '../domain/compatibility';
export function validateProfile(p: UserProfile) {
  if (!p.name.trim() || p.name.length > 40) return 'Indiquez un prénom de 1 à 40 caractères.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate) || !Number.isFinite(ageAt(p.birthDate)) || ageAt(p.birthDate) < 18 || ageAt(p.birthDate) > 120) return 'Une date de naissance valide et un âge déclaré de 18 ans minimum sont nécessaires.';
  if (!p.photos.length || p.photos.length > 6) return 'Choisissez de 1 à 6 portraits fictifs.';
  if (p.bio.length > 500 || !p.intention) return 'Présentation limitée à 500 caractères et intention requise.';
  return '';
}
export function saveProfile(s: LocalState, p: UserProfile) {
  const error = validateProfile(p); if (error) throw new Error(error);
  s.profiles = s.profiles.map(old => old.id === p.id ? { ...p, name: p.name.trim(), onboarded: true } : old);
}
