export type PhysicalTraits = { hair?: string; style?: string; height?: string };
export type InterestPreferences = { values: string[]; weight: number };
export type PersonalityPreferences = { values: string[]; weight: number };
export type AttractionPreferences = {
  ageRange: [number, number]; genders: string[] | null; intentions: string[];
  physical: { traits: PhysicalTraits; weight: number }; interests: InterestPreferences;
  personality: PersonalityPreferences; portraits: string[];
};
export type UserProfile = {
  id: string; name: string; birthDate: string; bio: string; gender: string; intention: string;
  photos: string[]; interests: string[]; personality: string[]; traits: PhysicalTraits;
  verified: boolean; radar: boolean; invisible: boolean; onboarded: boolean;
};
export type HeartRecord = { id: string; from: string; to: string; read: boolean };
export type Suggestion = { id: string; from: string; to: string; expires: number; revoked: boolean };
export type Conversation = { id: string; members: string[]; messages: { id: string; from: string; text: string; at: number; read: boolean }[] };
export type LocalState = { version: 1; active: string; accounts: Record<string, string>; profiles: UserProfile[]; preferences: Record<string, AttractionPreferences>; hearts: HeartRecord[]; suggestions: Suggestion[]; conversations: Conversation[]; blocks: string[]; reports: { from: string; to: string; reason: string }[] };
