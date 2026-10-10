insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('profile-photos','profile-photos',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy photo_upload_own on storage.objects for insert to authenticated with check(bucket_id='profile-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy photo_read_authorized on storage.objects for select to authenticated using(bucket_id='profile-photos' and ((storage.foldername(name))[1]=auth.uid()::text or exists(select 1 from public.profile_photos p where p.object_path=name and private.can_view(p.user_id,auth.uid()))));
create policy photo_delete_own on storage.objects for delete to authenticated using(bucket_id='profile-photos' and (storage.foldername(name))[1]=auth.uid()::text);
-- No UPDATE/upsert policy: replacements get a fresh, unguessable path.
create function public.register_photo(path text, replacing text default null) returns void language plpgsql security definer set search_path='' as $$ declare slot integer; begin
 perform 1 from public.profiles where id=auth.uid() for update;
 if split_part(path,'/',1)<>auth.uid()::text or not exists(select 1 from storage.objects where bucket_id='profile-photos' and name=path and owner_id=auth.uid()::text) then raise exception 'Photo unavailable'; end if;
 if replacing is not null then
 select position into slot from public.profile_photos where user_id=auth.uid() and object_path=replacing;
 if slot is null then raise exception 'Replacement unavailable'; end if;
 delete from public.profile_photos where user_id=auth.uid() and object_path=replacing;
 else
 select n into slot from generate_series(0,5) n where not exists(select 1 from public.profile_photos where user_id=auth.uid() and position=n) order by n limit 1;
 if slot is null then raise exception 'Maximum six photos'; end if;
 end if;
 insert into public.profile_photos(user_id,object_path,position) values(auth.uid(),path,slot);
end $$;
create function public.remove_photo(path text) returns void language plpgsql security definer set search_path='' as $$ begin
 perform 1 from public.profiles where id=auth.uid() for update;
 if exists(select 1 from public.profiles where id=auth.uid() and onboarded) and (select count(*) from public.profile_photos where user_id=auth.uid())<=1 then raise exception 'Keep at least one photo'; end if;
 delete from public.profile_photos where user_id=auth.uid() and object_path=path;
end $$;
revoke all on function public.register_photo(text,text),public.remove_photo(text) from public,anon;
grant execute on function public.register_photo(text,text),public.remove_photo(text) to authenticated;
