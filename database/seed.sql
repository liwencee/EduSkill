-- ============================================================
-- Seed Data — SkillBridge Nigeria
-- Dev/staging only. DO NOT run in production.
-- Passwords are bcrypt hashes of 'Test@1234'
-- ============================================================

-- ------------------------------------------------------------
-- Users (one per role)
-- ------------------------------------------------------------
INSERT INTO users (id, email, password_hash, name, role, tier, is_verified, state, preferred_language) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@skillbridge.ng',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMwJFdnmbGS.v4.y3uFGY8Ox1K',
   'SkillBridge Admin', 'admin', 'institutional', TRUE, 'Lagos', 'english'),

  ('00000000-0000-0000-0000-000000000002', 'teacher@skillbridge.ng',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMwJFdnmbGS.v4.y3uFGY8Ox1K',
   'Adaeze Okonkwo', 'teacher', 'premium', TRUE, 'Anambra', 'english'),

  ('00000000-0000-0000-0000-000000000003', 'youth@skillbridge.ng',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMwJFdnmbGS.v4.y3uFGY8Ox1K',
   'Emeka Nwosu', 'youth', 'free', TRUE, 'Lagos', 'pidgin'),

  ('00000000-0000-0000-0000-000000000004', 'employer@skillbridge.ng',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMwJFdnmbGS.v4.y3uFGY8Ox1K',
   'Fatima Abubakar', 'employer', 'institutional', TRUE, 'Kano', 'hausa'),

  ('00000000-0000-0000-0000-000000000005', 'teacher2@skillbridge.ng',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMwJFdnmbGS.v4.y3uFGY8Ox1K',
   'Babatunde Olawale', 'teacher', 'free', TRUE, 'Lagos', 'yoruba')
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------
-- Employer profile
-- ------------------------------------------------------------
INSERT INTO employer_profiles (user_id, company_name, industry, company_size, state, verified)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Abubakar Textile Mills', 'Manufacturing', '50-200', 'Kano', TRUE
) ON CONFLICT (user_id) DO NOTHING;

-- ------------------------------------------------------------
-- EduPro courses
-- ------------------------------------------------------------
INSERT INTO edupro_courses (id, title, description, subject, level, duration_weeks, is_free, published, nerdc_aligned, instructor_id) VALUES
  ('10000000-0000-0000-0000-000000000001',
   'Digital Classroom Foundations',
   'Master tools like Google Classroom, Kahoot, and Canva to bring your lessons to life with technology. Aligned to NERDC ICT integration guidelines.',
   'Digital Skills', 'beginner', 2, TRUE, TRUE, TRUE,
   '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000002',
   'Vocational Teaching Excellence',
   'Practical training on hands-on instructional methods for technical and vocational subjects. Covers project-based learning and competency assessment.',
   'Vocational Education', 'intermediate', 4, FALSE, TRUE, TRUE,
   '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000003',
   'Inclusive Education Practices',
   'Equip yourself to teach students with diverse learning needs — visual, auditory, kinesthetic learners and learners with disabilities.',
   'Inclusive Education', 'beginner', 3, FALSE, TRUE, TRUE,
   '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- SkillUp courses
-- ------------------------------------------------------------
INSERT INTO skillup_courses (id, title, description, category, duration_weeks, languages, offline_available, is_free, published, employer_validated) VALUES
  ('20000000-0000-0000-0000-000000000001',
   'Digital Marketing Mastery',
   'Learn social media marketing, SEO, email campaigns and Google Ads. Build real campaigns for Nigerian businesses and earn your certificate.',
   'digital_marketing', 4, '{english,yoruba,pidgin}', TRUE, FALSE, TRUE, TRUE),

  ('20000000-0000-0000-0000-000000000002',
   'Coding for Beginners',
   'From zero to your first website. HTML, CSS, basic JavaScript. Build a portfolio project and get job-ready in 6 weeks.',
   'coding', 6, '{english,pidgin}', TRUE, TRUE, TRUE, TRUE),

  ('20000000-0000-0000-0000-000000000003',
   'Fashion Design & Tailoring Business',
   'Learn pattern making, fabric cutting, machine operation and how to price and market your tailoring business in Nigeria.',
   'fashion_design', 8, '{english,yoruba,igbo,hausa,pidgin}', TRUE, FALSE, TRUE, TRUE),

  ('20000000-0000-0000-0000-000000000004',
   'Solar Installation & Maintenance',
   'Hands-on training in solar panel installation, wiring, battery systems and maintenance. Aligned to NASENI solar technician standards.',
   'solar_tech', 6, '{english,hausa,pidgin}', TRUE, FALSE, TRUE, TRUE),

  ('20000000-0000-0000-0000-000000000005',
   'Modern Agribusiness',
   'Profitable farming techniques, crop management, market linkages and agro-processing for young Nigerian farmers.',
   'agribusiness', 5, '{english,yoruba,igbo,hausa}', TRUE, TRUE, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Lessons for Digital Marketing Mastery
INSERT INTO lessons (course_id, title, lesson_type, order_index, duration_mins, is_preview) VALUES
  ('20000000-0000-0000-0000-000000000001', 'What is Digital Marketing?',         'video',   1, 15, TRUE),
  ('20000000-0000-0000-0000-000000000001', 'Understanding Your Nigerian Audience','video',   2, 20, FALSE),
  ('20000000-0000-0000-0000-000000000001', 'Social Media Strategy',               'video',   3, 25, FALSE),
  ('20000000-0000-0000-0000-000000000001', 'Creating Content That Converts',      'video',   4, 30, FALSE),
  ('20000000-0000-0000-0000-000000000001', 'Module 1 Quiz',                       'quiz',    5, 10, FALSE),
  ('20000000-0000-0000-0000-000000000001', 'SEO Basics',                          'video',   6, 20, FALSE),
  ('20000000-0000-0000-0000-000000000001', 'Running Facebook Ads',                'video',   7, 35, FALSE),
  ('20000000-0000-0000-0000-000000000001', 'Final Campaign Project',              'project', 8, 60, FALSE)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Teaching materials
-- ------------------------------------------------------------
INSERT INTO teaching_materials (title, description, subject, grade_level, material_type, file_url, nerdc_aligned, uploaded_by) VALUES
  ('JSS1 Mathematics — Fractions Worksheet',
   '20-question worksheet on fractions with Nigerian market context examples.',
   'Mathematics', 'JSS1', 'worksheet',
   'https://materials.skillbridge.ng/math/jss1-fractions.pdf', TRUE,
   '00000000-0000-0000-0000-000000000001'),

  ('SS2 Economics — Market Systems Slides',
   '35-slide deck on market systems with Nigerian stock exchange case study.',
   'Economics', 'SS2', 'slide',
   'https://materials.skillbridge.ng/economics/ss2-market-systems.pptx', TRUE,
   '00000000-0000-0000-0000-000000000001'),

  ('Primary 5 English — Comprehension Rubric',
   'Assessment rubric for comprehension passages with holistic and analytic scoring.',
   'English', 'Primary 5', 'rubric',
   'https://materials.skillbridge.ng/english/p5-comprehension-rubric.pdf', TRUE,
   '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Job listings
-- ------------------------------------------------------------
INSERT INTO job_listings (id, employer_id, title, description, type, location, required_skills, salary_range, active) VALUES
  ('30000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000004',
   'Junior Digital Marketer',
   'We are looking for a certified digital marketer to manage our social media presence and run paid ads for our textile business.',
   'job', 'Kano',
   '{digital_marketing}',
   '{"min": 60000, "max": 120000, "currency": "NGN"}',
   TRUE),

  ('30000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000004',
   'Solar Tech Apprenticeship',
   '3-month apprenticeship for certified solar installation technicians. Learn advanced off-grid system design.',
   'apprenticeship', 'Kano',
   '{solar_tech}',
   '{"min": 30000, "max": 50000, "currency": "NGN"}',
   TRUE),

  ('30000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000004',
   'Freelance Fashion Designer',
   'Seeking a skilled fashion designer to produce corporate uniform samples. Project-based, remote-friendly.',
   'freelance', 'Kano',
   '{fashion_design}',
   '{"min": 80000, "max": 150000, "currency": "NGN"}',
   TRUE)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Community posts (teacher forum)
-- ------------------------------------------------------------
INSERT INTO community_posts (author_id, title, content, subject, status) VALUES
  ('00000000-0000-0000-0000-000000000002',
   'How I use AI lesson plans in my JSS classroom',
   'I have been using the AI lesson planner for 3 weeks now and it has saved me about 4 hours per week. Here is how I adapt the output for my JSS2 class in Awka...',
   'Digital Skills', 'published'),

  ('00000000-0000-0000-0000-000000000005',
   'Best apps for teaching Yoruba vocabulary',
   'Looking for recommendations from fellow teachers on apps or tools that work well for teaching Yoruba vocabulary to primary school students. Internet access is limited in my school.',
   'Languages', 'published')
ON CONFLICT DO NOTHING;
