// Fictional presentation data only. No compatibility, expiration or read policy.
export type DemoPerson = { id: string; name: string; age: number; bio: string };
export type DemoHeart = { id: string; sender: DemoPerson; unread: boolean };
export const people: DemoPerson[] = [
  { id: 'lucas', name: 'Lucas', age: 27, bio: 'Les petits cafés, les grands détours et les playlists à partager.' },
  { id: 'noah', name: 'Noah', age: 29, bio: 'Toujours un livre dans mon sac et une envie de prendre le large.' },
  { id: 'sacha', name: 'Sacha', age: 26, bio: 'Un dimanche idéal ? Un marché, un bon repas et une longue balade.' },
];
export const initialHearts: DemoHeart[] = [
  { id: 'heart-lucas', sender: people[0], unread: true },
  { id: 'heart-noah', sender: people[1], unread: true },
];
export const sampleEncounters = [
  { id: 'encounter-one', remaining: '18 h', person: people[1] },
  { id: 'encounter-two', remaining: '6 h', person: people[2] },
];
export const sampleProfile: DemoPerson = { id: 'aurore', name: 'Aurore', age: 28, bio: 'Les choses simples, les conversations qui durent et les départs improvisés.' };
