alter table public.items
add column if not exists reporter_name text,
add column if not exists reporter_email text;

update public.items
set
  reporter_name = coalesce(nullif(reporter_name, ''), 'Pengguna Terdaftar'),
  reporter_email = coalesce(reporter_email, '')
where reporter_name is null
   or reporter_name = ''
   or reporter_email is null;
