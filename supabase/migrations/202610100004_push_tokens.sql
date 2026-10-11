create table public.device_push_tokens (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles on delete cascade,
 installation_id uuid not null,
 push_token text not null unique check(length(push_token) between 16 and 512 and (push_token like 'ExpoPushToken[%]' or push_token like 'ExponentPushToken[%]')),
 platform text not null check(platform in ('ios','android')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,installation_id)
);
alter table public.device_push_tokens enable row level security;
revoke all on public.device_push_tokens from anon,authenticated;

create function public.register_push_token(installation uuid,push_token text,device_platform text)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if installation is null or length(push_token) not between 16 and 512
   or (push_token not like 'ExpoPushToken[%]' and push_token not like 'ExponentPushToken[%]')
   or device_platform not in ('ios','android') then raise exception 'Invalid push device'; end if;
 delete from public.device_push_tokens where device_push_tokens.push_token=register_push_token.push_token and user_id<>uid;
 insert into public.device_push_tokens(user_id,installation_id,push_token,platform)
 values(uid,installation,push_token,device_platform)
 on conflict(user_id,installation_id) do update set push_token=excluded.push_token,platform=excluded.platform,updated_at=now();
end $$;

create function public.unregister_push_device(installation uuid)
returns void language sql security definer set search_path='' as $$
 delete from public.device_push_tokens where user_id=auth.uid() and installation_id=unregister_push_device.installation
$$;

revoke execute on function public.register_push_token(uuid,text,text),public.unregister_push_device(uuid) from public,anon;
grant execute on function public.register_push_token(uuid,text,text),public.unregister_push_device(uuid) to authenticated;
