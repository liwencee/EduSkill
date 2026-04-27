-- ============================================================
-- Migration 001: Users & Auth
-- SkillBridge Nigeria — Core identity layer
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- ENUM types
-- ------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('teacher', 'youth', 'employer', 'admin');

CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'institutional');

-- ------------------------------------------------------------
-- users
-- Core identity table. Passwords are hashed by the API (bcrypt).
-- Supabase Auth can optionally be used alongside this table.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email            TEXT NOT NULL UNIQUE,
  password_hash    TEXT NOT NULL,
  name             TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  role             user_role NOT NULL DEFAULT 'youth',
  tier             subscription_tier NOT NULL DEFAULT 'free',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url       TEXT,
  phone            TEXT,
  state            TEXT,                    -- Nigerian state (Lagos, Kano, etc.)
  lga              TEXT,                    -- Local Government Area
  preferred_language TEXT DEFAULT 'english',
  last_login_at    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Core user accounts for all roles: teachers, youth, employers, admins.';

-- ------------------------------------------------------------
-- refresh_tokens
-- Stores hashed refresh tokens for JWT rotation.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,          -- SHA-256 of the raw token
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE refresh_tokens IS 'Hashed refresh tokens for JWT rotation. Revoked on logout or password change.';

-- ------------------------------------------------------------
-- password_reset_tokens
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Trigger: auto-update updated_at on users
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
