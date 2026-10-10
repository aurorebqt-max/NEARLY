import type { LocalState } from '../domain/models';
import { evaluateCompatibility } from '../domain/compatibility';
import { demoConfig } from '../data/config';
export const pairKey = (a: string, b: string) => [a, b].sort().join(':');
export const blocked = (s: LocalState, a: string, b: string) => s.blocks.includes(pairKey(a, b));
export const accessible = (s: LocalState, from: string, to: string) => !blocked(s, from, to) && s.suggestions.some(x => x.from === from && x.to === to && !x.revoked && x.expires > Date.now());
export function cross(s: LocalState, a: string, b: string) {
  if (a === b || blocked(s, a, b)) return;
  const profiles = [a, b].map(id => s.profiles.find(p => p.id === id)!);
  if (profiles.some(p => !p?.radar || p.invisible || !p.onboarded)) return;
  for (const [origin, recipient] of [[profiles[0], profiles[1]], [profiles[1], profiles[0]]]) {
    if (evaluateCompatibility(s.preferences[origin.id], recipient).matches && !accessible(s, origin.id, recipient.id)) s.suggestions.push({ id: crypto.randomUUID(), from: origin.id, to: recipient.id, expires: Date.now() + demoConfig.suggestionHours * 3600000, revoked: false });
  }
}
export function sendHeart(s: LocalState, from: string, to: string) {
  if (from === to || blocked(s, from, to)) return;
  if (!accessible(s, to, from) && !s.hearts.some(h => h.from === to && h.to === from)) return;
  if (!s.hearts.some(h => h.from === from && h.to === to)) s.hearts.push({ id: from + ':' + to, from, to, read: false });
  const id = pairKey(from, to);
  if (s.hearts.some(h => h.from === to && h.to === from) && !s.conversations.some(c => c.id === id)) s.conversations.push({ id, members: [from, to], messages: [] });
}
export function setVisibility(s: LocalState, id: string, radar: boolean, invisible: boolean) {
  const p = s.profiles.find(p => p.id === id)!;
  p.radar = radar; p.invisible = invisible;
  if (invisible) s.suggestions.filter(x => x.from === id || x.to === id).forEach(x => { x.revoked = true; });
}
export function block(s: LocalState, a: string, b: string) {
  if (!blocked(s, a, b)) s.blocks.push(pairKey(a, b));
  s.suggestions.filter(x => pairKey(x.from, x.to) === pairKey(a, b)).forEach(x => { x.revoked = true; });
}
export function sendMessage(s: LocalState, conversationId: string, text: string) {
  const c = s.conversations.find(c => c.id === conversationId && c.members.includes(s.active));
  if (!c || blocked(s, c.members[0], c.members[1]) || !text.trim() || text.length > 2000) return;
  c.messages.push({ id: crypto.randomUUID(), from: s.active, text: text.trim(), at: Date.now(), read: true });
}
