import { sampleProfile } from '../demo/fixtures';
import { Portrait, ScreenHeading, UnavailableButton, SignalDivider } from './components';
export function ProfilePage() {
  return <section className="mobile-screen">
    <ScreenHeading eyebrow="TOUT SIMPLEMENT VOUS" title="Votre profil">Votre histoire, à votre façon.</ScreenHeading>
    <article className="profile-card"><div className="profile-portrait"><Portrait name={sampleProfile.name} /><span>ILLUSTRATION · PROFIL FICTIF</span></div><h2>{sampleProfile.name}, {sampleProfile.age} ans</h2><span className="muted">Personnage fictif · aucun compte créé</span><p>{sampleProfile.bio}</p><UnavailableButton>Personnaliser mon profil</UnavailableButton></article>
    <section className="profile-section"><h2>Vos photos</h2><p>De 1 à 6 photos dans le futur profil.</p><div className="photo-slots" aria-label="Trois emplacements illustratifs, ajout de photos à venir"><div>♡<span>Photo fictive</span></div><div>+<span>À venir</span></div><div>+<span>À venir</span></div></div></section>
    <SignalDivider />
    <section className="profile-section"><h2>Ce qui vous ressemble</h2><p>Caractéristiques facultatives, choisies par vous. Les champs restent à définir.</p><UnavailableButton>Compléter mes caractéristiques</UnavailableButton></section>
    <section className="profile-section"><h2>Vos futurs paramètres</h2><p>Présentation uniquement. Aucun réglage actif.</p><div className="settings-preview"><h3>Votre profil d’attirance</h3><p>Vos préférences vous appartiennent.</p><UnavailableButton>Questionnaire d’attirance</UnavailableButton><h3>Visibilité</h3><p>Radar désactivé par défaut. La pause conserve les rencontres déjà proposées jusqu’à expiration ; le mode invisible en révoque l’accès à votre profil, sans restauration automatique.</p><UnavailableButton>Paramètres de confidentialité</UnavailableButton><h3>Confidentialité et sécurité</h3><p>Blocage, signalement et suppression du compte à venir.</p></div></section>
    <p className="screen-note">Les champs et réglages détaillés seront précisés avec le cahier des charges.</p>
  </section>;
}
