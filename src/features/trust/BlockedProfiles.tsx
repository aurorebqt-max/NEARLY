import { useStore } from '../../state/store';
export function BlockedProfiles() {
  const { state, execute } = useStore();
  return <details><summary>Profils bloqués ({state.blocks.length})</summary>{state.blocks.map(pair => { const id = pair.split(':').find(id => id !== state.active)!; return <div key={pair}><p>{state.profiles.find(p => p.id === id)?.name || 'Profil bloqué'}</p><button type="button" className="outline-button" onClick={() => void execute({ type: 'block.remove', to: id })}>Débloquer ce profil</button></div>; })}<p className="screen-note">Débloquer ne restaure pas les suggestions révoquées. Un blocage réciproque reste actif tant que l’autre personne ne le retire pas.</p></details>;
}
