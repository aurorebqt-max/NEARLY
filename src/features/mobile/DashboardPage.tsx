import { useStore } from '../../state/store';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemo } from '../demo/demoContext';
import { Heart } from '../../design-system/components/Heart';
import { Icon } from '../../design-system/components/Icon';
import { ScreenHeading } from './components';
import { routes } from '../../app/routes';
export function DashboardPage() {
  const { state, mode } = useStore();
  const current = state.profiles.find(p => p.id === state.active)!;
  const { unread, added, addExample } = useDemo();
  const [arrival, setArrival] = useState({ count: unread, sequence: 0 });
  if (arrival.count !== unread) {
    setArrival({ count: unread, sequence: arrival.sequence + (unread > arrival.count ? 1 : 0) });
  }
  return <section className="mobile-screen dashboard">
    <ScreenHeading eyebrow="UN PEU PLUS PRÈS" title="Un cœur peut tout changer.">Une rencontre commence par un choix.</ScreenHeading>
    <div className="unread-heart" key={arrival.sequence} data-received={arrival.sequence > 0}>
      <div className="heart-signal" aria-hidden="true">
        <span className="signal-ring signal-ring--one" />
        <span className="signal-ring signal-ring--two" />
        <span className="signal-halo" />
      </div>
      <div className="heart-idle"><Heart animated={false} /></div>
      <span className="heart-number" aria-hidden="true">{unread}</span>
      {arrival.sequence > 0 && <span className="received-ring" aria-hidden="true" />}
    </div>
    <p className="unread-label" role="status">{unread} cœurs non lus <span>{mode === 'local' ? 'Exemples fictifs' : 'Intérêts reçus'}</span></p>
    <Link className="button button--primary" to={routes.hearts}>Découvrir mes cœurs<Icon name="arrow" /></Link>
    <div className="radar-off"><Icon name="shield" /><div><strong>{current.invisible ? "Mode invisible" : current.radar ? "Radar de démonstration activé" : "Radar désactivé"}</strong><p>Aucune détection dans cette démo.</p></div></div>
    {mode === 'local' && <aside className="demo-controls"><span className="eyebrow">ESSAYER L’ANIMATION</span><p>Ajoutez un cœur fictif pour voir Nearly s’animer.</p><button onClick={addExample} disabled={added}>{added ? 'Cœur fictif ajouté' : 'Simuler un cœur reçu'}</button></aside>}
    <Link className="presentation-link" to="/connexion">Créer mon profil local / connexion</Link>{import.meta.env.DEV && mode === 'local' && <p><Link to="/laboratoire">Laboratoire de développement</Link></p>}
    <Link className="presentation-link" to={routes.presentation}>Revoir la présentation de Nearly</Link>
  </section>;
}
