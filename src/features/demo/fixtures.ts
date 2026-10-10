export type DemoPerson = { id: string; name: string; age: number; bio: string; verified?: boolean; photos?: string[] };
export type DemoHeart = { id: string; sender: DemoPerson; unread: boolean };
