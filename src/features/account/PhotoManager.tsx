import { useState } from 'react';
import { useStore } from '../../state/store';
import { uploadPhoto, removePhoto } from '../../adapters/supabase/photos';
import { ProfileImage } from './ProfileImage';
export function PhotoManager() {
  const { state, backend, refresh } = useStore(); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState('');
  const photos = state.profiles.find(p => p.id === state.active)?.photos || [];
  async function upload(file?: File, replacing?: string) {
    if (!file || !backend || busy) return; setBusy(true); setNotice('');
    try { await uploadPhoto(backend, state.active, file, replacing); setNotice('Photo enregistrée.'); }
    catch (e) { setNotice((e as Error).message); } finally { await refresh(); setBusy(false); }
  }
  return <fieldset disabled={busy}><legend>Vos photos · 1 à 6</legend><p className="screen-note">JPEG, PNG ou WebP, 5 Mo maximum. Photos privées, accessibles uniquement dans les interactions autorisées.</p><div className="photo-editor">{photos.map((path, i) => <div key={path}><ProfileImage name="votre profil" path={path} /><label>Remplacer la photo {i + 1}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { void upload(e.target.files?.[0], path); e.target.value = ''; }} /></label><button type="button" className="outline-button" onClick={async () => { if (!backend) return; setBusy(true); try { await removePhoto(backend, path); setNotice('Photo supprimée.'); } catch (e) { setNotice((e as Error).message); } finally { await refresh(); setBusy(false); } }}>Supprimer la photo {i + 1}</button></div>)}</div>{photos.length < 6 && <label>Ajouter une photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} /></label>}<p role="status">{busy ? 'Enregistrement de la photo…' : notice}</p></fieldset>;
}
