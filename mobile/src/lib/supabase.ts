import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { LocalState } from '../../../src/domain/models';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && key && !key.startsWith('sb_secret_'));

export const supabase = supabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export type NearlySnapshot = LocalState;

export async function getSnapshot(): Promise<NearlySnapshot> {
  if (!supabase) throw new Error('La configuration Supabase mobile est absente ou invalide.');
  const { data, error } = await supabase.rpc('nearly_snapshot');
  if (error) throw new Error(error.message);
  return data as NearlySnapshot;
}

export async function callRpc(name: string, args: Record<string, unknown> = {}) {
  if (!supabase) throw new Error('La configuration Supabase mobile est absente ou invalide.');
  const { error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
}
