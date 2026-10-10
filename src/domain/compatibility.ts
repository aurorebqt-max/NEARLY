import type { AttractionPreferences, UserProfile } from './models';
import { demoConfig } from '../data/config';
export function ageAt(birthDate: string, now = new Date()) {
  const birth = new Date(birthDate + 'T00:00:00Z');
  if (!Number.isFinite(birth.getTime()) || birth.toISOString().slice(0, 10) !== birthDate) return NaN;
  return now.getUTCFullYear() - birth.getUTCFullYear() - Number(now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate()));
}
export function evaluateCompatibility(preferences: AttractionPreferences, candidate: UserProfile, now = new Date()) {
  const age = ageAt(candidate.birthDate, now);
  if (!candidate.onboarded || !Number.isFinite(age) || age < 18 || age < preferences.ageRange[0] || age > preferences.ageRange[1] || !preferences.genders?.includes(candidate.gender)) return { score: 0, matches: false };
  if (preferences.intentions.length && !preferences.intentions.includes(candidate.intention)) return { score: 0, matches: false };
  const traits = Object.entries(preferences.physical.traits).filter(([, value]) => value);
  const groups = [
    { values: traits.map(([key, value]) => candidate.traits[key as keyof typeof candidate.traits] === value), weight: preferences.physical.weight },
    { values: preferences.interests.values.map(value => candidate.interests.includes(value)), weight: preferences.interests.weight },
    { values: preferences.personality.values.map(value => candidate.personality.includes(value)), weight: preferences.personality.weight },
  ].filter(group => group.values.length && group.weight > 0);
  const total = groups.reduce((sum, group) => sum + group.weight, 0);
  const score = total ? groups.reduce((sum, group) => sum + group.weight * group.values.filter(Boolean).length / group.values.length, 0) / total : 1;
  return { score, matches: score >= demoConfig.threshold };
}
