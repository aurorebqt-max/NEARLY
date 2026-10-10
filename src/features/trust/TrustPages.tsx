import { deleteActiveProfile } from '../../services/dataManagement';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../../state/store';
import { Portrait, ScreenHeading } from '../mobile/components';
import { trustPages } from '../../data/trust';
export function TrustPage() {
  const { slug } = useParams(); const { state, update } = useStore(); const [confirm, setConfirm] = useState(false);
  const content = trustPages[slug || ''];
  if (!content) return <section className="mobile-screen"><h1>Page indisponible</h1></section>;
  return <section className="mobile-screen"><Link to="/profil">← Profil</Link><ScreenHeading eyebrow="CONFIANCE NEARLY" title={content[0]}>Texte provisoire de conception — non juridique, non définitif.</ScreenHeading><p className="info-strip">{content[1]}</p>{slug === 'donnees' && <><a className="outline-button" download="nearly-demo.json" href={'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2))}>Exporter la démonstration locale</a><button className="outline-button" onClick={() => setConfirm(true)}>Supprimer mon profil local</button>{confirm && <button className="outline-button" onClick={() => { update(deleteActiveProfile); setConfirm(false); }}>Confirmer la suppression locale</button>}</>}</section>;
}
export function VerificationPage() {
  const { state, update } = useStore(); const [step, setStep] = useState('intro');
  const name = state.profiles.find(p => p.id === state.active)!.name;
  return <section className="mobile-screen"><Link to="/profil">← Profil</Link><ScreenHeading eyebrow="CONFIANCE, EN DOUCEUR" title="Vérifier mon profil">Simulation uniquement. Aucune caméra activée, aucune analyse faciale.</ScreenHeading>{step === 'intro' && <><p>Découvrez le parcours de vérification Nearly. Ce badge de démonstration n’atteste ni identité ni majorité.</p><button className="outline-button" onClick={() => setStep('permission')}>Commencer</button></>}{step === 'permission' && <><h2>Demande d’accès caméra simulée</h2><button className="outline-button" onClick={() => setStep('capture')}>Autoriser pour la simulation</button><button className="outline-button" onClick={() => setStep('failed')}>Refuser</button></>}{step === 'capture' && <><Portrait name={name} /><button className="outline-button" onClick={() => setStep('pending')}>Capturer le portrait fictif</button></>}{step === 'pending' && <><h2>Vérification en cours · simulation</h2><button className="outline-button" onClick={() => { update(s => { s.profiles.find(p => p.id === s.active)!.verified = true; }); setStep('success'); }}>Simuler une réussite</button><button className="outline-button" onClick={() => setStep('failed')}>Simuler un échec</button></>}{step === 'success' && <h2>Vérification réussie · démo</h2>}{step === 'failed' && <><h2>Vérification non aboutie</h2><button className="outline-button" onClick={() => setStep('permission')}>Recommencer</button></>}</section>;
}
