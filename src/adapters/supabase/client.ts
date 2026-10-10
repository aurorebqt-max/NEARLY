import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
export const supabaseConfigured = Boolean(url && key);
export function createSupabaseClient() {
  if (!url || !key) throw new Error('Configurez VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY dans .env.local.');
  if (key.startsWith('sb_secret_')) throw new Error('Une clé secrète ne doit jamais être utilisée dans le navigateur.');
  if (key.split('.').length === 3) {
    try { if (JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role === 'service_role') throw new Error('Clé service_role interdite dans le navigateur.'); } catch (e) { if (e instanceof Error && e.message.includes('interdite')) throw e; }
  }
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'nearly.supabase.auth' } });
}
