import type { ReactNode } from 'react';
import { Icon } from '../../design-system/components/Icon';
import type { DemoPerson } from '../demo/fixtures';
export function ScreenHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <header className="screen-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{children}</p></header>;
}
export function Avatar({ person }: { person?: DemoPerson }) {
  return <span className={`demo-avatar ${person ? '' : 'demo-avatar--anonymous'}`} aria-hidden="true">{person ? person.name.slice(0, 1) : <Icon name="spark" />}</span>;
}
export function PersonPreview({ person }: { person: DemoPerson }) {
  return <div className="person-preview"><div className="person-row"><Avatar person={person} /><div><h3>{person.name}, {person.age} ans</h3><span className="muted">Profil fictif · illustration</span></div></div><p>{person.bio}</p></div>;
}
export function UnavailableButton({ children }: { children: ReactNode }) {
  return <button className="unavailable-button" disabled>{children}<span>À venir</span></button>;
}
