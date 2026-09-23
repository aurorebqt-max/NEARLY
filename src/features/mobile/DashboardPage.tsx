import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemo } from '../demo/demoContext';
import { Heart } from '../../design-system/components/Heart';
import { Icon } from '../../design-system/components/Icon';
import { ScreenHeading } from './components';
import { routes } from '../../app/routes';
export function DashboardPage() {
  const { unread, added, addExample } = useDemo();
  const [arrival, setArrival] = useState({ count: unread, sequence: 0 });
  if (arrival.count !== unread) {
    setArrival({ count: unread, sequence: arrival.sequence + (unread > arrival.count ? 1 : 0) });
  }
  return <section className="mobile-screen dashboard">
    <ScreenHeading eyebrow="UN PEU PLUS PRÈS" title="Un cœur peut tout changer.">Une rencontre commence par un choix.</ScreenHeading>
    <div className="unread-heart" key={arrival.sequence} data-received={arrival.sequence > 0}>
      <Heart animated={false} />
      <span className="heart-number" aria-hidden="true">{unread}</span>
      {arrival.sequence > 0 && <span className="received-ring" aria-hidden="true" />}
    </div>
    <p className="unread-label" role="status">{unread} cœurs non lus <span>Exemples fictifs</span></p>
    <Link className="button button--primary" to={routes.hearts}>Découvrir mes cœurs<Icon name="arrow" /></Link>
    <div className="radar-off"><Icon name="shield" /><div><strong>Radar désactivé</strong><p>Aucune détection dans cette démo.</p></div></div>
    <aside className="demo-controls"><span className="eyebrow">ESSAYER L’ANIMATION</span><p>Ajoutez un cœur fictif pour voir Nearly s’animer.</p><button onClick={addExample} disabled={added}>{added ? 'Cœur fictif ajouté' : 'Simuler un cœur reçu'}</button></aside>
    <Link className="presentation-link" to={routes.presentation}>Revoir la présentation de Nearly</Link>
  </section>;
}
