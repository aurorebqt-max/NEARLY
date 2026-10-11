import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type Webhook = {
  type?: string;
  table?: string;
  schema?: string;
  record?: Record<string, unknown>;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async request => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const webhookSecret = Deno.env.get('PUSH_WEBHOOK_SECRET');
  if (!webhookSecret || request.headers.get('x-nearly-webhook-secret') !== webhookSecret) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const backendUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!backendUrl || !serviceKey) return json({ error: 'Push service is not configured' }, 500);

  let event: Webhook;
  try {
    event = await request.json();
  } catch {
    return json({ error: 'Invalid webhook payload' }, 400);
  }
  if (event.schema !== 'public' || event.type !== 'INSERT' || !event.record) return json({ ignored: true });

  const db = createClient(backendUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const record = event.record;
  let recipients: string[];
  let participants: string[];
  let title = 'Nearly';
  let body = '';
  let kind = '';
  let conversationId: string | undefined;

  if (event.table === 'hearts' && typeof record.sender_id === 'string' &&
      typeof record.receiver_id === 'string' && record.withdrawn_at == null) {
    recipients = [record.receiver_id];
    participants = [String(record.sender_id), record.receiver_id];
    title = 'Un cœur pour vous';
    body = 'Une nouvelle attention vous attend.';
    kind = 'heart';
  } else if (event.table === 'matches' && typeof record.user_a === 'string' && typeof record.user_b === 'string') {
    recipients = [record.user_a, record.user_b];
    participants = recipients;
    title = 'C’est réciproque';
    body = 'Vous avez un nouveau match.';
    kind = 'match';
    const { data } = await db.from('conversations').select('id').eq('match_id', String(record.id)).maybeSingle();
    if (data?.id) conversationId = data.id;
  } else if (event.table === 'messages' && typeof record.conversation_id === 'string' && typeof record.sender_id === 'string') {
    const { data: conversation } = await db.from('conversations').select('match_id').eq('id', record.conversation_id).maybeSingle();
    if (!conversation) return json({ ignored: true });
    const { data: match } = await db.from('matches').select('user_a,user_b,state').eq('id', conversation.match_id).maybeSingle();
    if (!match || match.state !== 'active') return json({ ignored: true });
    recipients = [match.user_a, match.user_b].filter(id => id !== record.sender_id);
    participants = [match.user_a, match.user_b];
    title = 'Nouveau message';
    body = 'Un nouveau message vous attend.';
    kind = 'message';
    conversationId = String(record.conversation_id);
  } else {
    return json({ ignored: true });
  }

  const [blockedBy, blocking] = await Promise.all([
    db.from('blocks').select('blocker_id,blocked_id').in('blocker_id', participants),
    db.from('blocks').select('blocker_id,blocked_id').in('blocked_id', participants),
  ]);
  if (blockedBy.error || blocking.error) return json({ error: 'Unable to verify notification privacy' }, 500);
  const blockedPairs = [...(blockedBy.data ?? []), ...(blocking.data ?? [])];
  recipients = recipients.filter(id =>
    !blockedPairs.some(pair => pair.blocker_id === id || pair.blocked_id === id));
  if (!recipients.length) return json({ sent: 0 });

  const { data: devices, error: tokenError } = await db.from('device_push_tokens')
    .select('id,push_token')
    .in('user_id', recipients);
  if (tokenError) return json({ error: 'Unable to load notification devices' }, 500);
  if (!devices?.length) return json({ sent: 0 });

  const messages = devices.map(device => ({
    to: device.push_token,
    title,
    body,
    sound: 'default',
    channelId: 'nearly',
    data: { kind, ...(conversationId ? { conversationId } : {}) },
  }));
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(messages),
  });
  if (!response.ok) return json({ error: 'Push provider request failed' }, 502);

  const result = await response.json();
  const tickets = Array.isArray(result.data) ? result.data : [result.data];
  const expired = devices.filter((_, index) =>
    tickets[index]?.details?.error === 'DeviceNotRegistered').map(device => device.id);
  if (expired.length) {
    const { error: cleanupError } = await db.from('device_push_tokens').delete().in('id', expired);
    if (cleanupError) return json({ error: 'Unable to remove invalid notification devices' }, 500);
  }
  return json({ sent: messages.length });
});
