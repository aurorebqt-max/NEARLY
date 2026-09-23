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

/** Decorative, original vector portrait for fictional preview cards. */
export function Portrait({ name }: { name: string }) {
  return <svg className="portrait-art" viewBox="0 0 320 360" role="img" aria-label={`Illustration fictive de ${name}`}>
    <rect width="320" height="360" fill="#3b2540" />
    <circle cx="252" cy="100" r="115" fill="#A65AB8" opacity=".22" />
    <path d="M0 310Q140 155 320 270V360H0Z" fill="#F5A8C7" opacity=".12" />
    <ellipse cx="157" cy="377" rx="116" ry="145" fill="#A65AB8" />
    <path d="M134 211H182V268Q155 285 130 261Z" fill="#D69C9F" />
    <ellipse cx="156" cy="160" rx="62" ry="84" fill="#E9B3AD" />
    <path d="M92 175Q57 62 149 62Q237 48 225 175L208 155L198 111Q146 143 105 119Z" fill="#211323" />
    <path d="M135 187Q155 200 175 186" fill="none" stroke="#995866" strokeWidth="3" strokeLinecap="round" />
    <path d="M124 158H137M177 158H189" stroke="#553347" strokeWidth="4" strokeLinecap="round" />
    <path d="M71 307Q157 350 241 308" fill="none" stroke="#F5A8C7" strokeWidth="2" opacity=".6" />
    <path d="M266 191L270 201L280 205L270 209L266 219L262 209L252 205L262 201Z" fill="#F5A8C7" />
  </svg>;
}
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="empty-state"><span className="empty-symbol"><Icon name="spark" /></span><span className="eyebrow">APERÇU D’UN ÉTAT VIDE</span><h2>{title}</h2><p>{children}</p></div>;
}
export function SignalDivider() {
  return <div className="signal-divider" aria-hidden="true"><span /><i>✦</i><span /></div>;
}
