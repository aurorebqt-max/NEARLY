import { people, sampleProfile } from '../demo/fixtures';
import { useState } from 'react';
import { Icon } from '../../design-system/components/Icon';
import { useDemo } from '../demo/demoContext';
import { ScreenHeading, PersonPreview, UnavailableButton, EmptyState, Avatar, SignalDivider } from './components';
export function HeartsPage() {
  const { hearts, unread } = useDemo();
  const [empty, setEmpty] = useState(false);
  return <section className="mobile-screen">
    <ScreenHeading eyebrow="QUELQU’UN A FAIT LE PREMIER PAS" title="Vos cœurs">Un cœur, c’est un intérêt choisi.</ScreenHeading>
    <div className="hearts-total"><span aria-hidden="true">{unread}</span><div><strong>Cœurs non lus</strong><p>Des intérêts volontairement exprimés.<br />Exemples fictifs.</p></div></div>
    <button className="preview-switch" aria-pressed={empty} onClick={() => setEmpty(value => !value)}>{empty ? 'Revoir les cœurs fictifs' : 'Voir l’état vide (démo)'}</button>
    <div className="list-summary"><h2>Cœurs reçus</h2><span>{unread} non lus · fictifs</span></div>
    <div className="mobile-list">{empty ? <EmptyState title="Une place pour le premier cœur.">Un intérêt se choisit. Les cœurs reçus apparaîtront ici, avec le prénom de leur expéditeur.</EmptyState> : hearts.map(heart => <article className="received-card" data-new={heart.id === 'heart-example'} key={heart.id}>
      <span className="unread-tag">Cœur non lu · exemple</span>
      <PersonPreview person={heart.sender} />
      <p className="heart-caption">{heart.sender.name} vous a envoyé un cœur fictif.</p>
      <UnavailableButton>Envoyer un cœur en retour</UnavailableButton>
    </article>)}</div>
    <SignalDivider />
    <details className="match-preview"><summary>Aperçu d’un match fictif</summary><div className="match-scene"><span className="eyebrow">DÉMONSTRATION VISUELLE</span><div className="match-pair"><Avatar person={sampleProfile} /><Icon name="heart" /><Avatar person={people[0]} /></div><h2>Le même élan.</h2><p>Deux cœurs volontaires, un match réciproque.</p><span>Aucun match n’est créé dans cet aperçu.</span></div></details>
    <p className="screen-note">La consultation ne change pas le compteur dans cette démo. Le geste qui marquera un cœur comme lu reste à définir.</p>
  </section>;
}
