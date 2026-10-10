import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../state/store';
import { login, register } from '../../services/auth';
import { ScreenHeading } from '../mobile/components';
export function AuthPage() {
  const { update } = useStore(); const navigate = useNavigate(); const [signup, setSignup] = useState(false); const [error, setError] = useState('');
  return <section className="mobile-screen"><ScreenHeading eyebrow="UN NOUVEAU CHAPITRE" title={signup ? 'Inscription' : 'Connexion'}>Compte de démonstration sur ce navigateur uniquement.</ScreenHeading><p className="info-strip">Aucune authentification sécurisée : l’e-mail sert d’identifiant local, sans mot de passe ni envoi d’e-mail. Utilisez des données fictives. Apple et Google ne sont pas connectés.</p><form onSubmit={e => { e.preventDefault(); const email = new FormData(e.currentTarget).get('email') as string; try { update(s => signup ? register(s, email) : login(s, email)); navigate('/profil'); } catch (error) { setError((error as Error).message); } }}><label>E-mail de démonstration<input type="email" name="email" required autoComplete="off" /></label><button className="outline-button">{signup ? 'Créer mon compte local' : 'Se connecter localement'}</button></form><p role="alert">{error}</p><button className="preview-switch" onClick={() => { setSignup(!signup); setError(''); }}>{signup ? 'Déjà un compte ? Connexion' : 'Créer un compte'}</button><p><Link to="/accueil">Continuer avec les personnages fictifs</Link></p></section>;
}
