export type IconName = 'heart' | 'home' | 'spark' | 'person' | 'arrow' | 'shield';
const paths: Record<IconName, string> = {
  heart: 'M12 20S3 14.5 3 8.5C3 3 10 2 12 7C14 2 21 3 21 8.5C21 14.5 12 20 12 20Z',
  home: 'M3 10 12 3 21 10M5 9V21H10V15H14V21H19V9',
  spark: 'M12 3 14.5 9.5 21 12 14.5 14.5 12 21 9.5 14.5 3 12 9.5 9.5 12 3Z',
  person: 'M16 7A4 4 0 1 1 8 7A4 4 0 1 1 16 7M4 21V19C4 12 20 12 20 19V21',
  arrow: 'M4 12H20M14 6 20 12 14 18',
  shield: 'M12 3 20 6V12C20 17 12 21 12 21S4 17 4 12V6L12 3ZM8 12 11 15 16 9',
};
export function Icon({ name }: { name: IconName }) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>; }
