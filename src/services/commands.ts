import type { AppCommand } from '../domain/commands';
import type { LocalState } from '../domain/models';
import { saveProfile } from './profile';
import { savePreferences } from './preferences';
import { block, pairKey, sendHeart, sendMessage, setVisibility } from './social';
import { deleteActiveProfile } from './dataManagement';
export function applyLocalCommand(s: LocalState, c: AppCommand) {
  switch (c.type) {
    case 'profile.save': saveProfile(s, c.profile); if (c.genders !== undefined) savePreferences(s, { ...s.preferences[s.active], genders: c.genders }); break;
    case 'preferences.save': savePreferences(s, c.preferences); break;
    case 'visibility.set': setVisibility(s, s.active, c.radar, c.invisible); break;
    case 'encounter.reveal': break;
    case 'heart.send': sendHeart(s, s.active, c.to); break;
    case 'heart.read': s.hearts.filter(h => h.id === c.id && h.to === s.active).forEach(h => { h.read = true; }); break;
    case 'heart.withdraw': s.hearts = s.hearts.filter(h => h.id !== c.id || h.from !== s.active || s.conversations.some(v => v.id === pairKey(h.from, h.to))); break;
    case 'message.send': sendMessage(s, c.conversation, c.text); break;
    case 'messages.read': s.conversations.find(v => v.id === c.conversation)?.messages.filter(m => m.from !== s.active).forEach(m => { m.read = true; }); break;
    case 'block.add': block(s, s.active, c.to); break;
    case 'block.remove': s.blocks = s.blocks.filter(b => b !== pairKey(s.active, c.to)); break;
    case 'report.add': s.reports.push({ from: s.active, to: c.to, reason: c.reason }); break;
    case 'verification.simulate': s.profiles.find(p => p.id === s.active)!.verified = true; break;
    case 'profile.delete': deleteActiveProfile(s); break;
  }
}
