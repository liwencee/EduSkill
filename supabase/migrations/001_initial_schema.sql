-- SkillBridge Nigeria — Initial Schema
-- Run in Supabase SQL editor or via supabase db push

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for full-text search

-- ─── ENUMS ───────────────────────────────────────────────────────────────────
create type user_role as enum ('youth', 'teacher', 'employer', 'admin', 'institutional');
create type course_category as enum (
  'digital_marketing','coding','fashion_design','solar_tech','agribusiness',
  'financial_literacy','vocational_teaching','digital_classroom',
  'inclusive_education','entrepreneurship','healthcare','construction'
);
create type language_code as enum ('en','yo','ig','ha','pcm'); -- pcm = Nigerian Pidgin
create type enrollment_status as enum ('active','completed','paused','expired');
create type job_type as enum ('full_time','part_time','apprenticeship','freelance','internship');
create type subscription_plan as enum ('free','youth_premium','teacher_premium','institutional');
create type certificate_status as enum ('issued','revoked');

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text not null,
  email           text unique not null,
  role            user_role not null default 'youth',
  avatar_url      text,
  phone           text,
  state           text,                      -- Nigerian state
  lga             text,                      -- Local Government Area
  preferred_lang  language_code default 'en',
  bio             text,
  is_verified     boolean default false,
  subscription    subscription_plan default 'free',
  subscription_expires_at timestamptz,
  onboarding_done boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Teacher-specific profile extension
create table teacher_profiles (
  id              uuid primary key references profiles(id) on delete cascade,
  school_name     text,
  subject_areas   text[],
  years_experience int default 0,
  is_verified_educator boolean default false,
  cpd_points      int default 0,
  total_courses_created int default 0,
  total_students  int default 0
);

-- Youth-specific profile extension
create table youth_profiles (
  id              uuid primary key references profiles(id) on delete cascade,
  skills          text[],
  goal            text,
  employment_status text,
  is_job_seeking  boolean default true,
  portfolio_url   text
);

-- Employer-specific profile extension
create table employer_profiles (
  id              uuid primary key references profiles(id) on delete cascade,
  company_name    text not null,
  company_size    text,
  industry        text,
  website         text,
  is_verified     boolean default false,
  active_listings int default 0
);

-- ─── COURSES ─────────────────────────────────────────────────────────────────
create table courses (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  slug            text unique not null,
  description     text not null,
  thumbnail_url   text,
  trailer_url     text,
  category        course_category not null,
  target_role     user_role not null,          -- who this course is for
  language        language_code default 'en',
  available_langs language_code[] default '{en}',
  instructor_id   uuid references profiles(id),
  duration_weeks  int not null default 4,
  is_free         boolean default false,
  is_published    boolean default false,
  is_offline_ready boolean default true,
  price_ngn       numeric(10,2) default 0,
  total_lessons   int default 0,
  total_enrolled  int default 0,
  avg_rating      numeric(3,2) default 0,
  tags            text[],
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index courses_category_idx on courses(category);
create index courses_role_idx on courses(target_role);
create index courses_slug_idx on courses(slug);
create index courses_search_idx on courses using gin(to_tsvector('english', title || ' ' || description));

-- Course modules (sections/weeks)
create table course_modules (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references courses(id) on delete cascade,
  title       text not null,
  description text,
  order_index int not null,
  created_at  timestamptz default now()
);

-- Individual lessons
create table lessons (
  id              uuid primary key default uuid_generate_v4(),
  module_id       uuid not null references course_modules(id) on delete cascade,
  course_id       uuid not null references courses(id) on delete cascade,
  title           text not null,
  description     text,
  video_url       text,                        -- Cloudflare Stream URL
  video_duration_secs int default 0,
  content_json    jsonb,                       -- rich text / slides
  subtitles_url   jsonb,                       -- {en: url, yo: url, ig: url, ha: url}
  offline_bundle_url text,                     -- downloadable zip for 2G users
  offline_size_kb int,
  order_index     int not null,
  is_free_preview boolean default false,
  created_at      timestamptz default now()
);

-- Quizzes attached to lessons
create table quizzes (
  id          uuid primary key default uuid_generate_v4(),
  lesson_id   uuid references lessons(id) on delete cascade,
  course_id   uuid references courses(id) on delete cascade,
  title       text not null,
  pass_score  int default 70,
  created_at  timestamptz default now()
);

create table quiz_questions (
  id          uuid primary key default uuid_generate_v4(),
  quiz_id     uuid not null references quizzes(id) on delete cascade,
  question    text not null,
  options     jsonb not null,                  -- [{text, is_correct}]
  explanation text,
  order_index int not null
);

-- ─── ENROLLMENTS & PROGRESS ──────────────────────────────────────────────────
create table enrollments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  course_id   uuid not null references courses(id) on delete cascade,
  status      enrollment_status default 'active',
  progress_pct int default 0,
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  unique(user_id, course_id)
);

create index enrollments_user_idx on enrollments(user_id);
create index enrollments_course_idx on enrollments(course_id);

create table lesson_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  lesson_id       uuid not null references lessons(id) on delete cascade,
  course_id       uuid not null references courses(id) on delete cascade,
  is_completed    boolean default false,
  watch_secs      int default 0,
  last_watched_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- ─── CERTIFICATES ────────────────────────────────────────────────────────────
create table certificates (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id),
  course_id       uuid not null references courses(id),
  certificate_url text,
  accredible_id   text,                        -- Accredible external ID
  issued_at       timestamptz default now(),
  status          certificate_status default 'issued',
  unique(user_id, course_id)
);

-- ─── AI LESSON PLANS ─────────────────────────────────────────────────────────
create table lesson_plans (
  id              uuid primary key default uuid_generate_v4(),
  teacher_id      uuid not null references profiles(id) on delete cascade,
  title           text not null,
  subject         text not null,
  grade_level     text not null,
  duration_mins   int,
  objectives      text[],
  content_json    jsonb not null,              -- full AI-generated plan
  is_public       boolean default false,       -- can share with community
  likes           int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── TEACHER COMMUNITY ───────────────────────────────────────────────────────
create table community_posts (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid not null references profiles(id) on delete cascade,
  title       text not null,
  body        text not null,
  category    text,                            -- 'question','resource','discussion'
  tags        text[],
  likes       int default 0,
  replies     int default 0,
  is_pinned   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table community_replies (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references community_posts(id) on delete cascade,
  author_id   uuid not null references profiles(id) on delete cascade,
  body        text not null,
  likes       int default 0,
  created_at  timestamptz default now()
);

-- ─── OPPORTUNITY HUB ─────────────────────────────────────────────────────────
create table job_listings (
  id              uuid primary key default uuid_generate_v4(),
  employer_id     uuid not null references profiles(id) on delete cascade,
  title           text not null,
  description     text not null,
  company_name    text not null,
  job_type        job_type not null,
  location_state  text,
  is_remote       boolean default false,
  required_skills text[],
  required_certs  uuid[],                      -- course IDs
  salary_min_ngn  numeric(12,2),
  salary_max_ngn  numeric(12,2),
  is_featured     boolean default false,
  is_active       boolean default true,
  applications    int default 0,
  deadline        date,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index jobs_active_idx on job_listings(is_active, created_at desc);
create index jobs_search_idx on job_listings using gin(to_tsvector('english', title || ' ' || description));

create table job_applications (
  id              uuid primary key default uuid_generate_v4(),
  job_id          uuid not null references job_listings(id) on delete cascade,
  applicant_id    uuid not null references profiles(id) on delete cascade,
  cover_note      text,
  status          text default 'pending',      -- pending, reviewed, shortlisted, rejected, hired
  applied_at      timestamptz default now(),
  unique(job_id, applicant_id)
);

-- ─── INSTITUTIONAL LICENSES ──────────────────────────────────────────────────
create table institutional_licenses (
  id              uuid primary key default uuid_generate_v4(),
  org_name        text not null,
  org_type        text,                        -- school, ngo, government
  contact_id      uuid references profiles(id),
  seat_count      int not null default 10,
  seats_used      int default 0,
  plan            text default 'basic',
  price_ngn       numeric(12,2),
  valid_from      date,
  valid_until     date,
  created_at      timestamptz default now()
);

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────
create table payments (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id),
  amount_ngn      numeric(12,2) not null,
  plan            subscription_plan,
  paystack_ref    text unique,
  status          text default 'pending',      -- pending, success, failed
  paid_at         timestamptz,
  created_at      timestamptz default now()
);

-- ─── TRIGGERS: updated_at ────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
create trigger courses_updated_at before update on courses
  for each row execute function update_updated_at();
create trigger lesson_plans_updated_at before update on lesson_plans
  for each row execute function update_updated_at();

-- ─── FUNCTION: auto-create profile on signup ─────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'youth')
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── FUNCTION: update enrollment progress ────────────────────────────────────
create or replace function update_enrollment_progress()
returns trigger language plpgsql as $$
declare
  total_lessons int;
  completed_lessons int;
  new_pct int;
begin
  select count(*) into total_lessons from lessons where course_id = new.course_id;
  select count(*) into completed_lessons from lesson_progress
    where user_id = new.user_id and course_id = new.course_id and is_completed = true;

  if total_lessons > 0 then
    new_pct := (completed_lessons * 100) / total_lessons;
  else
    new_pct := 0;
  end if;

  update enrollments
    set progress_pct = new_pct,
        status = case when new_pct = 100 then 'completed' else 'active' end,
        completed_at = case when new_pct = 100 then now() else null end
    where user_id = new.user_id and course_id = new.course_id;

  return new;
end; $$;

create trigger lesson_completed_trigger
  after insert or update on lesson_progress
  for each row execute function update_enrollment_progress();
