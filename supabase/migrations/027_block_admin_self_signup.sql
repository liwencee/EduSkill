-- ── 027: Block self-assigned admin role at signup ──────────────────────────
--
-- SECURITY FIX. handle_new_user() copied raw_user_meta_data->>'role' straight
-- into profiles.role, and signup metadata is chosen by the client. Anyone
-- could call supabase.auth.signUp({ options: { data: { role: 'admin' } } })
-- with the public anon key (or edit the signup form's hidden field) and get
-- a full admin account. 018's protect_privileged_profile_cols() only guards
-- UPDATEs, and the "Users can insert own profile" policy let an end user
-- INSERT their own profile row with any role.
--
-- Fix: signup may only produce the self-service roles; admin and
-- institutional accounts must be granted by an existing admin (or via SQL).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role  user_role := 'youth';
  v_name  text;
  v_email text;
BEGIN
  -- ── 1. Role: only self-service roles may come from signup metadata ──
  IF (new.raw_user_meta_data->>'role') IN ('youth', 'teacher', 'employer') THEN
    v_role := (new.raw_user_meta_data->>'role')::user_role;
  END IF;

  -- ── 2. Name ──
  v_name := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(new.raw_user_meta_data->>'name'), ''),
    NULLIF(split_part(COALESCE(new.email, ''), '@', 1), ''),
    'User'
  );

  v_email := COALESCE(new.email, '');

  -- ── 3. Profile row — never block the auth insert ──
  BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (new.id, v_name, v_email, v_role)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN new;
END;
$$;

-- End users inserting their own profile row (the signup server-action
-- fallback) can't pick a privileged role either.
CREATE OR REPLACE FUNCTION public.protect_profile_insert_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL                                  -- an end-user JWT, not service role / SQL
     AND NOT COALESCE(is_admin(), false)
     AND new.role NOT IN ('youth', 'teacher', 'employer') THEN
    new.role := 'youth';
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_insert_role ON profiles;
CREATE TRIGGER trg_protect_profile_insert_role
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_insert_role();
