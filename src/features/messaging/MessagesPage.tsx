import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../../state/store';
import { blocked, block, sendMessage } from '../../services/social';
import { EmptyState, Portrait, ScreenHeading } from '../mobile/components';
import { VerifiedBadge } from '../trust/VerifiedBadge';
export function MessagesPage() {
  const { state } = useStore();
  const [empty, setEmpty] = useState(false);
  const conversations = state.conversations.filter(c => c.members.includes(state.active) && !blocked(state, c.members[0], c.members[1]));
  return <section className="mobile-screen"><ScreenHeading eyebrow="LE DÉBUT D’UNE CONVERSATION" title="Messages">Un espace après deux cœurs réciproques.</ScreenHeading><button className="preview-switch" onClick={() => setEmpty(!empty)}>{empty ? 'Revoir les conversations' : 'Voir l’état vide (démo)'}</button><div className="mobile-list">{empty || !conversations.length ? <EmptyState title="Les mots viendront.">Vos conversations apparaîtront après un match.</EmptyState> : conversations.map(c => {
    const person = state.profiles.find(p => p.id === c.members.find(id => id !== state.active))!;
    const last = c.messages.at(-1); const unread = c.messages.filter(m => m.from !== state.active && !m.read).length;
    return <Link className="received-card conversation-row" key={c.id} to={'/messages/' + c.id}><div className="mini-portrait"><Portrait name={person.name} /></div><div><h2>{person.name}</h2>{person.verified && <VerifiedBadge />}<p>{last?.text || 'Votre match attend un premier mot.'}</p><small>{last ? new Date(last.at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Nouveau match'}{unread > 0 && ` · ${unread} non lu`}</small></div></Link>;
  })}</div></section>;
}
export function ConversationPage() {
  const { id } = useParams(); const { state, update } = useStore();
  const [text, setText] = useState(''); const [notice, setNotice] = useState(''); const bottom = useRef<HTMLDivElement>(null);
  const c = state.conversations.find(c => c.id === id && c.members.includes(state.active));
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [c?.messages.length]);
  if (!c || blocked(state, c.members[0], c.members[1])) return <section className="mobile-screen"><h1>Conversation indisponible</h1><Link to="/messages">Retour aux messages</Link></section>;
  const person = state.profiles.find(p => p.id === c.members.find(p => p !== state.active))!;
  return <section className="mobile-screen conversation"><Link to="/messages">← Messages</Link><header className="person-row"><div className="mini-portrait"><Portrait name={person.name} /></div><div><h1>{person.name}</h1>{person.verified && <VerifiedBadge />}</div></header><details><summary>Profil et sécurité</summary><p>{person.bio}</p><button className="outline-button" onClick={() => update(s => block(s, s.active, person.id))}>Bloquer ce profil</button><form onSubmit={e => { e.preventDefault(); const reason = new FormData(e.currentTarget).get('reason') as string; update(s => { s.reports.push({ from: s.active, to: person.id, reason }); }); setNotice('Signalement enregistré localement. Aucun service de modération connecté.'); }}><label>Motif du signalement<input name="reason" required maxLength={500} /></label><button className="outline-button">Signaler localement</button></form></details><button className="preview-switch" onClick={() => update(s => { s.conversations.find(x => x.id === c.id)!.messages.filter(m => m.from !== s.active).forEach(m => { m.read = true; }); })}>Marquer les messages comme lus</button><div className="message-list" aria-live="polite">{c.messages.map(m => <div key={m.id} className={`message-bubble ${m.from === state.active ? 'mine' : ''}`}><p>{m.text}</p><small>{new Date(m.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</small></div>)}<div ref={bottom} /></div><form className="composer" onSubmit={e => { e.preventDefault(); update(s => sendMessage(s, c.id, text)); setText(''); }}><label className="sr-only" htmlFor="message">Votre message</label><textarea id="message" placeholder="Un premier mot…" value={text} maxLength={2000} onChange={e => setText(e.target.value)} rows={2} /><button className="outline-button" disabled={!text.trim()}>Envoyer</button></form><p role="status">{notice}</p></section>;
}
