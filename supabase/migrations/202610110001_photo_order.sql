create function public.reorder_photos(ordered_paths text[])
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
 uid uuid:=auth.uid();
 existing_paths text[];
 requested_count integer;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 perform 1 from public.profiles where id=uid for update;
 if not found then raise exception 'Profile unavailable'; end if;

 select coalesce(array_agg(object_path order by position),array[]::text[])
 into existing_paths
 from public.profile_photos where user_id=uid;
 if coalesce(cardinality(ordered_paths),0) not between 1 and 6 then
   raise exception 'One to six photos required';
 end if;
 select count(*) into requested_count
 from (select distinct path from unnest(ordered_paths) as requested(path)) paths;
 if requested_count<>cardinality(ordered_paths)
   or cardinality(existing_paths)<>cardinality(ordered_paths)
   or exists(select 1 from unnest(ordered_paths) as requested(path) where not path=any(existing_paths)) then
   raise exception 'Photo order must contain exactly your current photos';
 end if;

 delete from public.profile_photos where user_id=uid;
 insert into public.profile_photos(user_id,object_path,position)
 select uid,path,(ordinality-1)::integer
 from unnest(ordered_paths) with ordinality as ordered(path,ordinality);
end
$$;

revoke all on function public.reorder_photos(text[]) from public,anon;
grant execute on function public.reorder_photos(text[]) to authenticated;
