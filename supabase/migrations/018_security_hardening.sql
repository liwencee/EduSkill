-- ─────────────────────────────────────────────────────────────────
-- 018_security_hardening.sql
--
-- Closes three critical access-control holes found in security review:
--
--   #1  profiles UPDATE had no column protection → any logged-in user could
--       set their own role='admin' (full takeover) or self-grant a paid
--       subscription / result-gen unlock (revenue bypass) / is_verified.
--
--   #2  "Public profiles are viewable by all" (using true) exposed EVERY
--       user's email + phone to anyone holding the public anon key.
--
--   #3  institutional_licenses and the stray `users` table had RLS disabled
--       → fully readable/writable through the public REST API.
--
-- Designed to be NON-BREAKING for the live app:
--   • normal role self-switch (youth↔teacher↔employer) still works
--   • the Paystack webhook + result-gen counter (service role) still work
--   • admins (and DB superuser seeding the first admin) keep full control
--   • public course/job pages still read instructor/employer display fields
-- ─────────────────────────────────────────────────────────────────

-- =====================================================================
-- #1  Lock privileged columns on profiles
--     Row-level policies can't restrict *which columns* change, so we use
--     a BEFORE UPDATE trigger that reverts protected columns for ordinary
--     users while leaving admins and the service role untouched.
-- =====================================================================
create or replace function protect_privileged_profile_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  -- current_user_role() is SECURITY DEFINER (see 011) and reads profiles by
  -- auth.uid(). It returns NULL when there is no end-user JWT — i.e. the
  -- request is coming from the service-role key or a direct SQL session.
  caller_is_enduser boolean := current_user_role() is not null;
  caller_is_admin   boolean := current_user_role() = 'admin'::user_role;
begin
  -- Only constrain ordinary authenticated end-users. Admins and the service
  -- role (webhook, quota counter, SQL seeding) keep full write access.
  if caller_is_enduser and not caller_is_admin then
    -- Payment / verification columns are server-controlled only.
    new.subscription            := old.subscription;
    new.subscription_expires_at := old.subscription_expires_at;
    new.is_verified             := old.is_verified;
    new.result_gen_unlocked     := old.result_gen_unlocked;
    new.result_gen_count        := old.result_gen_count;
    new.result_gen_period       := old.result_gen_period;
    -- Email is tied to auth.users — never let it drift via a profile write.
    new.email                   := old.email;

    -- Allow youth/teacher/employer self-switch, but never self-promote to admin.
    if new.role = 'admin'::user_role and old.role is distinct from 'admin'::user_role then
      new.role := old.role;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_privileged_profile_cols on profiles;
create trigger trg_protect_privileged_profile_cols
  before update on profiles
  for each row
  execute function protect_privileged_profile_cols();


-- =====================================================================
-- #2  Stop anonymous harvesting of contact info / billing status
--     Keep the public display fields readable (needed for instructor /
--     employer names on public course & job pages) but remove email, phone,
--     subscription and result-gen columns from the anon role.
--
--     NOTE: authenticated users can still read other rows (the existing
--     "using (true)" SELECT policy). Tightening that to relationship-scoped
--     access (so a logged-in user can't enumerate every email/phone) is the
--     recommended follow-up — it needs the embed queries refactored onto a
--     view and should be verified against staging.
-- =====================================================================
revoke select on profiles from anon;

grant select (
  id,
  full_name,
  avatar_url,
  role,
  bio,
  state,
  lga,
  preferred_lang,
  is_verified
) on profiles to anon;


-- =====================================================================
-- #3a  institutional_licenses — RLS was never enabled
-- =====================================================================
alter table institutional_licenses enable row level security;

drop policy if exists "Admins manage licenses"        on institutional_licenses;
drop policy if exists "License contact can view"        on institutional_licenses;

create policy "Admins manage licenses" on institutional_licenses
  for all
  using      (current_user_role() = 'admin'::user_role)
  with check (current_user_role() = 'admin'::user_role);

create policy "License contact can view" on institutional_licenses
  for select
  using (contact_id = auth.uid());


-- =====================================================================
-- #3b  Stray `users` table (created in 20260430101410_new-migration.sql)
--      Looks like leftover scaffolding that duplicates auth.users and has
--      no RLS. Lock it down now (deny-all) so it isn't exposed via REST.
--      Once you've confirmed nothing reads it, drop it:  drop table users;
-- =====================================================================
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'users'
  ) then
    execute 'alter table public.users enable row level security';
    -- no policies = no anon/authenticated access (service role still bypasses)
  end if;
end $$;
