# SkillBridge Nigeria — Database Setup

## Quick Start (Supabase)

### 1. Create a Supabase project
1. Go to https://supabase.com → New project
2. Name: `skillbridge-nigeria`
3. Region: **West Europe** (closest to Nigeria with low latency)
4. Save the database password

### 2. Run migrations (in order)
In the Supabase **SQL Editor**, run each file in sequence:

```
database/migrations/001_create_users.sql
database/migrations/002_create_edupro.sql
database/migrations/003_create_skillup.sql
database/migrations/004_create_opportunity.sql
database/migrations/005_rls_policies.sql
database/migrations/006_indexes.sql
```

### 3. Seed dev data (optional)
```
database/seed.sql
```
Seed logins (password: `Test@1234`):
| Role     | Email                        |
|----------|------------------------------|
| admin    | admin@skillbridge.ng         |
| teacher  | teacher@skillbridge.ng       |
| youth    | youth@skillbridge.ng         |
| employer | employer@skillbridge.ng      |

### 4. Add credentials to .env
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

---

## Schema Overview

### 18 tables across 4 layers

| Migration | Tables | Purpose |
|-----------|--------|---------|
| 001 | `users`, `refresh_tokens`, `password_reset_tokens` | Auth & identity |
| 002 | `edupro_courses`, `edupro_enrollments`, `teaching_materials`, `cpd_certificates`, `lesson_plan_history`, `community_posts`, `community_replies` | Teacher upskilling |
| 003 | `skillup_courses`, `lessons`, `skillup_enrollments`, `lesson_progress`, `youth_certificates`, `course_ratings`, `study_groups`, `study_group_members` | Youth learning |
| 004 | `employer_profiles`, `job_listings`, `graduate_profiles`, `job_applications`, `saved_jobs` | Jobs & matching |

### Automated triggers
| Trigger | What it does |
|---------|-------------|
| `edupro_auto_certificate` | Issues CPD certificate when teacher hits 100% |
| `skillup_auto_certificate` | Issues youth certificate when course is 100% complete |
| `recalculate_course_progress` | Updates enrollment progress % on every lesson completion |
| `sync_enrollment_count` | Keeps `skillup_courses.enrolment_count` accurate |
| `cert_sync_graduate_skills` | Adds earned skill to `graduate_profiles.skills` automatically |
| `sync_application_count` | Keeps `job_listings.application_count` accurate |
| `update_hire_count` | Increments employer hire count when application status → hired |
| `skillup_courses_fts_update` | Rebuilds full-text search vector on course save |
| `job_listings_fts_update` | Rebuilds full-text search vector on job save |
