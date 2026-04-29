-- Row Level Security Policies
-- Each table is locked down by role

-- ─── Enable RLS ──────────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table teacher_profiles enable row level security;
alter table youth_profiles enable row level security;
alter table employer_profiles enable row level security;
alter table courses enable row level security;
alter table course_modules enable row level security;
alter table lessons enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table certificates enable row level security;
alter table lesson_plans enable row level security;
alter table community_posts enable row level security;
alter table community_replies enable row level security;
alter table job_listings enable row level security;
alter table job_applications enable row level security;
alter table payments enable row level security;

-- Helper: get current user role
create or replace function current_user_role()
returns user_role language sql stable as $$
  select role from profiles where id = auth.uid();
$$;

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create policy "Public profiles are viewable by all" on profiles
  for select using (true);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Admins can update any profile" on profiles
  for update using (current_user_role() = 'admin');

-- ─── COURSES ─────────────────────────────────────────────────────────────────
create policy "Published courses visible to all" on courses
  for select using (is_published = true);

create policy "Instructors see own unpublished courses" on courses
  for select using (instructor_id = auth.uid());

create policy "Admins see all courses" on courses
  for select using (current_user_role() = 'admin');

create policy "Verified educators can create courses" on courses
  for insert with check (
    auth.uid() = instructor_id and (
      current_user_role() = 'teacher' or current_user_role() = 'admin'
    )
  );

create policy "Instructors can update own courses" on courses
  for update using (instructor_id = auth.uid());

-- ─── LESSONS — free preview or enrolled ──────────────────────────────────────
create policy "Free preview lessons visible to all" on lessons
  for select using (is_free_preview = true);

create policy "Enrolled users see lessons" on lessons
  for select using (
    exists (
      select 1 from enrollments
      where user_id = auth.uid() and course_id = lessons.course_id
        and status in ('active','completed')
    )
  );

create policy "Instructors see own lessons" on lessons
  for select using (
    exists (select 1 from courses where id = lessons.course_id and instructor_id = auth.uid())
  );

-- ─── ENROLLMENTS ─────────────────────────────────────────────────────────────
create policy "Users see own enrollments" on enrollments
  for select using (user_id = auth.uid());

create policy "Users can enroll" on enrollments
  for insert with check (user_id = auth.uid());

create policy "Users can update own enrollment" on enrollments
  for update using (user_id = auth.uid());

-- ─── LESSON PROGRESS ─────────────────────────────────────────────────────────
create policy "Users see own progress" on lesson_progress
  for select using (user_id = auth.uid());

create policy "Users can track own progress" on lesson_progress
  for insert with check (user_id = auth.uid());

create policy "Users can update own progress" on lesson_progress
  for update using (user_id = auth.uid());

-- ─── CERTIFICATES ────────────────────────────────────────────────────────────
create policy "Certificates are public" on certificates
  for select using (true);

create policy "System can insert certificates" on certificates
  for insert with check (user_id = auth.uid());

-- ─── LESSON PLANS ────────────────────────────────────────────────────────────
create policy "Teachers see own lesson plans" on lesson_plans
  for select using (teacher_id = auth.uid() or is_public = true);

create policy "Teachers can create lesson plans" on lesson_plans
  for insert with check (
    teacher_id = auth.uid() and current_user_role() = 'teacher'
  );

create policy "Teachers can update own lesson plans" on lesson_plans
  for update using (teacher_id = auth.uid());

create policy "Teachers can delete own lesson plans" on lesson_plans
  for delete using (teacher_id = auth.uid());

-- ─── COMMUNITY ───────────────────────────────────────────────────────────────
create policy "Community posts visible to teachers and admins" on community_posts
  for select using (current_user_role() in ('teacher','admin'));

create policy "Teachers can post" on community_posts
  for insert with check (
    author_id = auth.uid() and current_user_role() = 'teacher'
  );

create policy "Authors can update own posts" on community_posts
  for update using (author_id = auth.uid());

create policy "Community replies visible to teachers" on community_replies
  for select using (current_user_role() in ('teacher','admin'));

create policy "Teachers can reply" on community_replies
  for insert with check (
    author_id = auth.uid() and current_user_role() = 'teacher'
  );

-- ─── JOB LISTINGS ────────────────────────────────────────────────────────────
create policy "Active jobs visible to all" on job_listings
  for select using (is_active = true);

create policy "Employers see own listings" on job_listings
  for select using (employer_id = auth.uid());

create policy "Employers can post jobs" on job_listings
  for insert with check (
    employer_id = auth.uid() and current_user_role() = 'employer'
  );

create policy "Employers can update own jobs" on job_listings
  for update using (employer_id = auth.uid());

-- ─── JOB APPLICATIONS ────────────────────────────────────────────────────────
create policy "Applicants see own applications" on job_applications
  for select using (applicant_id = auth.uid());

create policy "Employers see applications to their jobs" on job_applications
  for select using (
    exists (select 1 from job_listings where id = job_applications.job_id and employer_id = auth.uid())
  );

create policy "Youth can apply" on job_applications
  for insert with check (
    applicant_id = auth.uid() and current_user_role() = 'youth'
  );

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────
create policy "Users see own payments" on payments
  for select using (user_id = auth.uid());
