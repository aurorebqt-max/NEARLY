import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppCommand } from '../../domain/commands';
import type { LocalState } from '../../domain/models';
export class SupabaseBackend {
  constructor(readonly client: SupabaseClient) {}
  async rpc(name: string, args?: Record<string, unknown>) {
    const { data, error } = await this.client.rpc(name, args);
    if (error) throw new Error(error.message);
    return data;
  }
  async snapshot(): Promise<LocalState> { return await this.rpc('nearly_snapshot') as LocalState; }
  async execute(c: AppCommand) {
    switch (c.type) {
      case 'profile.save':
        await this.rpc('save_profile', { p: c.profile });
        if (c.genders !== undefined) { const s = await this.snapshot(); await this.rpc('save_preferences', { p: { ...s.preferences[s.active], genders: c.genders } }); }
        break;
      case 'preferences.save': await this.rpc('save_preferences', { p: c.preferences }); break;
      case 'visibility.set': await this.rpc('set_visibility', { radar_enabled: c.radar, invisible_enabled: c.invisible }); break;
      case 'encounter.reveal': await this.rpc('reveal_encounter', { encounter_id: c.id }); break;
      case 'heart.send': await this.rpc('send_heart', { recipient: c.to }); break;
      case 'heart.read': await this.rpc('read_heart', { heart_id: c.id }); break;
      case 'heart.withdraw': await this.rpc('withdraw_heart', { heart_id: c.id }); break;
      case 'message.send': await this.rpc('send_message', { conversation: c.conversation, body: c.text, request: c.requestId }); break;
      case 'messages.read': await this.rpc('read_messages', { conversation: c.conversation }); break;
      case 'block.add': case 'block.remove': await this.rpc('set_block', { target: c.to, enabled: c.type === 'block.add' }); break;
      case 'report.add': await this.rpc('report_profile', { target: c.to, reason: c.reason }); break;
      case 'verification.simulate': await this.rpc('simulate_verification'); break;
      case 'profile.delete': throw new Error('Suppression du compte distant : contactez l’administrateur. La suppression locale ne s’applique pas au backend.');
    }
  }
  async signIn(email: string, password: string) {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Connexion impossible. Vérifiez vos identifiants et la confirmation de votre e-mail.');
  }
  async signUp(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/#/connexion' } });
    if (error) throw new Error(error.message);
    return data.session ? 'Compte créé.' : 'Consultez votre e-mail pour confirmer votre compte, puis connectez-vous.';
  }
  async signOut() { const { error } = await this.client.auth.signOut(); if (error) throw new Error(error.message); }
}
