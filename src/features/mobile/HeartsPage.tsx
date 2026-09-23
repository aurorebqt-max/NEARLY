import { useDemo } from '../demo/demoContext';
import { ScreenHeading, PersonPreview, UnavailableButton } from './components';
export function HeartsPage() {
  const { hearts, unread } = useDemo();
  return <section className="mobile-screen">
    <ScreenHeading eyebrow="QUELQU’UN A FAIT LE PREMIER PAS" title="Vos cœurs">Un cœur, c’est un intérêt choisi.</ScreenHeading>
    <div className="list-summary"><h2>Cœurs reçus</h2><span>{unread} non lus · fictifs</span></div>
    <div className="mobile-list">{hearts.map(heart => <article className="received-card" key={heart.id}>
      <span className="unread-tag">Cœur non lu · exemple</span>
      <PersonPreview person={heart.sender} />
      <p className="heart-caption">{heart.sender.name} vous a envoyé un cœur fictif.</p>
      <UnavailableButton>Envoyer un cœur en retour</UnavailableButton>
    </article>)}</div>
    <p className="screen-note">La consultation ne change pas le compteur dans cette démo. Le geste qui marquera un cœur comme lu reste à définir.</p>
  </section>;
}
