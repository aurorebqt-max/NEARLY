import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { webcrypto as crypto } from 'node:crypto';
import console from 'node:console';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
// Local-only integration suite. Never accepts a remote URL or prints credentials.
const status = JSON.parse(execFileSync('npx', ['supabase', 'status', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
const tables = ['profiles', 'profile_photos', 'preferences', 'physical_traits', 'interests', 'personality_preferences', 'encounters', 'hearts', 'matches', 'conversations', 'messages', 'blocks', 'reports', 'verification_requests'];
const schema = JSON.parse(execFileSync('docker', ['exec', 'supabase_db_FREYMO', 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-c', `
  select json_build_object(
    'migrations', (select json_agg(version order by version) from supabase_migrations.schema_migrations),
    'tables', (select json_object_agg(c.relname, c.relrowsecurity) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),
    'policies', (select json_agg(distinct tablename) from pg_policies where schemaname='public')
  );`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
for (const version of ['202610100001', '202610100002']) assert.ok(schema.migrations.includes(version), `Migration ${version} applied`);
for (const table of tables) {
  assert.equal(schema.tables[table], true, `RLS enabled on ${table}`);
  assert.ok(schema.policies.includes(table), `Policy exists on ${table}`);
}
console.log('PASS applied migrations, 14 tables with RLS and policies');
const url = status.API_URL;
assert.match(url, /^http:\/\/(127\.0\.0\.1|localhost):54321$/);
const publicKey = status.ANON_KEY || status.PUBLISHABLE_KEY;
const admin = createClient(url, status.SERVICE_ROLE_KEY || status.SECRET_KEY, { auth: { persistSession: false } });
const users = []; const clients = [];
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aM2sAAAAASUVORK5CYII=', 'base64');
async function ok(query) { const r = await query; if (r.error) throw new Error(r.error.message); return r.data; }
async function denied(query) { const r = await query; assert.ok(r.error || r.data?.length === 0, 'Unauthorized operation must fail or return no rows'); }
async function snapshot(client) { return await ok(client.rpc('nearly_snapshot')); }
const preferences = { ageRange: [18,99], genders: ['Homme'], intentions: [], physical: { traits: {}, weight: 1 }, interests: { values: ['Nature'], weight: 1 }, personality: { values: ['Calme'], weight: 1 }, portraits: [] };
try {
  for (let i=0; i<3; i++) {
    const email = `nearly-integration-${crypto.randomUUID()}@example.test`; const password = crypto.randomUUID()+'Aa9!';
    const created = await ok(admin.auth.admin.createUser({ email, password, email_confirm: true })); users.push(created.user.id);
    const client = createClient(url, publicKey, { auth: { persistSession: false } }); clients.push(client);
    await denied(client.auth.signInWithPassword({ email, password: 'invalid-password' }));
    await ok(client.auth.signInWithPassword({ email, password }));
    const own = await snapshot(client); assert.equal(own.active, created.user.id); assert.equal(own.profiles.length, 1); assert.equal(own.hearts.length, 0); assert.equal(own.profiles[0].radar, false);
    const session = (await client.auth.getSession()).data.session;
    await ok(client.auth.signOut()); await denied(client.rpc('nearly_snapshot'));
    await ok(client.auth.signInWithPassword({ email, password }));
    assert.ok(session.user.id === created.user.id);
    const path = `${created.user.id}/${crypto.randomUUID()}.png`;
    await ok(client.storage.from('profile-photos').upload(path, png, { contentType: 'image/png' }));
    await ok(client.rpc('register_photo', { path }));
    await ok(client.rpc('save_profile', { p: { name: `Test ${i}`, birthDate: '1995-04-01', bio: 'Persistant', gender: 'Homme', intention: 'Faire connaissance', personality: ['Calme'], traits: { hair: 'Bruns' }, interests: ['Nature'], verified: true } }));
    await ok(client.rpc('save_preferences', { p: preferences }));
    const persisted = await snapshot(client);
    assert.equal(persisted.profiles[0].verified, false);
    assert.equal(persisted.profiles[0].name, `Test ${i}`);
    assert.equal(persisted.profiles[0].birthDate, '1995-04-01');
    assert.deepEqual(persisted.profiles[0].photos, [path]);
    assert.deepEqual(persisted.preferences[created.user.id], preferences);
    await denied(client.rpc('remove_photo', { path }));
    await denied(client.rpc('save_preferences', { p: { ...preferences, ageRange: [10, 99] } }));
    await denied(client.rpc('save_profile', { p: { name: 'Child', birthDate: '2020-01-01', intention: 'Test' } }));
    await ok(client.auth.signOut());
    await ok(client.auth.signInWithPassword({ email, password }));
    assert.deepEqual((await snapshot(client)).preferences[created.user.id], preferences);
  }
  const signupClient = createClient(url, publicKey, { auth: { persistSession: false } });
  const signedUp = await ok(signupClient.auth.signUp({ email: `nearly-signup-${crypto.randomUUID()}@example.test`, password: crypto.randomUUID() + 'Aa9!' }));
  assert.ok(signedUp.user); users.push(signedUp.user.id);
  assert.ok(signedUp.session, 'Local Auth uses email confirmations disabled');
  assert.equal((await snapshot(signupClient)).profiles.length, 1);
  await ok(signupClient.auth.signOut());
  console.log('PASS Auth signup/signin, profile, preferences, private uploads, no fixture contamination');
  const [a,b,c] = clients; const [aid,bid,cid] = users;
  assert.equal((await ok(b.from('profiles').select('*'))).length,1);
  assert.equal((await ok(b.from('preferences').select('*'))).length,1);
  await denied(b.from('profiles').update({ bio: 'stolen' }).eq('id',aid));
  await denied(a.from('matches').insert({ user_a: [aid,bid].sort()[0], user_b: [aid,bid].sort()[1] }));
  await denied(a.from('conversations').insert({ match_id: crypto.randomUUID() }));
  await denied(c.rpc('send_heart', { recipient: aid }));
  await denied(c.rpc('send_message', { conversation: crypto.randomUUID(), body: 'no', request: crypto.randomUUID() }));
  const aphoto = (await snapshot(a)).profiles[0].photos[0];
  await denied(c.storage.from('profile-photos').download(aphoto));
  await denied(c.storage.from('profile-photos').upload(`${aid}/illegal.png`, png, { contentType: 'image/png' }));
  console.log('PASS RLS profiles/preferences/photos, no client-created matches or conversations');
  // Trusted test fixture only: clients cannot manufacture a crossing.
  const events = await ok(admin.from('encounters').insert([{ source_id: aid, recipient_id: bid },{ source_id: bid, recipient_id: aid }]).select('id,recipient_id'));
  const before = await snapshot(b); assert.equal(before.suggestions[0].from,''); assert.equal(before.profiles.length,1);
  await denied(b.from('encounters').select('source_id'));
  for (const event of events) await ok((event.recipient_id===aid?a:b).rpc('reveal_encounter', { encounter_id: event.id }));
  const revealed = await snapshot(b); const peer = revealed.profiles.find(p=>p.id===aid); assert.equal(peer.birthDate,''); assert.ok(peer.age>=18); assert.deepEqual(Object.keys(revealed.preferences),[bid]);
  await ok(b.storage.from('profile-photos').download(aphoto));
  await Promise.all(Array.from({length:8},(_,i)=>ok((i%2?a:b).rpc('send_heart',{recipient:i%2?bid:aid}))));
  const matches = await ok(admin.from('matches').select('*').or(`user_a.eq.${aid},user_b.eq.${aid}`)); assert.equal(matches.length,1);
  const conversations = await ok(a.from('conversations').select('*')); assert.equal(conversations.length,1); const conversation = conversations[0].id;
  await denied(c.from('messages').select('*').eq('conversation_id',conversation));
  const beforeMessages = await snapshot(b); const heartsUnread = beforeMessages.hearts.filter(h=>h.to===bid&&!h.read).length;
  const request = crypto.randomUUID(); await Promise.all([1,2].map(()=>ok(a.rpc('send_message',{conversation,body:'Bonjour persistant',request}))));
  let sb = await snapshot(b); assert.equal(sb.conversations[0].messages.length,1); assert.equal(sb.conversations[0].messages.filter(m=>m.from!==bid&&!m.read).length,1); assert.equal(sb.hearts.filter(h=>h.to===bid&&!h.read).length,heartsUnread);
  await ok(b.rpc('read_messages',{conversation})); sb=await snapshot(b); assert.equal(sb.conversations[0].messages.filter(m=>!m.read).length,0); assert.equal(sb.hearts.filter(h=>h.to===bid&&!h.read).length,heartsUnread);
  await ok(b.rpc('read_heart',{heart_id:sb.hearts.find(h=>h.to===bid).id})); assert.equal((await snapshot(b)).hearts.filter(h=>h.to===bid&&!h.read).length,0);
  console.log('PASS concurrent reciprocal hearts, unique match/conversation, idempotent message, separate counters');
  await ok(a.rpc('report_profile',{target:bid,reason:'Integration test'})); assert.equal((await ok(b.from('reports').select('*'))).length,0);
  await ok(a.rpc('set_block',{target:bid,enabled:true}));
  assert.equal((await snapshot(b)).conversations.length,0);
  await denied(b.rpc('send_message',{conversation,body:'blocked',request:crypto.randomUUID()})); await denied(b.rpc('send_heart',{recipient:aid})); await denied(b.storage.from('profile-photos').download(aphoto));
  assert.equal((await ok(b.from('blocks').select('*'))).length,0);
  await ok(a.rpc('set_block',{target:bid,enabled:false})); assert.equal((await snapshot(a)).conversations.length,1); assert.equal((await snapshot(a)).suggestions.length,0);
  await ok(a.rpc('simulate_verification')); assert.equal((await snapshot(a)).profiles.find(p=>p.id===aid).verified,false); assert.equal((await snapshot(a)).profiles.find(p=>p.id===aid).verificationSimulated,true);
  assert.ok(cid);
  console.log('PASS persistent block/unblock/report, revocation and simulated verification without trusted badge');
} finally {
  for (let i=0;i<users.length;i++) {
    const files = await admin.storage.from('profile-photos').list(users[i]);
    if (files.data?.length) await admin.storage.from('profile-photos').remove(files.data.map(f=>`${users[i]}/${f.name}`));
    await admin.auth.admin.deleteUser(users[i]);
  }
}
console.log('Supabase integration suite passed. Test accounts and photos cleaned up.');
