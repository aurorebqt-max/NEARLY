import { Icon, type IconName } from './Icon';
export function FeatureCard({ icon, title, children }: { icon: IconName; title: string; children: string }) { return <article className="feature-card"><span className="feature-icon"><Icon name={icon} /></span><div><h3>{title}</h3><p>{children}</p></div><span className="coming-label">À venir</span></article>; }
