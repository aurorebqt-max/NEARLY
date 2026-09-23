import { useState } from 'react';
import { sampleEncounters } from '../demo/fixtures';
import { Avatar, PersonPreview, ScreenHeading, UnavailableButton } from './components';
export function EncountersPage() {
  const [revealed, setRevealed] = useState<string[]>([]);
  return <section className="mobile-screen">
    <ScreenHeading eyebrow="DES CHEMINS QUI SE CROISENT" title="Rencontres">Vous pourriez plaire à quelqu’un.</ScreenHeading>
    <p className="info-strip">Une rencontre potentielle est disponible 24 heures.</p>
    <p className="screen-note">Suggestions et durées fictives, sans décompte réel. Une suggestion n’est pas un cœur.</p>
    <div className="mobile-list">{sampleEncounters.map((encounter, index) => <article className="encounter-card" key={encounter.id}>
      <div className="card-top"><span className="eyebrow">RENCONTRE 0{index + 1}</span><span className="time-pill">Exemple : reste {encounter.remaining}</span></div>
      {revealed.includes(encounter.id) ? <><PersonPreview person={encounter.person} /><UnavailableButton>Envoyer un cœur</UnavailableButton></> : <>
        <Avatar /><h2>Tu pourrais plaire à quelqu’un à proximité.</h2>
        <p>Un profil à découvrir, selon ses choix de visibilité.</p>
        <button className="outline-button" onClick={() => setRevealed(current => [...current, encounter.id])}>Découvrir le profil fictif <span className="sr-only">{index + 1}</span></button>
      </>}
    </article>)}</div>
    <p className="screen-note">Aucun lieu ni trajet affiché. Consulter un profil ne lui envoie aucune notification.</p>
  </section>;
}
