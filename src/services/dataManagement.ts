import type { LocalState } from '../domain/models';
import { fixtureProfiles } from '../data/fixtures';
import { defaultPreferences } from '../data/config';
export function deleteActiveProfile(s: LocalState) {
  const id = s.active;
  s.profiles = s.profiles.filter(p => p.id !== id);
  delete s.preferences[id];
  s.accounts = Object.fromEntries(Object.entries(s.accounts).filter(([, value]) => value !== id));
  s.hearts = s.hearts.filter(h => h.from !== id && h.to !== id);
  s.suggestions = s.suggestions.filter(x => x.from !== id && x.to !== id);
  s.conversations = s.conversations.filter(c => !c.members.includes(id));
  s.reports = s.reports.filter(r => r.from !== id && r.to !== id);
  s.blocks = s.blocks.filter(b => !b.split(':').includes(id));
  // Restore only the public seed character as the anonymous demo entry point.
  if (id === 'aurore') {
    s.profiles.unshift(structuredClone(fixtureProfiles[0]));
    s.preferences.aurore = defaultPreferences();
  }
  s.active = 'aurore';
}
