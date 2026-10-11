import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async request => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer (.+)$/i)?.[1];
  const backendUrl = Deno.env.get('SUPABASE_URL');
  const publicKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!token || !backendUrl || !publicKey || !serviceKey) {
    return json({ error: 'Account deletion is not configured' }, 401);
  }

  const authClient = createClient(backendUrl, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error: authError } = await authClient.auth.getUser(token);
  if (authError || !data.user) return json({ error: 'Authentication required' }, 401);

  const adminClient = createClient(backendUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: photos, error: photoQueryError } = await adminClient.from('profile_photos')
    .select('object_path')
    .eq('user_id', data.user.id);
  if (photoQueryError) return json({ error: 'Unable to prepare account deletion' }, 500);
  const paths = (photos ?? []).map(photo => photo.object_path);
  if (paths.length) {
    const { error: storageError } = await adminClient.storage.from('profile-photos').remove(paths);
    if (storageError) return json({ error: 'Unable to remove private profile photos' }, 500);
  }
  const { error } = await adminClient.auth.admin.deleteUser(data.user.id);
  if (error) return json({ error: 'Unable to delete account' }, 500);
  return json({ deleted: true });
});
