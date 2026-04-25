# SkillBridge Nigeria

> Upskill Nigeria's Teachers. Empower Nigeria's Youth. Connect Both to Opportunity.

Two-sided EdTech platform: **EduPro** (teachers) · **SkillUp** (youth) · **OpportunityHub** (jobs).
Offline-first Android app optimised for 2G networks.

---

## Colour System (60/30/10 Rule)

| Role | Colour | Hex |
|------|--------|-----|
| 60% Background | Warm Cream | `#F1EFE8` |
| 30% Structure | Blue | `#378ADD` |
| 10% Accent / CTA | Amber | `#EF9F27` |
| Body Text | Near-black | `#2C2C2A` |

---

## Project Structure

```
skillbridge-nigeria/
├── web/          # Next.js 14 (App Router) — website & web app
├── mobile/       # Flutter — Android app (offline-first, 2G)
└── supabase/     # PostgreSQL schema, RLS policies, seed data
```

---

## Quick Start

### 1. Supabase (Backend)

```bash
# Create a project at supabase.com
# Then run migrations in order:
supabase db push  # or paste each file into the SQL editor

# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_rls_policies.sql
# supabase/migrations/003_seed_data.sql
```

### 2. Web App (Next.js)

```bash
cd web
cp .env.example .env.local
# Fill in your Supabase URL, anon key, OpenAI key, Paystack keys

npm install
npm run dev          # http://localhost:3000
npm run build        # production build
```

Deploy to **Vercel** (recommended):
```bash
npx vercel --prod
```

### 3. Android App (Flutter)

```bash
cd mobile
flutter pub get

# Run on device/emulator
flutter run --dart-define=SUPABASE_URL=https://xxx.supabase.co \
            --dart-define=SUPABASE_ANON_KEY=your-anon-key \
            --dart-define=NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app

# Build release APK
flutter build apk --release \
  --dart-define=SUPABASE_URL=... \
  --dart-define=SUPABASE_ANON_KEY=... \
  --split-per-abi      # produces smaller per-device APKs
```

---

## Environment Variables

### Web (`web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # server-only
OPENAI_API_KEY=sk-...                   # AI lesson planner
PAYSTACK_SECRET_KEY=sk_live_...         # payments
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
```

### Mobile (build-time `--dart-define`)

```
SUPABASE_URL
SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL   # your deployed web app URL (for AI lesson planner API)
```

---

## Key Pages (Web)

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/login` | Login |
| `/auth/signup` | Signup (role selection) |
| `/dashboard` | Role-based dashboard |
| `/edupro` | Teacher module home |
| `/edupro/courses` | CPD course listing |
| `/edupro/lesson-planner` | AI Lesson Planner (GPT-4o) |
| `/edupro/community` | Teacher community forum |
| `/skillup` | Youth module home |
| `/skillup/courses` | Course catalog |
| `/skillup/courses/[slug]` | Course detail + enrol |
| `/opportunity-hub` | OpportunityHub home |
| `/opportunity-hub/jobs` | Job listings |
| `/employer` | Employer landing page |
| `/api/lesson-plan` | POST — AI lesson plan generation |
| `/api/webhooks/paystack` | POST — payment confirmation |

---

## Key Screens (Flutter / Android)

| Route | Screen |
|-------|--------|
| `/login` | Login screen |
| `/signup` | Signup with role selection |
| `/home` | Dashboard (role-based bottom nav) |
| `/courses` | SkillUp course catalog |
| `/courses/teacher` | EduPro CPD catalog |
| `/courses/:slug` | Course detail + enrol + download |
| `/video/:lessonId` | Offline-capable video player |
| `/downloads` | My downloaded courses |
| `/jobs` | OpportunityHub job listings |
| `/lesson-planner` | AI Lesson Planner (teachers) |
| `/profile` | User profile + certificates |

---

## 2G / Offline Architecture

```
Network detected as 2G or offline
         │
         ▼
App reads from Hive (course catalog cache)
         │
         ▼
Video player falls back to local file if downloaded
         │
         ▼
Quiz answers saved to SQLite (unsynced)
         │
         ▼
WorkManager fires every 15 min when online
         │
         ▼
Syncs progress to Supabase in background
```

**Video quality ladder:**
- WiFi / 4G → 1500 kbps
- 3G (fair)  →  800 kbps
- 2G (poor)  →  400 kbps ← Cloudflare Stream adaptive bitrate
- Offline    → local file (downloaded bundle)

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | All users (role, subscription, location) |
| `teacher_profiles` | Teacher-specific data |
| `youth_profiles` | Youth-specific data |
| `employer_profiles` | Employer data |
| `courses` | Course catalogue |
| `course_modules` | Modules (weeks/sections) |
| `lessons` | Individual lessons with video URLs |
| `quizzes` / `quiz_questions` | Assessments |
| `enrollments` | User–course enrolments |
| `lesson_progress` | Watch time + completion |
| `certificates` | Issued verifiable certs |
| `lesson_plans` | AI-generated lesson plans |
| `community_posts` / `community_replies` | Teacher forum |
| `job_listings` | Employer job posts |
| `job_applications` | Youth applications |
| `institutional_licenses` | School/NGO/govt licences |
| `payments` | Paystack payment records |

---

## Revenue Streams

| Stream | Who Pays | Est. Price |
|--------|----------|------------|
| Youth Premium | Individual learners | ₦1,500–3,500/month |
| Teacher Premium | Individual teachers | ₦2,000–4,000/month |
| Institutional License | Schools, NGOs, Govt | ₦50K–500K/term |
| Employer Job Postings | SMEs, Corporates | ₦10K–50K/listing |
| Government Contracts | State Ministries | ₦1M–10M/programme |

---

## Deployment Checklist

- [ ] Supabase project created + migrations run
- [ ] Supabase Auth emails configured (SMTP)
- [ ] Row Level Security verified on all tables
- [ ] Web app deployed to Vercel
- [ ] Paystack webhook URL set: `https://your-app.vercel.app/api/webhooks/paystack`
- [ ] OpenAI API key added to Vercel env vars
- [ ] Flutter `google-services.json` added for FCM push notifications
- [ ] Android APK built and tested on Tecno/Infinix devices
- [ ] Cloudflare Stream account created for video hosting

---

*Built for Nigeria. Works offline. Available in 5 languages.*
