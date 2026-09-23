import { createContext, useContext } from 'react';
import type { DemoHeart } from './fixtures';
export type DemoState = { hearts: DemoHeart[]; unread: number; added: boolean; addExample: () => void };
export const DemoContext = createContext<DemoState | null>(null);
export function useDemo() {
  const state = useContext(DemoContext);
  if (!state) throw new Error('Demo screens require PhoneShell');
  return state;
}
