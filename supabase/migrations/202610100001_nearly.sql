-- Nearly sprint 2. No proximity coordinates, no biometric data.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 first_name text not null default '' check (length(first_name)<=40),
 birth_date date, bio text not null default '' check(length(bio)<=500),
 gender text not null default '', intention text not null default '', personality text[] not null default '{}',
 verified boolean not null default false, verification_simulated boolean not null default false,
 radar boolean not null default false, invisible boolean not null default false, onboarded boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.profile_photos (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade,
 object_path text not null unique, position integer not null check(position between 0 and 5), created_at timestamptz not null default now(),
 unique(user_id,position)
);
create table public.preferences (
 user_id uuid primary key references public.profiles on delete cascade,
 age_min integer not null default 18 check(age_min>=18), age_max integer not null default 99 check(age_max<=120 and age_max>=age_min),
 genders text[], intentions text[] not null default '{}', physical jsonb not null default '{"traits":{},"weight":1}',
 interest_preferences jsonb not null default '{"values":[],"weight":1}', portraits text[] not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.physical_traits (user_id uuid primary key references public.profiles on delete cascade, traits jsonb not null default '{}', updated_at timestamptz not null default now());
create table public.interests (user_id uuid primary key references public.profiles on delete cascade, values text[] not null default '{}', updated_at timestamptz not null default now());
create table public.personality_preferences (user_id uuid primary key references public.profiles on delete cascade, values text[] not null default '{}', weight numeric not null default 1 check(weight between 0 and 3), updated_at timestamptz not null default now());
create table public.encounters (
 id uuid primary key default gen_random_uuid(), source_id uuid not null references public.profiles on delete cascade,
 recipient_id uuid not null references public.profiles on delete cascade,
 created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '24 hours',
 state text not null default 'available' check(state in ('available','revoked','expired')), revealed_at timestamptz,
 check(source_id<>recipient_id), check(expires_at>created_at)
);
create index encounters_recipient on public.encounters(recipient_id,expires_at);
create table public.hearts (
 id uuid primary key default gen_random_uuid(), sender_id uuid not null references public.profiles on delete cascade,
 receiver_id uuid not null references public.profiles on delete cascade, created_at timestamptz not null default now(),
 read_at timestamptz, withdrawn_at timestamptz, check(sender_id<>receiver_id), unique(sender_id,receiver_id)
);
create index hearts_receiver on public.hearts(receiver_id);
create table public.matches (
 id uuid primary key default gen_random_uuid(), user_a uuid not null references public.profiles on delete cascade,
 user_b uuid not null references public.profiles on delete cascade, created_at timestamptz not null default now(),
 state text not null default 'active' check(state in ('active','closed')), check(user_a<user_b), unique(user_a,user_b)
);
create table public.conversations (id uuid primary key default gen_random_uuid(), match_id uuid not null unique references public.matches on delete cascade, created_at timestamptz not null default now());
create table public.messages (
 id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations on delete cascade,
 sender_id uuid not null references public.profiles on delete cascade, body text not null check(length(trim(body)) between 1 and 2000),
 request_id uuid not null, created_at timestamptz not null default now(), read_at timestamptz, unique(sender_id,request_id)
);
create index messages_conversation on public.messages(conversation_id,created_at);
create table public.blocks (
 blocker_id uuid not null references public.profiles on delete cascade, blocked_id uuid not null references public.profiles on delete cascade,
 created_at timestamptz not null default now(), primary key(blocker_id,blocked_id), check(blocker_id<>blocked_id)
);
create table public.reports (id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles on delete cascade, reported_id uuid not null references public.profiles on delete cascade, reason text not null check(length(trim(reason)) between 1 and 500), created_at timestamptz not null default now(), state text not null default 'pending', check(reporter_id<>reported_id));
create table public.verification_requests (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade, simulated boolean not null default true check(simulated), state text not null default 'simulated_success' check(state in ('simulated_success','simulated_failure','pending')), created_at timestamptz not null default now());

create function private.is_blocked(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.blocks where (blocker_id=a and blocked_id=b) or (blocker_id=b and blocked_id=a)) $$;
create function private.pair_lock(a uuid,b uuid) returns void language sql security definer set search_path='' as $$ select pg_advisory_xact_lock(hashtextextended(least(a,b)::text||greatest(a,b)::text,0)) $$;
create function private.can_chat(cid uuid, uid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.conversations c join public.matches m on m.id=c.match_id where c.id=cid and uid in (m.user_a,m.user_b) and m.state='active' and not private.is_blocked(m.user_a,m.user_b))
$$;
create function private.can_view(target uuid, viewer uuid) returns boolean language sql stable security definer set search_path='' as $$
 select target=viewer or (viewer is not null and not private.is_blocked(target,viewer) and (
 exists(select 1 from public.hearts h where h.withdrawn_at is null and ((h.sender_id=target and h.receiver_id=viewer) or (h.sender_id=viewer and h.receiver_id=target)))
 or exists(select 1 from public.matches m where m.state='active' and least(target,viewer)=m.user_a and greatest(target,viewer)=m.user_b)
 or exists(select 1 from public.encounters e join public.profiles p on p.id=e.source_id where e.source_id=target and e.recipient_id=viewer and e.revealed_at is not null and e.state='available' and e.expires_at>now() and not p.invisible)))
$$;

-- RLS is enabled even on tables whose mutations are exclusively RPC-authorized.
do $$ declare t text; begin
 foreach t in array array['profiles','profile_photos','preferences','physical_traits','interests','personality_preferences','encounters','hearts','matches','conversations','messages','blocks','reports','verification_requests'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 end loop;
end $$;
create policy profiles_own on public.profiles for select to authenticated using(id=auth.uid());
create policy photos_authorized on public.profile_photos for select to authenticated using(private.can_view(user_id,auth.uid()));
create policy preferences_own on public.preferences for select to authenticated using(user_id=auth.uid());
create policy traits_own on public.physical_traits for select to authenticated using(user_id=auth.uid());
create policy interests_own on public.interests for select to authenticated using(user_id=auth.uid());
create policy personality_own on public.personality_preferences for select to authenticated using(user_id=auth.uid());
create policy encounters_recipient on public.encounters for select to authenticated using(recipient_id=auth.uid() and state='available' and expires_at>now() and not private.is_blocked(source_id,recipient_id));
create policy hearts_participant on public.hearts for select to authenticated using(auth.uid() in(sender_id,receiver_id) and not private.is_blocked(sender_id,receiver_id));
create policy matches_participant on public.matches for select to authenticated using(auth.uid() in(user_a,user_b) and not private.is_blocked(user_a,user_b));
create policy conversations_member on public.conversations for select to authenticated using(private.can_chat(id,auth.uid()));
create policy messages_member on public.messages for select to authenticated using(private.can_chat(conversation_id,auth.uid()));
create policy blocks_own on public.blocks for select to authenticated using(blocker_id=auth.uid());
create policy reports_own on public.reports for select to authenticated using(reporter_id=auth.uid());
create policy verification_own on public.verification_requests for select to authenticated using(user_id=auth.uid());
grant select on public.profiles,public.profile_photos,public.preferences,public.physical_traits,public.interests,public.personality_preferences,public.hearts,public.matches,public.conversations,public.messages,public.blocks,public.reports,public.verification_requests to authenticated;
-- No direct SELECT grant on encounters: source identity is hidden until an explicit reveal.

create function private.new_user() returns trigger language plpgsql security definer set search_path='' as $$ begin
 insert into public.profiles(id) values(new.id);
 insert into public.preferences(user_id) values(new.id);
 insert into public.physical_traits(user_id) values(new.id);
 insert into public.interests(user_id) values(new.id);
 insert into public.personality_preferences(user_id) values(new.id);
 return new; end $$;
create trigger nearly_new_user after insert on auth.users for each row execute function private.new_user();

create function public.save_profile(p jsonb) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); dob date; n integer; begin
 if uid is null then raise exception 'Authentication required'; end if;
 perform 1 from public.profiles where id=uid for update;
 dob:=(p->>'birthDate')::date;
 if dob is null or dob>current_date-interval '18 years' or dob<current_date-interval '120 years' then raise exception 'Adult birth date required'; end if;
 if length(trim(p->>'name')) not between 1 and 40 or coalesce(p->>'intention','')='' then raise exception 'Incomplete profile'; end if;
 select count(*) into n from public.profile_photos where user_id=uid;
 if n not between 1 and 6 then raise exception 'One to six photos required'; end if;
 update public.profiles set first_name=trim(p->>'name'),birth_date=dob,bio=coalesce(p->>'bio',''),gender=coalesce(p->>'gender',''),intention=p->>'intention',personality=array(select jsonb_array_elements_text(p->'personality')),onboarded=true,updated_at=now() where id=uid;
 update public.physical_traits set traits=coalesce(p->'traits','{}'),updated_at=now() where user_id=uid;
 update public.interests set values=array(select jsonb_array_elements_text(p->'interests')),updated_at=now() where user_id=uid;
end $$;
create function public.save_preferences(p jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if jsonb_typeof(p->'physical'->'traits')<>'object' or jsonb_typeof(p->'interests'->'values')<>'array' or (p->'physical'->>'weight')::numeric not between 0 and 3 or (p->'interests'->>'weight')::numeric not between 0 and 3 then raise exception 'Invalid preferences'; end if;
 update public.preferences set age_min=(p->'ageRange'->>0)::int,age_max=(p->'ageRange'->>1)::int,
 genders=case when jsonb_typeof(p->'genders')='array' then array(select jsonb_array_elements_text(p->'genders')) else null end,
 intentions=array(select jsonb_array_elements_text(p->'intentions')),physical=p->'physical',interest_preferences=p->'interests',portraits=array(select jsonb_array_elements_text(p->'portraits')),updated_at=now() where user_id=auth.uid();
 update public.personality_preferences set values=array(select jsonb_array_elements_text(p->'personality'->'values')),weight=(p->'personality'->>'weight')::numeric,updated_at=now() where user_id=auth.uid();
end $$;
create function public.set_visibility(radar_enabled boolean,invisible_enabled boolean) returns void language plpgsql security definer set search_path='' as $$ begin
 update public.profiles set radar=radar_enabled,invisible=invisible_enabled,updated_at=now() where id=auth.uid();
 if invisible_enabled then update public.encounters set state='revoked' where source_id=auth.uid() and state='available'; end if;
end $$;
create function public.reveal_encounter(encounter_id uuid) returns void language plpgsql security definer set search_path='' as $$ begin
 update public.encounters e set revealed_at=now() from public.profiles p where e.id=encounter_id and e.recipient_id=auth.uid() and e.source_id=p.id and not p.invisible and e.state='available' and e.expires_at>now() and not private.is_blocked(e.source_id,e.recipient_id);
 if not found then raise exception 'Encounter unavailable'; end if;
end $$;

create function public.send_heart(recipient uuid) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); mid uuid; begin
 if uid is null or uid=recipient then raise exception 'Invalid recipient'; end if;
 perform private.pair_lock(uid,recipient);
 if private.is_blocked(uid,recipient) then raise exception 'Interaction unavailable'; end if;
 if not exists(select 1 from public.profiles where id=uid and onboarded) then raise exception 'Complete your profile'; end if;
 if not exists(select 1 from public.encounters e join public.profiles p on p.id=e.source_id where source_id=recipient and recipient_id=uid and state='available' and expires_at>now() and revealed_at is not null and not p.invisible)
 and not exists(select 1 from public.hearts where sender_id=recipient and receiver_id=uid and withdrawn_at is null) then raise exception 'No authorized encounter or heart'; end if;
 insert into public.hearts(sender_id,receiver_id) values(uid,recipient) on conflict(sender_id,receiver_id) do update set withdrawn_at=null,read_at=case when hearts.withdrawn_at is not null then null else hearts.read_at end;
 if exists(select 1 from public.hearts where sender_id=recipient and receiver_id=uid and withdrawn_at is null) then
 insert into public.matches(user_a,user_b) values(least(uid,recipient),greatest(uid,recipient)) on conflict(user_a,user_b) do nothing;
 select id into mid from public.matches where user_a=least(uid,recipient) and user_b=greatest(uid,recipient);
 insert into public.conversations(match_id) values(mid) on conflict(match_id) do nothing;
 end if;
end $$;
create function public.read_heart(heart_id uuid) returns void language sql security definer set search_path='' as $$ update public.hearts set read_at=coalesce(read_at,now()) where id=heart_id and receiver_id=auth.uid() and not private.is_blocked(sender_id,receiver_id) $$;
create function public.withdraw_heart(heart_id uuid) returns void language plpgsql security definer set search_path='' as $$ declare h public.hearts; begin
 select * into h from public.hearts where id=heart_id and sender_id=auth.uid(); if not found then raise exception 'Heart unavailable'; end if;
 perform private.pair_lock(h.sender_id,h.receiver_id);
 if exists(select 1 from public.matches where user_a=least(h.sender_id,h.receiver_id) and user_b=greatest(h.sender_id,h.receiver_id)) then raise exception 'Withdrawal after match is not defined'; end if;
 update public.hearts set withdrawn_at=now() where id=heart_id;
end $$;
create function public.send_message(conversation uuid, body text, request uuid) returns void language plpgsql security definer set search_path='' as $$ declare a uuid;b uuid; begin
 select m.user_a,m.user_b into a,b from public.conversations c join public.matches m on m.id=c.match_id where c.id=conversation;
 if a is null then raise exception 'Conversation unavailable'; end if;
 perform private.pair_lock(a,b);
 if not private.can_chat(conversation,auth.uid()) then raise exception 'Conversation unavailable'; end if;
 insert into public.messages(conversation_id,sender_id,body,request_id) values(conversation,auth.uid(),trim(body),request) on conflict(sender_id,request_id) do nothing;
end $$;
create function public.read_messages(conversation uuid) returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.can_chat(conversation,auth.uid()) then raise exception 'Conversation unavailable'; end if;
 update public.messages set read_at=coalesce(read_at,now()) where conversation_id=conversation and sender_id<>auth.uid();
end $$;
create function public.set_block(target uuid, enabled boolean) returns void language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null or auth.uid()=target then raise exception 'Invalid target'; end if;
 perform private.pair_lock(auth.uid(),target);
 if enabled then
 insert into public.blocks(blocker_id,blocked_id) values(auth.uid(),target) on conflict do nothing;
 update public.encounters set state='revoked' where (source_id=target and recipient_id=auth.uid()) or (source_id=auth.uid() and recipient_id=target);
 else delete from public.blocks where blocker_id=auth.uid() and blocked_id=target; end if;
end $$;
create function public.report_profile(target uuid, reason text) returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.can_view(target,auth.uid()) then raise exception 'Profile unavailable'; end if;
 insert into public.reports(reporter_id,reported_id,reason) values(auth.uid(),target,reason);
end $$;
create function public.simulate_verification() returns void language plpgsql security definer set search_path='' as $$ begin
 insert into public.verification_requests(user_id) values(auth.uid());
 update public.profiles set verification_simulated=true,updated_at=now() where id=auth.uid();
 -- The actual verified flag is NEVER self-assigned.
end $$;

-- Authorized projection: own date of birth only; peers get integer age.
create function private.profile_json(p public.profiles, viewer uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',p.id,'name',p.first_name,'birthDate',case when p.id=viewer then coalesce(p.birth_date::text,'') else '' end,'age',extract(year from age(p.birth_date)),
 'bio',p.bio,'gender',p.gender,'intention',p.intention,'personality',p.personality,'verified',p.verified,'verificationSimulated',p.verification_simulated,
 'radar',case when p.id=viewer then p.radar else false end,'invisible',case when p.id=viewer then p.invisible else false end,'onboarded',p.onboarded,
 'photos',coalesce((select jsonb_agg(object_path order by position) from public.profile_photos where user_id=p.id),'[]'),
 'traits',coalesce((select traits from public.physical_traits where user_id=p.id),'{}'),'interests',coalesce((select to_jsonb(values) from public.interests where user_id=p.id),'[]'))
$$;
create function public.nearly_snapshot() returns jsonb language plpgsql stable security definer set search_path='' as $$ declare uid uuid:=auth.uid(); prefs jsonb; begin
 if uid is null then raise exception 'Authentication required'; end if;
 select jsonb_build_object('ageRange',jsonb_build_array(p.age_min,p.age_max),'genders',p.genders,'intentions',p.intentions,'physical',p.physical,'interests',p.interest_preferences,'personality',jsonb_build_object('values',pp.values,'weight',pp.weight),'portraits',p.portraits) into prefs from public.preferences p join public.personality_preferences pp on pp.user_id=p.user_id where p.user_id=uid;
 return jsonb_build_object('version',1,'active',uid,'accounts','{}'::jsonb,
 'profiles',coalesce((select jsonb_agg(private.profile_json(p,uid)) from public.profiles p where private.can_view(p.id,uid)),'[]'),
 'preferences',jsonb_build_object(uid::text,prefs),
 'suggestions',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'from',case when e.revealed_at is not null then e.source_id::text else '' end,'to',uid,'expires',extract(epoch from e.expires_at)*1000,'revoked',false)) from public.encounters e join public.profiles p on p.id=e.source_id where e.recipient_id=uid and e.state='available' and e.expires_at>now() and not p.invisible and not private.is_blocked(e.source_id,uid)),'[]'),
 'hearts',coalesce((select jsonb_agg(jsonb_build_object('id',id,'from',sender_id,'to',receiver_id,'read',read_at is not null)) from public.hearts where uid in(sender_id,receiver_id) and withdrawn_at is null and not private.is_blocked(sender_id,receiver_id)),'[]'),
 'conversations',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'members',jsonb_build_array(m.user_a,m.user_b),'messages',coalesce((select jsonb_agg(jsonb_build_object('id',msg.id,'from',msg.sender_id,'text',msg.body,'at',extract(epoch from msg.created_at)*1000,'read',msg.read_at is not null) order by msg.created_at,msg.id) from public.messages msg where msg.conversation_id=c.id),'[]'))) from public.conversations c join public.matches m on m.id=c.match_id where private.can_chat(c.id,uid)),'[]'),
 'blocks',coalesce((select jsonb_agg(least(blocker_id,blocked_id)::text||':'||greatest(blocker_id,blocked_id)::text) from public.blocks where blocker_id=uid),'[]'),
 'reports',coalesce((select jsonb_agg(jsonb_build_object('from',reporter_id,'to',reported_id,'reason',reason)) from public.reports where reporter_id=uid),'[]'));
end $$;

-- Revoke default function EXECUTE, then expose only authenticated RPCs and RLS helpers.
revoke execute on all functions in schema public from public,anon;
revoke execute on all functions in schema private from public,anon,authenticated;
grant execute on function private.is_blocked(uuid,uuid),private.can_view(uuid,uuid),private.can_chat(uuid,uuid) to authenticated;
grant execute on function public.save_profile(jsonb),public.save_preferences(jsonb),public.set_visibility(boolean,boolean),public.reveal_encounter(uuid),public.send_heart(uuid),public.read_heart(uuid),public.withdraw_heart(uuid),public.send_message(uuid,text,uuid),public.read_messages(uuid),public.set_block(uuid,boolean),public.report_profile(uuid,text),public.simulate_verification(),public.nearly_snapshot() to authenticated;
