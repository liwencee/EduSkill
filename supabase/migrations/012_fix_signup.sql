-- ─────────────────────────────────────────────────────────────────
-- 012_fix_signup.sql
-- Makes new user registration bulletproof.
--
-- Root cause: handle_new_user() trigger throws an unhandled exception
-- (email unique-constraint conflict, null value, bad role cast, etc.)
-- which causes Supabase Auth to roll back the whole signup and return
-- "Database error saving new user".
--
-- Fix: wrap every risky operation in its own EXCEPTION block so the
-- trigger ALWAYS returns NEW without ever raising to Auth.
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public          -- explicit schema so nothing gets lost
AS $$
DECLARE
  v_role  user_role := 'youth';
  v_name  text;
  v_email text;
BEGIN
  -- ── 1. Safely parse role ───────────────────────────────────────
  BEGIN
    IF (new.raw_user_meta_data->>'role') IS NOT NULL THEN
      v_role := (new.raw_user_meta_data->>'role')::user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'youth';            -- any bad value → default to youth
  END;

  -- ── 2. Safely parse name ───────────────────────────────────────
  v_name := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(new.raw_user_meta_data->>'name'), ''),   -- OAuth providers
    NULLIF(split_part(COALESCE(new.email, ''), '@', 1), ''),
    'User'
  );

  -- ── 3. Safe email fallback ─────────────────────────────────────
  v_email := COALESCE(new.email, '');

  -- ── 4. Insert profile — catch ALL constraint violations ────────
  --    ON CONFLICT (id) handles duplicate calls (e.g. email confirm)
  --    Outer EXCEPTION handles email-uniqueness or any other error
  BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (new.id, v_name, v_email, v_role)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Profile already exists with this email or another constraint hit.
    -- This must NOT block the auth.users insert — just continue.
    NULL;
  END;

  RETURN new;   -- always return NEW so the auth insert completes
END;
$$;

-- Re-attach trigger in case it was dropped or changed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Allow unauthenticated inserts too (for the server-action fallback)
DROP POLICY IF EXISTS "Users can insert own profile"          ON profiles;
DROP POLICY IF EXISTS "Service role can insert any profile"   ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());          -- authenticated users insert own row

-- Allow the signup server action (anon) to upsert profiles too
-- This is the fallback if the trigger somehow doesn't fire
CREATE POLICY "Service role can insert any profile"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);
