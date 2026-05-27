-- ============================================================
-- Migration 013: Populate all SkillUp courses
-- Inserts all 20 courses (matching STATIC_COURSES in web/src/lib/static-courses.ts)
-- Safe to re-run — uses ON CONFLICT (slug) DO NOTHING
-- ============================================================

-- 1. Extend the course_category enum to include Nigerian languages
ALTER TYPE course_category ADD VALUE IF NOT EXISTS 'languages';

-- 2. Insert all Youth SkillUp courses
INSERT INTO courses (
  slug, title, description, category, target_role, language,
  available_langs, duration_weeks, is_free, is_published, is_offline_ready,
  price_ngn, total_lessons, total_enrolled, avg_rating, tags
) VALUES

-- ── Digital Marketing ──────────────────────────────────────────────────────
(
  'digital-marketing-mastery',
  'Digital Marketing Mastery',
  'Master social media ads, SEO, email marketing, and content strategy to grow any business online.',
  'digital_marketing', 'youth', 'en',
  ARRAY['en','yo','pcm']::language_code[],
  4, false, true, true,
  15000, 24, 2400, 4.8,
  ARRAY['marketing','social media']
),
(
  'social-media-management',
  'Social Media Management',
  'Build and manage brand presence on Instagram, TikTok, Facebook and Twitter for clients.',
  'digital_marketing', 'youth', 'en',
  ARRAY['en','pcm']::language_code[],
  3, true, true, true,
  0, 18, 3100, 4.7,
  ARRAY['social media','content']
),
(
  'graphic-design-canva',
  'Graphic Design with Canva & Photoshop',
  'Create logos, flyers, social media posts and brand kits. Earn from freelance design jobs.',
  'digital_marketing', 'youth', 'en',
  ARRAY['en','yo']::language_code[],
  4, false, true, false,
  12000, 26, 1700, 4.8,
  ARRAY['design','canva','creative']
),

-- ── Coding & Tech ─────────────────────────────────────────────────────────
(
  'coding-basics',
  'Coding Basics for Beginners',
  'Learn HTML, CSS and JavaScript from scratch. Build real websites and earn as a freelance developer.',
  'coding', 'youth', 'en',
  ARRAY['en','yo','ig']::language_code[],
  6, false, true, true,
  20000, 36, 1800, 4.9,
  ARRAY['coding','web','javascript']
),
(
  'python-data-skills',
  'Python & Data Skills',
  'Learn Python programming and basic data analysis. In-demand skills for tech and finance sectors.',
  'coding', 'youth', 'en',
  ARRAY['en']::language_code[],
  8, false, true, false,
  25000, 40, 950, 4.8,
  ARRAY['python','data','tech']
),

-- ── Fashion Design ────────────────────────────────────────────────────────
(
  'fashion-design-fundamentals',
  'Fashion Design & Tailoring',
  'From pattern drafting to garment construction. Launch your own fashion brand in Nigeria.',
  'fashion_design', 'youth', 'en',
  ARRAY['en','ig','yo']::language_code[],
  6, false, true, true,
  12000, 30, 2200, 4.9,
  ARRAY['fashion','sewing','business']
),

-- ── Solar Technology ──────────────────────────────────────────────────────
(
  'solar-installation-tech',
  'Solar Panel Installation',
  'Install, wire and maintain solar power systems. High-demand trade across Nigeria.',
  'solar_tech', 'youth', 'en',
  ARRAY['en','ha','yo']::language_code[],
  5, false, true, true,
  18000, 28, 1600, 4.7,
  ARRAY['solar','electrical','trade']
),

-- ── Agribusiness (existing) ───────────────────────────────────────────────
(
  'agribusiness-fundamentals',
  'Agribusiness Fundamentals',
  'Turn farming into a profitable business. Covers crop production, poultry, fish farming and marketing.',
  'agribusiness', 'youth', 'en',
  ARRAY['en','ha','ig','yo']::language_code[],
  4, true, true, true,
  0, 20, 4100, 4.8,
  ARRAY['farming','agriculture','business']
),

-- ── Agribusiness (new — NERDC aligned) ────────────────────────────────────
(
  'poultry-fish-farming',
  'Poultry & Fish Farming',
  'Master profitable layers, broilers and fish (catfish & tilapia) production. Covers housing, feeding, health management, biosecurity and marketing. NERDC Agricultural Science aligned.',
  'agribusiness', 'youth', 'en',
  ARRAY['en','ha','ig','yo']::language_code[],
  6, false, true, true,
  15000, 36, 1250, 4.8,
  ARRAY['poultry','fish farming','agriculture','livestock']
),
(
  'agribusiness-management',
  'Agribusiness Management',
  'Business and financial management for farmers and agro-entrepreneurs. Covers farm planning, agri-finance, cooperative societies, agricultural marketing and policy. NERDC aligned.',
  'agribusiness', 'youth', 'en',
  ARRAY['en','ha','ig','yo']::language_code[],
  5, false, true, true,
  18000, 30, 980, 4.7,
  ARRAY['agribusiness','farm management','agricultural finance','cooperative']
),
(
  'food-processing-value-addition',
  'Food Processing & Value Addition',
  'Transform raw farm produce into profitable products. Covers post-harvest management, processing technologies, food safety, NAFDAC registration and brand building. NERDC aligned.',
  'agribusiness', 'youth', 'en',
  ARRAY['en','ig','yo','pcm']::language_code[],
  5, false, true, true,
  12000, 30, 1450, 4.8,
  ARRAY['food processing','value addition','NAFDAC','packaging','post-harvest']
),
(
  'horticulture-urban-markets',
  'Horticulture: Vegetables for Urban Markets',
  'Grow high-value vegetables and fruits (ugwu, tomatoes, onion, pepper, carrot) for urban consumers. Covers soil prep, crop management, pest control and market access. NERDC aligned.',
  'agribusiness', 'youth', 'en',
  ARRAY['en','yo','ig']::language_code[],
  5, true, true, true,
  0, 30, 2100, 4.9,
  ARRAY['horticulture','vegetable farming','urban agriculture','market gardening']
),
(
  'irrigation-farming-dry-season',
  'Irrigation Farming: Dry Season Crops',
  'Farm profitably year-round using irrigation. Learn water sourcing, drip and sprinkler irrigation setup, dry season crop calendars, water management and business planning. NERDC aligned.',
  'agribusiness', 'youth', 'en',
  ARRAY['en','ha','ig']::language_code[],
  5, false, true, true,
  12000, 30, 760, 4.7,
  ARRAY['irrigation','dry season farming','water management','fadama']
),

-- ── Financial Literacy ────────────────────────────────────────────────────
(
  'financial-literacy-nigeria',
  'Financial Literacy & Money Management',
  'Budgeting, saving, investing and avoiding debt. Essential money skills for every Nigerian.',
  'financial_literacy', 'youth', 'en',
  ARRAY['en','pcm','yo']::language_code[],
  3, true, true, true,
  0, 15, 5200, 4.9,
  ARRAY['finance','savings','investing']
),

-- ── Entrepreneurship ──────────────────────────────────────────────────────
(
  'entrepreneurship-nigeria',
  'Entrepreneurship & Business Launch',
  'Validate your idea, register your business, get funding and scale in the Nigerian market.',
  'entrepreneurship', 'youth', 'en',
  ARRAY['en','pcm']::language_code[],
  4, false, true, true,
  10000, 22, 3300, 4.7,
  ARRAY['business','startup','SME']
),
(
  'catering-food-business',
  'Catering & Food Business',
  'Start a profitable catering or food delivery business. Learn recipes, pricing and marketing.',
  'entrepreneurship', 'youth', 'en',
  ARRAY['en','ig','yo']::language_code[],
  3, false, true, true,
  8000, 16, 2800, 4.6,
  ARRAY['food','catering','business']
),
(
  'logistics-supply-chain',
  'Logistics & Supply Chain Basics',
  'Understand how goods move from producer to consumer. Work with top logistics companies in Nigeria.',
  'entrepreneurship', 'youth', 'en',
  ARRAY['en']::language_code[],
  3, false, true, false,
  10000, 18, 820, 4.5,
  ARRAY['logistics','supply chain','operations']
),

-- ── Nigerian Languages ────────────────────────────────────────────────────
(
  'yoruba-language-teaching',
  'Yoruba Language: Speak, Read & Teach',
  'Master Yoruba tones, grammar, proverbs and literature. Ideal for teachers, heritage speakers and anyone who wants to connect with Yoruba culture.',
  'languages', 'youth', 'yo',
  ARRAY['yo','en']::language_code[],
  5, false, true, true,
  10000, 37, 1850, 4.9,
  ARRAY['yoruba','language','culture','teaching']
),
(
  'igbo-language-teaching',
  'Igbo Language: Speak, Read & Teach',
  'Learn Igbo alphabet, tones, grammar, proverbs and oral traditions. Perfect for teachers, the diaspora and learners reconnecting with Igbo identity.',
  'languages', 'youth', 'ig',
  ARRAY['ig','en']::language_code[],
  5, false, true, true,
  10000, 37, 1620, 4.8,
  ARRAY['igbo','language','culture','teaching']
),
(
  'hausa-language-teaching',
  'Hausa Language: Speak, Read & Teach',
  'Learn Hausa pronunciation, grammar, literature and proverbs. A vital language of trade and education across northern Nigeria and West Africa.',
  'languages', 'youth', 'ha',
  ARRAY['ha','en']::language_code[],
  5, false, true, true,
  10000, 37, 1430, 4.8,
  ARRAY['hausa','language','culture','teaching']
)

ON CONFLICT (slug) DO UPDATE SET
  title          = EXCLUDED.title,
  description    = EXCLUDED.description,
  is_published   = EXCLUDED.is_published,
  total_lessons  = EXCLUDED.total_lessons,
  total_enrolled = EXCLUDED.total_enrolled,
  avg_rating     = EXCLUDED.avg_rating,
  tags           = EXCLUDED.tags,
  price_ngn      = EXCLUDED.price_ngn,
  is_free        = EXCLUDED.is_free,
  available_langs= EXCLUDED.available_langs,
  updated_at     = now();
