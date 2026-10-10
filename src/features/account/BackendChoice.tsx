import { useStore } from '../../state/store';
import { supabaseConfigured } from '../../adapters/supabase/client';
export function BackendChoice() {
  const { mode, setMode, backend } = useStore();
  return <div className="backend-choice"><p className="screen-note">{mode === 'local' ? 'Mode démo · données fictives isolées' : 'Mode Supabase · compte et données persistants'}</p>{mode === 'local' ? <button type="button" className="outline-button" disabled={!supabaseConfigured} onClick={() => setMode('supabase')}>Utiliser le backend réel</button> : <button type="button" className="outline-button" onClick={async () => { if (backend) await backend.signOut(); setMode('local'); }}>Revenir à la démo isolée</button>}</div>;
}
