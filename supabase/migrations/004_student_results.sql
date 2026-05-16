-- EduSkill — Student Results & Lesson Plan Cache
-- Migration: 004_student_results.sql
-- Run: supabase db push  OR  paste into Supabase SQL editor

-- ─── STUDENT RESULTS ─────────────────────────────────────────────────────────
-- Persists generated result sheets so teachers can retrieve them later.

create table if not exists student_results (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null references profiles(id) on delete cascade,
  school_name   text not null,
  class_name    text not null,
  term          text not null,        -- e.g. "1st", "2nd", "3rd"
  session       text not null,        -- e.g. "2024/2025"
  passmark      integer not null default 50,
  subjects      jsonb not null,       -- [{ name, maxScore }]
  students      jsonb not null,       -- [{ name, scores: { subjectName: score } }]
  results       jsonb not null,       -- full ranked StudentResult[] output
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Teachers can only see their own result sheets
alter table student_results enable row level security;

create policy "Teachers can manage own results"
  on student_results
  for all
  using  (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- Index for quick lookup by teacher + term/session
create index idx_student_results_teacher
  on student_results(teacher_id, session, term);

create index idx_student_results_created
  on student_results(created_at desc);

-- Auto-update updated_at
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
-- DB-level cache for AI-generated lesson plans (complements in-memory LRU).
-- Useful when the Next.js server restarts / scales across multiple instances.

create table if not exists lesson_plan_cache (
  cache_key     text primary key,                 -- deterministic hash key
  subject       text not null,
  topic         text not null,
  sub_topic     text,
  grade         text not null,
  duration      text,
  plan          jsonb not null,                   -- full plan JSON
  hit_count     integer not null default 0,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null             -- 7-day TTL
                  default (now() + interval '7 days')
);

-- Public read only (lesson plans aren't user-specific)
alter table lesson_plan_cache enable row level security;

create policy "Service role can manage cache"
  on lesson_plan_cache
  for all
  using (true)
  with check (true);

-- Allow the API to look up by (subject, topic, grade) without knowing the key
create index idx_lesson_plan_cache_subject_grade
  on lesson_plan_cache(subject, grade);

create index idx_lesson_plan_cache_expires
  on lesson_plan_cache(expires_at);

-- Purge expired rows automatically (requires pg_cron extension — enable in Supabase dashboard)
-- If pg_cron is not available, expired rows are ignored at query time by the API.
-- Uncomment the block below once pg_cron is enabled:
/*
select cron.schedule(
  'purge-lesson-plan-cache',
  '0 3 * * *',   -- run at 03:00 UTC every day
  $$
    delete from lesson_plan_cache where expires_at < now();
  $$
);
*/


-- ─── RESULT RECOMMENDATIONS CACHE ────────────────────────────────────────────
-- Short-lived cache (2 hours) for AI-generated student recommendations.
-- Prevents duplicate OpenAI calls if a teacher regenerates for the same class.

create table if not exists result_recs_cache (
  cache_key     text primary key,
  class_name    text not null,
  term          text not null,
  session       text not null,
  recommendations jsonb not null,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null
                  default (now() + interval '2 hours')
);

alter table result_recs_cache enable row level security;

create policy "Service role can manage recs cache"
  on result_recs_cache
  for all
  using (true)
  with check (true);

create index idx_result_recs_cache_expires
  on result_recs_cache(expires_at);


-- ─── AUDIT LOG (optional but production-grade) ───────────────────────────────
-- Lightweight append-only log of key API events for compliance & debugging.

create table if not exists api_audit_log (
  id          bigserial primary key,
  ts          timestamptz not null default now(),
  route       text not null,
  method      text not null default 'POST',
  user_id     uuid,           -- null for unauthenticated requests
  ip          text,
  status_code integer not null,
  duration_ms integer,
  meta        jsonb           -- arbitrary extra fields
);

-- No RLS — service role only; never expose to client
alter table api_audit_log enable row level security;

create policy "Only service role can access audit log"
  on api_audit_log
  for all
  using (false);   -- deny all client access; service-role bypasses RLS

-- Partition-ready index for time-based queries
create index idx_audit_log_ts     on api_audit_log(ts desc);
create index idx_audit_log_route  on api_audit_log(route, ts desc);
create index idx_audit_log_user   on api_audit_log(user_id, ts desc);

-- Auto-purge audit logs older than 90 days (uncomment once pg_cron enabled)
/*
select cron.schedule(
  'purge-audit-log',
  '0 2 * * *',
  $$
    delete from api_audit_log where ts < now() - interval '90 days';
  $$
);
*/
