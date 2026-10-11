create function private.dispatch_nearly_push()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
 endpoint text;
 webhook_secret text;
begin
 select decrypted_secret into endpoint
 from vault.decrypted_secrets where name='nearly_push_function_url';
 select decrypted_secret into webhook_secret
 from vault.decrypted_secrets where name='nearly_push_webhook_secret';

 if coalesce(endpoint,'')='' or coalesce(webhook_secret,'')='' then
   raise warning 'Nearly push dispatch is disabled: add the two Nearly push secrets to Supabase Vault';
   return new;
 end if;

 perform net.http_post(
   url:=endpoint,
   headers:=jsonb_build_object(
     'Content-Type','application/json',
     'x-nearly-webhook-secret',webhook_secret
   ),
   body:=jsonb_build_object(
     'type',tg_op,
     'schema',tg_table_schema,
     'table',tg_table_name,
     'record',to_jsonb(new)
   )
 );
 return new;
end
$$;

revoke all on function private.dispatch_nearly_push() from public,anon,authenticated;
create trigger nearly_push_new_heart
after insert on public.hearts
for each row execute function private.dispatch_nearly_push();
create trigger nearly_push_new_match
after insert on public.matches
for each row execute function private.dispatch_nearly_push();
create trigger nearly_push_new_message
after insert on public.messages
for each row execute function private.dispatch_nearly_push();
