import type { AttractionPreferences, UserProfile } from './models';
export type AppCommand =
  | { type: 'profile.save'; profile: UserProfile; genders?: string[] | null }
  | { type: 'preferences.save'; preferences: AttractionPreferences }
  | { type: 'visibility.set'; radar: boolean; invisible: boolean }
  | { type: 'encounter.reveal'; id: string }
  | { type: 'heart.send'; to: string }
  | { type: 'heart.read'; id: string }
  | { type: 'heart.withdraw'; id: string }
  | { type: 'message.send'; conversation: string; text: string; requestId: string }
  | { type: 'messages.read'; conversation: string }
  | { type: 'block.add'; to: string }
  | { type: 'block.remove'; to: string }
  | { type: 'report.add'; to: string; reason: string }
  | { type: 'verification.simulate' }
  | { type: 'profile.delete' };
