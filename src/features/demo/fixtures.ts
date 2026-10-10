import { fixtureProfiles } from '../../data/fixtures';
import { ageAt } from '../../domain/compatibility';
export type DemoPerson = { id: string; name: string; age: number; bio: string; verified?: boolean };
export type DemoHeart = { id: string; sender: DemoPerson; unread: boolean };
export const people = fixtureProfiles.slice(1).map(p => ({ ...p, age: ageAt(p.birthDate) }));
export const sampleProfile = { ...fixtureProfiles[0], age: ageAt(fixtureProfiles[0].birthDate) };
export const initialHearts = people.slice(0, 2).map(sender => ({ id: 'heart-' + sender.id, sender, unread: true }));
export const sampleEncounters = people.slice(1).map((person, i) => ({ id: 'encounter-' + i, remaining: '18 h', person }));
