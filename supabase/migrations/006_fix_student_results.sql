-- Fix Migration 006: Recreate student_results with correct schema
-- Run this in the Supabase SQL editor if migration 004 failed with:
--   ERROR 42703: column "teacher_id" does not exist
--
-- Root cause: student_results table already existed with a different
-- schema, so CREATE TABLE IF NOT EXISTS was skipped, but the subsequent
-- indexes referenced columns that didn't exist in the old table.
--
-- This migration safely drops and recreates the table.

-- ─── STUDENT RESULTS ─────────────────────────────────────────────────────────

-- Drop everything tied to the old table first
drop trigger  if exists student_results_updated_at  on student_results;
drop index    if exists idx_student_results_teacher;
drop index    if exists idx_student_results_created;
drop policy   if exists "Teachers can manage own results" on student_results;
drop table    if exists student_results cascade;

-- Recreate with full correct schema
create table student_results (
  id            uuid        primary key default gen_random_uuid(),
  teacher_id    uuid        not null references profiles(id) on delete cascade,
  school_name   text        not null,
  class_name    text        not null,
  term          text        not null,        -- e.g. "1st", "2nd", "3rd"
  session       text        not null,        -- e.g. "2024/2025"
  passmark      integer     not null default 50,
  subjects      jsonb       not null,        -- [{ name, maxScore }]
  students      jsonb       not null,        -- [{ name, scores: { subjectName: score } }]
  results       jsonb       not null,        -- full ranked StudentResult[] output
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- RLS: teachers see only their own sheets
alter table student_results enable row level security;

create policy "Teachers can manage own results"
  on student_results
  for all
  using  (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- Indexes
create index idx_student_results_teacher
  on student_results(teacher_id, session, term);

create index idx_student_results_created
  on student_results(created_at desc);

-- Auto-update updated_at (reuse function from migration 004 if it exists)
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger student_results_updated_at
  before update on student_results
  for each row execute procedure set_updated_at();


-- ─── LESSON PLAN CACHE ───────────────────────────────────────────────────────
-- Only recreate if it doesn't already exist correctly.

create table if not exists lesson_plan_cache (
  cache_key     text        primary key,
  subject       text        not null,
  topic         text        not null,
  sub_topic     text,
  grade         text        not null,
  duration      text,
  plan          jsonb       not null,
  hit_count     integer     not null default 0,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '7 days')
);

alter table lesson_plan_cache enable row level security;

-- Drop and recreate policy in case it's missing
drop policy if exists "Service role can manage cache" on lesson_plan_cache;
create policy "Service role can manage cache"
  on lesson_plan_cache
  for all
  using (true)
  with check (true);

create index if not exists idx_lesson_plan_cache_subject_grade
  on lesson_plan_cache(subject, grade);

create index if not exists idx_lesson_plan_cache_expires
  on lesson_plan_cache(expires_at);


-- ─── RESULT RECOMMENDATIONS CACHE ────────────────────────────────────────────

create table if not exists result_recs_cache (
  cache_key        text        primary key,
  class_name       text        not null,
  term             text        not null,
  session          text        not null,
  recommendations  jsonb       not null,
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default (now() + interval '2 hours')
);

alter table result_recs_cache enable row level security;

drop policy if exists "Service role can manage recs cache" on result_recs_cache;
create policy "Service role can manage recs cache"
  on result_recs_cache
  for all
  using (true)
  with check (true);

create index if not exists idx_result_recs_cache_expires
  on result_recs_cache(expires_at);


-- ─── AUDIT LOG ───────────────────────────────────────────────────────────────

create table if not exists api_audit_log (
  id          bigserial   primary key,
  ts          timestamptz not null default now(),
  route       text        not null,
  method      text        not null default 'POST',
  user_id     uuid,
  ip          text,
  status_code integer     not null,
  duration_ms integer,
  meta        jsonb
);

alter table api_audit_log enable row level security;

drop policy if exists "Only service role can access audit log" on api_audit_log;
create policy "Only service role can access audit log"
  on api_audit_log
  for all
  using (false);

create index if not exists idx_audit_log_ts    on api_audit_log(ts desc);
create index if not exists idx_audit_log_route on api_audit_log(route, ts desc);
create index if not exists idx_audit_log_user  on api_audit_log(user_id, ts desc);


-- ─── JOB ENGAGEMENT FIELDS ───────────────────────────────────────────────────
-- Also included here in case migration 005 was not yet run.

alter table job_listings
  add column if not exists rate_type           text,
  add column if not exists engagement_duration text;
