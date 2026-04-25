-- Seed data: sample courses for all modules

insert into courses (title, slug, description, category, target_role, duration_weeks, is_free, is_published, is_offline_ready, tags, available_langs) values
-- SkillUp courses (Youth)
('Digital Marketing Fundamentals','digital-marketing-fundamentals','Learn social media marketing, content creation, and paid ads for Nigerian SMEs.','digital_marketing','youth',4,false,true,true,ARRAY['marketing','social-media','business'],ARRAY['en','pcm']::language_code[]),
('Coding Basics: Build Your First Website','coding-basics-web','HTML, CSS and basic JavaScript. Build a real portfolio website by week 4.','coding','youth',6,false,true,true,ARRAY['coding','html','css','javascript'],ARRAY['en','yo']::language_code[]),
('Fashion Design & Small Business Setup','fashion-design-business','Pattern-making, fabric sourcing, pricing, and selling fashion online in Nigeria.','fashion_design','youth',4,false,true,true,ARRAY['fashion','sewing','business'],ARRAY['en','ig','pcm']::language_code[]),
('Solar Installation & Maintenance','solar-installation','Hands-on solar panel installation, wiring, maintenance, and client management.','solar_tech','youth',4,false,true,true,ARRAY['solar','electrical','tech'],ARRAY['en','ha','pcm']::language_code[]),
('Agribusiness: From Farm to Market','agribusiness-farm-to-market','Modern farming techniques, post-harvest handling, and selling agricultural produce.','agribusiness','youth',4,false,true,true,ARRAY['farming','agribusiness','food'],ARRAY['en','yo','ha']::language_code[]),
('Financial Literacy for Young Nigerians','financial-literacy-youth','Budgeting, saving, banking, credit, and starting a business with small capital.','financial_literacy','youth',2,true,true,true,ARRAY['finance','money','business'],ARRAY['en','pcm','yo']::language_code[]),

-- EduPro courses (Teachers)
('Digital Classroom Skills','digital-classroom-skills','Use Google Classroom, WhatsApp, and digital tools to teach effectively.','digital_classroom','teacher',3,false,true,true,ARRAY['teaching','edtech','digital'],ARRAY['en']::language_code[]),
('Vocational Teaching Methods','vocational-teaching-methods','How to teach practical skills in a TVET or vocational classroom.','vocational_teaching','teacher',4,false,true,true,ARRAY['vocational','tvet','pedagogy'],ARRAY['en']::language_code[]),
('Inclusive Education Practices','inclusive-education','Teaching strategies for students with disabilities and diverse learning needs.','inclusive_education','teacher',3,false,true,true,ARRAY['inclusion','disability','teaching'],ARRAY['en']::language_code[]),
('Entrepreneurship Education','entrepreneurship-education','Teach entrepreneurship, financial literacy, and business skills to secondary students.','entrepreneurship','teacher',4,false,true,true,ARRAY['entrepreneurship','business','youth'],ARRAY['en']::language_code[]);

-- Update total lessons count (will be updated as lessons are added)
update courses set total_lessons = 16 where target_role = 'youth' and duration_weeks = 4;
update courses set total_lessons = 8 where target_role = 'youth' and duration_weeks = 2;
update courses set total_lessons = 24 where target_role = 'youth' and duration_weeks = 6;
update courses set total_lessons = 12 where target_role = 'teacher' and duration_weeks = 3;
update courses set total_lessons = 16 where target_role = 'teacher' and duration_weeks = 4;
