import { useEffect, useState } from 'react';
import { useStore } from '../../state/store';
import { Portrait } from '../mobile/components';
export function ProfileImage({ name, path }: { name: string; path?: string }) {
  const { backend, mode } = useStore(); const [url, setUrl] = useState('');
  useEffect(() => {
    if (!backend || !path) return;
    let alive = true;
    const load = async () => { const { data } = await backend.client.storage.from('profile-photos').createSignedUrl(path, 60); if (alive) setUrl(data?.signedUrl || ''); };
    void load(); const timer = window.setInterval(() => void load(), 45000);
    return () => { alive = false; clearInterval(timer); };
  }, [backend, path]);
  return mode === 'local' ? <Portrait name={name} seed={path} /> : url ? <img className="profile-photo" src={url} alt={`Photo de ${name}`} /> : <span className="photo-placeholder">Photo indisponible</span>;
}
