import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../state/store';
import { login, register } from '../../services/auth';
import { ScreenHeading } from '../mobile/components';
import { BackendChoice } from './BackendChoice';
export function AuthPage() {
  const { update, mode, backend, refresh } = useStore(); const navigate = useNavigate();
  const [signup, setSignup] = useState(false); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const remote = mode === 'supabase';
  return <section className="mobile-screen"><ScreenHeading eyebrow="UN NOUVEAU CHAPITRE" title={signup ? 'Inscription' : 'Connexion'}>{remote ? 'Votre compte Nearly.' : 'Compte de démonstration sur ce navigateur uniquement.'}</ScreenHeading>
    <p className="info-strip">{remote ? 'Connexion par e-mail et mot de passe. Confirmez votre adresse si un e-mail de confirmation vous est envoyé. Apple et Google seront proposés ultérieurement.' : 'Aucune authentification sécurisée : l’e-mail sert d’identifiant local, sans mot de passe ni envoi d’e-mail. Utilisez des données fictives. Apple et Google ne sont pas connectés.'}</p>
    <form onSubmit={async e => { e.preventDefault(); const form = new FormData(e.currentTarget); const email = form.get('email') as string; setBusy(true); setNotice(''); try {
      if (remote) { if (!backend) throw new Error('Backend non configuré.'); if (signup) setNotice(await backend.signUp(email, form.get('password') as string)); else await backend.signIn(email, form.get('password') as string); await refresh(); if (!signup) navigate('/profil'); }
      else { update(s => signup ? register(s, email) : login(s, email)); navigate('/profil'); }
    } catch (error) { setNotice((error as Error).message); } finally { setBusy(false); } }}>
      <label>{remote ? 'E-mail' : 'E-mail de démonstration'}<input type="email" name="email" required autoComplete="email" /></label>
      {remote && <label>Mot de passe<input type="password" name="password" required minLength={8} maxLength={128} autoComplete={signup ? 'new-password' : 'current-password'} /></label>}
      <button className="outline-button" disabled={busy || (remote && !backend)}>{busy ? 'Veuillez patienter…' : remote ? signup ? 'Créer mon compte' : 'Se connecter' : signup ? 'Créer mon compte local' : 'Se connecter localement'}</button>
    </form><p role="status">{notice}</p><button className="preview-switch" onClick={() => { setSignup(!signup); setNotice(''); }}>{signup ? 'Déjà un compte ? Connexion' : 'Créer un compte'}</button>
    {!remote && <p><Link to="/accueil">Continuer avec les personnages fictifs</Link></p>}<BackendChoice />
  </section>;
}
