-- ════════════════════════════════════════════════════════════════════
-- LOCAL DEVELOPMENT SEED ONLY — loaded by `supabase start` / `supabase db reset`
-- on the local Docker database. Never run this against production.
--
-- Test accounts (all share the password below; they exist only locally):
--   admin@skillora.test    admin    — Admin panel, video review, all analytics
--   creator@skillora.test  teacher  — submits videos, sees creator analytics
--   learner@skillora.test  youth    — browses courses, hits the paywall
--   Password: NLG6yj3kys0cXtsY
-- ════════════════════════════════════════════════════════════════════

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'admin@skillora.test',
  crypt('NLG6yj3kys0cXtsY', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Local Admin","role":"youth"}', now(), now(),
  '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'email',
  '{"sub":"a0000000-0000-4000-8000-000000000001","email":"admin@skillora.test","email_verified":true}', now(), now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'creator@skillora.test',
  crypt('NLG6yj3kys0cXtsY', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Ada Creator","role":"teacher"}', now(), now(),
  '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'email',
  '{"sub":"a0000000-0000-4000-8000-000000000002","email":"creator@skillora.test","email_verified":true}', now(), now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'learner@skillora.test',
  crypt('NLG6yj3kys0cXtsY', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Tunde Learner","role":"youth"}', now(), now(),
  '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'email',
  '{"sub":"a0000000-0000-4000-8000-000000000003","email":"learner@skillora.test","email_verified":true}', now(), now(), now())
ON CONFLICT DO NOTHING;

-- Promote the admin (signup can't create admins — see migration 027)
UPDATE public.profiles SET role = 'admin' WHERE id = 'a0000000-0000-4000-8000-000000000001';
