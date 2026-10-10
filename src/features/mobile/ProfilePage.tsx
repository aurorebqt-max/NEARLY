import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../state/store';
import { saveProfile, validateProfile } from '../../services/profile';
import { logout } from '../../services/auth';
import { setVisibility } from '../../services/social';
import { ProfileFields } from '../account/Fields';
import { VerifiedBadge } from '../trust/VerifiedBadge';
import { trustPages } from '../../data/trust';
import { Portrait, ScreenHeading } from './components';
export function ProfilePage() {
  const { state } = useStore();
  return <ProfileEditor key={state.active} />;
}
function ProfileEditor() {
  const { state, update } = useStore(); const current = state.profiles.find(p => p.id === state.active)!;
  const [draft, setDraft] = useState(structuredClone(current)); const [editing, setEditing] = useState(!current.onboarded); const [notice, setNotice] = useState('');
  return <section className="mobile-screen"><ScreenHeading eyebrow="TOUT SIMPLEMENT VOUS" title={current.onboarded ? 'Votre profil' : 'Bienvenue chez Nearly'}>{current.onboarded ? 'Votre histoire, à votre façon.' : 'Complétez votre profil local pour commencer.'}</ScreenHeading>{!editing && <article className="profile-card"><div className="profile-portrait"><Portrait name={current.name} /></div><h2>{current.name}</h2>{current.verified && <VerifiedBadge />}<p>{current.bio}</p><p>{current.interests.join(' · ')}</p><button className="outline-button" onClick={() => { setDraft(structuredClone(current)); setEditing(true); }}>Personnaliser mon profil</button></article>}{editing && <form onSubmit={e => { e.preventDefault(); const error = validateProfile(draft); if (error) { setNotice(error); return; } update(s => saveProfile(s, draft)); setEditing(false); setNotice('Profil enregistré localement.'); }}><ProfileFields profile={draft} change={setDraft} /><button className="outline-button">{current.onboarded ? 'Enregistrer mon profil' : 'Valider mon onboarding'}</button>{current.onboarded && <button type="button" className="preview-switch" onClick={() => setEditing(false)}>Annuler</button>}</form>}<p className="form-notice" role="status">{notice}</p><Link className="outline-button" to="/questionnaire">Questionnaire d’attirance et préférences</Link><section className="profile-section"><h2>Paramètres et visibilité</h2><p>Réglages de démonstration. Le radar reste sans détection réelle. L’activer autorise la découverte de votre profil dans les croisements simulés.</p><label className="check-label"><input type="checkbox" checked={current.radar} onChange={e => update(s => setVisibility(s, s.active, e.target.checked, current.invisible))} />Activer le radar de démonstration</label><label className="check-label"><input type="checkbox" checked={current.invisible} onChange={e => update(s => setVisibility(s, s.active, current.radar, e.target.checked))} />Mode invisible</label><p className="screen-note">La pause conserve les suggestions jusqu’à 24 h. Le mode invisible révoque les découvertes ; elles ne reviennent pas à sa désactivation. Les cœurs et matchs restent accessibles hors blocage.</p><Link className="presentation-link" to="/verification">Vérifier mon profil</Link></section><section className="profile-section"><h2>Confiance et aide</h2>{Object.entries(trustPages).map(([slug, [title]]) => <p key={slug}><Link className="presentation-link" to={'/confiance/' + slug}>{title}</Link></p>)}</section><Link className="presentation-link" to="/connexion">Connexion / inscription locale</Link>{state.active !== 'aurore' && <button className="outline-button" onClick={() => update(logout)}>Se déconnecter du compte local</button>}{import.meta.env.DEV && <p><Link to="/laboratoire">Laboratoire de développement</Link></p>}</section>;
}
