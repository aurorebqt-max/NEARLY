create table public.proximity_tokens (
 user_id uuid primary key references public.profiles on delete cascade,
 token_hash text not null unique check(token_hash ~ '^[0-9a-f]{64}$'),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 revoked_at timestamptz,
 check(expires_at>created_at)
);

create table public.proximity_events (
 id uuid primary key default gen_random_uuid(),
 client_event_id uuid not null,
 observer_user_id uuid not null references public.profiles on delete cascade,
 encountered_user_id uuid not null references public.profiles on delete cascade,
 token_hash text not null check(token_hash ~ '^[0-9a-f]{64}$'),
 detected_at timestamptz not null default now(),
 rssi smallint not null check(rssi between -127 and 0),
 duration_ms integer not null check(duration_ms between 0 and 3600000),
 observations smallint not null check(observations between 0 and 1000),
 processed_at timestamptz,
 unique(observer_user_id,client_event_id),
 check(observer_user_id<>encountered_user_id)
);
create index proximity_events_rate_limit on public.proximity_events(observer_user_id,detected_at desc);
alter table public.proximity_tokens enable row level security;
alter table public.proximity_events enable row level security;
revoke all on public.proximity_tokens,public.proximity_events from anon,authenticated;

create table private.proximity_config (
 singleton boolean primary key default true check(singleton),
 token_lifetime interval not null default interval '15 minutes',
 minimum_rssi smallint not null default -78 check(minimum_rssi between -127 and 0),
 minimum_observations smallint not null default 3 check(minimum_observations between 1 and 1000),
 minimum_duration_ms integer not null default 5000 check(minimum_duration_ms between 0 and 3600000),
 pair_cooldown interval not null default interval '30 minutes'
);
insert into private.proximity_config(singleton) values(true);
revoke all on private.proximity_config from public,anon,authenticated;

create function private.compatible(preference_owner uuid,candidate_id uuid)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare
 pref public.preferences;
 candidate public.profiles;
 candidate_traits jsonb;
 candidate_interests text[];
 selected_count integer;
 matched_count integer;
 total_weight numeric:=0;
 weighted_score numeric:=0;
 group_weight numeric;
begin
 select * into pref from public.preferences where user_id=preference_owner;
 select * into candidate from public.profiles where id=candidate_id;
 if pref.user_id is null or candidate.id is null or not candidate.onboarded or candidate.birth_date is null
   or pref.genders is null or not candidate.gender=any(pref.genders) then return false; end if;
 if extract(year from age(current_date,candidate.birth_date)) not between pref.age_min and pref.age_max then return false; end if;
 if cardinality(pref.intentions)>0 and not candidate.intention=any(pref.intentions) then return false; end if;
 select traits into candidate_traits from public.physical_traits where user_id=candidate_id;
 select values into candidate_interests from public.interests where user_id=candidate_id;

 group_weight:=coalesce((pref.physical->>'weight')::numeric,0);
 select count(*),count(*) filter(where candidate_traits->>kv.key=kv.value)
 into selected_count,matched_count
 from jsonb_each_text(coalesce(pref.physical->'traits','{}'::jsonb)) kv
 where kv.value<>'';
 if selected_count>0 and group_weight>0 then
   total_weight:=total_weight+group_weight;
   weighted_score:=weighted_score+group_weight*matched_count/selected_count;
 end if;

 group_weight:=coalesce((pref.interest_preferences->>'weight')::numeric,0);
 select count(*),count(*) filter(where selected.value=any(coalesce(candidate_interests,'{}'::text[])))
 into selected_count,matched_count
 from jsonb_array_elements_text(coalesce(pref.interest_preferences->'values','[]'::jsonb)) selected(value);
 if selected_count>0 and group_weight>0 then
   total_weight:=total_weight+group_weight;
   weighted_score:=weighted_score+group_weight*matched_count/selected_count;
 end if;

 group_weight:=coalesce((select weight from public.personality_preferences where user_id=preference_owner),0);
 select count(*),count(*) filter(where selected.value=any(candidate.personality))
 into selected_count,matched_count
 from jsonb_array_elements_text(coalesce((select to_jsonb(values) from public.personality_preferences where user_id=preference_owner),'[]'::jsonb)) selected(value);
 if selected_count>0 and group_weight>0 then
   total_weight:=total_weight+group_weight;
   weighted_score:=weighted_score+group_weight*matched_count/selected_count;
 end if;
 return total_weight=0 or weighted_score/total_weight>=0.5;
end $$;

create function public.issue_proximity_token()
returns text language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); token text; lifetime interval;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from public.profiles where id=uid and radar and not invisible and onboarded) then
   raise exception 'Activate Radar and complete your profile before proximity detection';
 end if;
 select token_lifetime into lifetime from private.proximity_config where singleton;
 token:=replace(gen_random_uuid()::text,'-','');
 insert into public.proximity_tokens(user_id,token_hash,expires_at)
 values(uid,encode(extensions.digest(convert_to(token,'UTF8'),'sha256'),'hex'),now()+lifetime)
 on conflict(user_id) do update set token_hash=excluded.token_hash,created_at=now(),expires_at=excluded.expires_at,revoked_at=null;
 return token;
end $$;

create function public.record_proximity_event(
 detection_id uuid,proximity_token text,observed_rssi smallint,duration_ms integer,observation_count smallint
) returns integer language plpgsql security definer set search_path='' as $$
declare
 observer uuid:=auth.uid(); token_digest text; encountered uuid; config private.proximity_config; created integer:=0;
begin
 if observer is null then raise exception 'Authentication required'; end if;
 if detection_id is null or proximity_token !~ '^[0-9a-fA-F]{32}$'
   or observed_rssi not between -127 and 0 or duration_ms not between 0 and 3600000
   or observation_count not between 0 and 1000 then raise exception 'Invalid proximity event'; end if;
 select * into config from private.proximity_config where singleton;
 if observed_rssi<config.minimum_rssi or duration_ms<config.minimum_duration_ms
   or observation_count<config.minimum_observations then return 0; end if;
 if not exists(select 1 from public.profiles where id=observer and radar and not invisible and onboarded) then
   raise exception 'Radar is not active';
 end if;
 token_digest:=encode(extensions.digest(convert_to(lower(proximity_token),'UTF8'),'sha256'),'hex');
 select user_id into encountered from public.proximity_tokens
 where token_hash=token_digest and expires_at>now() and revoked_at is null;
 if encountered is null or encountered=observer then return 0; end if;
 perform private.pair_lock(observer,encountered);
 if private.is_blocked(observer,encountered)
   or not exists(select 1 from public.profiles where id=encountered and radar and not invisible and onboarded) then return 0; end if;
 if exists(select 1 from public.proximity_events where observer_user_id=observer and detected_at>now()-interval '10 minutes' group by observer_user_id having count(*)>=60) then
   raise exception 'Proximity event rate limit exceeded';
 end if;
 insert into public.proximity_events(client_event_id,observer_user_id,encountered_user_id,token_hash,rssi,duration_ms,observations)
 values(detection_id,observer,encountered,token_digest,observed_rssi,duration_ms,observation_count)
 on conflict(observer_user_id,client_event_id) do nothing;
 if not found then return 0; end if;

 if private.compatible(observer,encountered)
   and not exists(select 1 from public.encounters where source_id=observer and recipient_id=encountered and state='available' and expires_at>now())
   and not exists(select 1 from public.encounters where source_id=observer and recipient_id=encountered and created_at>now()-config.pair_cooldown) then
   insert into public.encounters(source_id,recipient_id) values(observer,encountered);
   created:=created+1;
 end if;
 if private.compatible(encountered,observer)
   and not exists(select 1 from public.encounters where source_id=encountered and recipient_id=observer and state='available' and expires_at>now())
   and not exists(select 1 from public.encounters where source_id=encountered and recipient_id=observer and created_at>now()-config.pair_cooldown) then
   insert into public.encounters(source_id,recipient_id) values(encountered,observer);
   created:=created+1;
 end if;
 update public.proximity_events set processed_at=now() where observer_user_id=observer and client_event_id=detection_id;
 return created;
end $$;

create function private.revoke_proximity_token_on_visibility_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not new.radar or new.invisible then
   update public.proximity_tokens set revoked_at=now() where user_id=new.id and revoked_at is null;
 end if;
 return new;
end $$;
create trigger nearly_revoke_proximity_token
after update of radar,invisible on public.profiles
for each row execute function private.revoke_proximity_token_on_visibility_change();

revoke execute on function private.compatible(uuid,uuid),private.revoke_proximity_token_on_visibility_change() from public,anon,authenticated;
revoke execute on function public.issue_proximity_token(),public.record_proximity_event(uuid,text,smallint,integer,smallint) from public,anon;
grant execute on function public.issue_proximity_token(),public.record_proximity_event(uuid,text,smallint,integer,smallint) to authenticated;
