export interface CurriculumLesson {
  id: string
  title: string
  duration_mins: number
  order_index: number
  is_free_preview: boolean
  youtube_url?: string   // full YouTube URL, e.g. https://www.youtube.com/watch?v=VIDEO_ID
}

export interface CurriculumModule {
  id: string
  title: string
  order_index: number
  lessons: CurriculumLesson[]
}

function lesson(
  id: string, title: string, duration_mins: number,
  order_index: number, is_free_preview = false, youtube_url?: string
): CurriculumLesson {
  return { id, title, duration_mins, order_index, is_free_preview, youtube_url }
}

function mod(
  id: string, title: string, order_index: number,
  lessons: CurriculumLesson[]
): CurriculumModule {
  return { id, title, order_index, lessons }
}

export const COURSE_CURRICULUM: Record<string, CurriculumModule[]> = {

  /* ─────────────────────────────────────────────────── */
  'digital-marketing-mastery': [
    mod('dmm-m1', 'Foundations of Digital Marketing', 1, [
      lesson('dmm-m1-l1', 'What is Digital Marketing?', 15, 1, true, 'https://www.youtube.com/watch?v=bixR-KIJKYM'),
      lesson('dmm-m1-l2', 'The Nigerian Digital Landscape in 2025', 15, 2),
      lesson('dmm-m1-l3', 'Understanding Your Target Audience', 20, 3),
      lesson('dmm-m1-l4', 'Key Digital Marketing Channels', 20, 4),
      lesson('dmm-m1-l5', 'Setting Up Your Marketing Toolkit', 15, 5),
      lesson('dmm-m1-l6', 'Building a Digital Brand Identity', 20, 6),
    ]),
    mod('dmm-m2', 'Social Media Marketing', 2, [
      lesson('dmm-m2-l1', 'Instagram for Business', 20, 1, true),
      lesson('dmm-m2-l2', 'Facebook & Meta Ads for Nigerian Businesses', 25, 2),
      lesson('dmm-m2-l3', 'Twitter / X Marketing Strategy', 20, 3),
      lesson('dmm-m2-l4', 'TikTok & Short-Form Video Marketing', 20, 4),
      lesson('dmm-m2-l5', 'WhatsApp Business Marketing', 20, 5),
      lesson('dmm-m2-l6', 'Creating Viral Content', 25, 6),
    ]),
    mod('dmm-m3', 'SEO & Content Strategy', 3, [
      lesson('dmm-m3-l1', 'Introduction to SEO', 20, 1, true),
      lesson('dmm-m3-l2', 'Keyword Research for Nigerian Markets', 25, 2),
      lesson('dmm-m3-l3', 'On-Page SEO Techniques', 20, 3),
      lesson('dmm-m3-l4', 'Content Marketing Strategy', 25, 4),
      lesson('dmm-m3-l5', 'Blogging for Business Growth', 20, 5),
      lesson('dmm-m3-l6', 'Email Marketing Basics', 20, 6),
    ]),
    mod('dmm-m4', 'Ads, Analytics & Getting Clients', 4, [
      lesson('dmm-m4-l1', 'Google Ads for Beginners', 25, 1, true),
      lesson('dmm-m4-l2', 'Running Facebook Ad Campaigns', 25, 2),
      lesson('dmm-m4-l3', 'Reading Marketing Analytics', 20, 3),
      lesson('dmm-m4-l4', 'Campaign Optimisation & A/B Testing', 25, 4),
      lesson('dmm-m4-l5', 'Pricing Your Marketing Services', 20, 5),
      lesson('dmm-m4-l6', 'Building Your Portfolio & Getting Clients', 30, 6),
    ]),
  ],

  /* ─────────────────────────────────────────────────── */
  'social-media-management': [
    mod('smm-m1', 'Platform Mastery', 1, [
      lesson('smm-m1-l1', 'Understanding Social Media Algorithms', 15, 1, true, 'https://www.youtube.com/watch?v=F6GaYMkGzzg'),
      lesson('smm-m1-l2', 'Instagram Growth Strategy', 20, 2),
      lesson('smm-m1-l3', 'Facebook Page Management', 20, 3),
      lesson('smm-m1-l4', 'Twitter / X for Brands', 15, 4),
      lesson('smm-m1-l5', 'LinkedIn for B2B & Professionals', 20, 5),
      lesson('smm-m1-l6', 'TikTok Content Creation', 20, 6),
    ]),
    mod('smm-m2', 'Content Creation & Scheduling', 2, [
      lesson('smm-m2-l1', 'Developing a Content Calendar', 20, 1, true),
      lesson('smm-m2-l2', 'Writing Engaging Captions', 15, 2),
      lesson('smm-m2-l3', 'Designing Visual Content with Canva', 25, 3),
      lesson('smm-m2-l4', 'Shooting & Editing Short Videos', 25, 4),
      lesson('smm-m2-l5', 'Hashtag Research Strategy', 15, 5),
      lesson('smm-m2-l6', 'Content Scheduling Tools (Buffer, Later)', 20, 6),
    ]),
    mod('smm-m3', 'Client Management & Growth', 3, [
      lesson('smm-m3-l1', 'Finding Social Media Management Clients', 20, 1, true),
      lesson('smm-m3-l2', 'Client Onboarding & Reporting', 20, 2),
      lesson('smm-m3-l3', 'Community Management & Engagement', 20, 3),
      lesson('smm-m3-l4', 'Influencer & Creator Partnerships', 20, 4),
      lesson('smm-m3-l5', 'Running Paid Social Campaigns for Clients', 25, 5),
      lesson('smm-m3-l6', 'Scaling to a Social Media Agency', 30, 6),
    ]),
  ],

  /* ─────────────────────────────────────────────────── */
  'coding-basics': [
    mod('cb-m1', 'HTML Fundamentals', 1, [
      lesson('cb-m1-l1', 'What is Coding? Your First Webpage', 15, 1, true, 'https://www.youtube.com/watch?v=UB1O30fR-EE'),
      lesson('cb-m1-l2', 'Setting Up VS Code & Your Workspace', 20, 2),
      lesson('cb-m1-l3', 'HTML Tags, Structure & Headings', 25, 3),
      lesson('cb-m1-l4', 'Links, Images & Media', 20, 4),
      lesson('cb-m1-l5', 'HTML Forms & Inputs', 20, 5),
      lesson('cb-m1-l6', 'Tables, Lists & Semantic HTML', 20, 6),
      lesson('cb-m1-l7', 'Project: Build Your Personal HTML Page', 30, 7),
    ]),
    mod('cb-m2', 'CSS Styling', 2, [
      lesson('cb-m2-l1', 'Introduction to CSS', 15, 1, true),
      lesson('cb-m2-l2', 'Colours, Fonts & Text Styling', 20, 2),
      lesson('cb-m2-l3', 'The Box Model (Margin, Padding, Border)', 25, 3),
      lesson('cb-m2-l4', 'Flexbox Layout', 25, 4),
      lesson('cb-m2-l5', 'CSS Grid', 25, 5),
      lesson('cb-m2-l6', 'Responsive Design & Media Queries', 25, 6),
      lesson('cb-m2-l7', 'Project: Style Your Personal Page', 30, 7),
    ]),
    mod('cb-m3', 'JavaScript Basics', 3, [
      lesson('cb-m3-l1', 'Introduction to JavaScript', 20, 1, true),
      lesson('cb-m3-l2', 'Variables, Data Types & Operators', 20, 2),
      lesson('cb-m3-l3', 'Functions, Loops & Conditionals', 25, 3),
      lesson('cb-m3-l4', 'DOM Manipulation — Change Page Elements', 25, 4),
      lesson('cb-m3-l5', 'Events & User Interactions', 25, 5),
      lesson('cb-m3-l6', 'Fetch API — Load Data from the Internet', 25, 6),
      lesson('cb-m3-l7', 'Project: Build a Quiz App', 30, 7),
    ]),
    mod('cb-m4', 'Launch & Earn', 4, [
      lesson('cb-m4-l1', 'Git Version Control & GitHub', 20, 1, true),
      lesson('cb-m4-l2', 'Deploying to GitHub Pages — Free Hosting', 20, 2),
      lesson('cb-m4-l3', 'Making Money as a Freelance Developer', 25, 3),
      lesson('cb-m4-l4', 'Building Your Developer Portfolio', 25, 4),
      lesson('cb-m4-l5', 'Finding Clients on Upwork & Fiverr', 20, 5),
      lesson('cb-m4-l6', 'Final Project: Full Personal Website', 30, 6),
      lesson('cb-m4-l7', 'Course Review & Certification', 20, 7),
    ]),
  ],

  /* ─────────────────────────────────────────────────── */
  'python-data-skills': [
    mod('pds-m1', 'Python Foundations', 1, [
      lesson('pds-m1-l1', 'Why Python? Installing & Running Code', 20, 1, true, 'https://www.youtube.com/watch?v=rfscVS0vtbw'),
      lesson('pds-m1-l2', 'Variables, Strings & Numbers', 20, 2),
      lesson('pds-m1-l3', 'Lists, Tuples & Dictionaries', 25, 3),
      lesson('pds-m1-l4', 'If/Else Statements & Logic', 20, 4),
      lesson('pds-m1-l5', 'Loops: For & While', 25, 5),
      lesson('pds-m1-l6', 'Functions & Modules', 25, 6),
      lesson('pds-m1-l7', 'Reading & Writing Files', 20, 7),
      lesson('pds-m1-l8', 'Error Handling with Try/Except', 20, 8),
      lesson('pds-m1-l9', 'Project: Build a Simple Calculator', 30, 9),
      lesson('pds-m1-l10', 'Python Basics Review & Quiz', 20, 10),
    ]),
    mod('pds-m2', 'Data Analysis with Pandas', 2, [
      lesson('pds-m2-l1', 'Introduction to Data Science', 20, 1, true),
      lesson('pds-m2-l2', 'NumPy: Numerical Computing Basics', 25, 2),
      lesson('pds-m2-l3', 'Pandas: Loading & Exploring Datasets', 25, 3),
      lesson('pds-m2-l4', 'Cleaning & Transforming Data', 25, 4),
      lesson('pds-m2-l5', 'Filtering, Grouping & Aggregating', 25, 5),
      lesson('pds-m2-l6', 'Merging & Joining DataFrames', 25, 6),
      lesson('pds-m2-l7', 'Analysing Nigerian Economic Data', 30, 7),
      lesson('pds-m2-l8', 'Project: Analyse a Real Nigerian Dataset', 35, 8),
      lesson('pds-m2-l9', 'Pandas Review & Best Practices', 20, 9),
      lesson('pds-m2-l10', 'Mid-Course Assessment', 25, 10),
    ]),
    mod('pds-m3', 'Data Visualisation', 3, [
      lesson('pds-m3-l1', 'Introduction to Matplotlib', 20, 1, true),
      lesson('pds-m3-l2', 'Bar Charts, Line Charts & Histograms', 25, 2),
      lesson('pds-m3-l3', 'Seaborn: Beautiful Statistical Charts', 25, 3),
      lesson('pds-m3-l4', 'Interactive Charts with Plotly', 25, 4),
      lesson('pds-m3-l5', 'Storytelling with Data', 25, 5),
      lesson('pds-m3-l6', 'Building a Data Dashboard', 30, 6),
      lesson('pds-m3-l7', 'Visualising Nigerian Business Data', 30, 7),
      lesson('pds-m3-l8', 'Project: Present Insights as a Report', 35, 8),
      lesson('pds-m3-l9', 'Visualisation Review & Quiz', 20, 9),
    ]),
    mod('pds-m4', 'Career in Data & Freelancing', 4, [
      lesson('pds-m4-l1', 'Machine Learning: A Gentle Introduction', 20, 1, true),
      lesson('pds-m4-l2', 'Building Your First ML Model', 30, 2),
      lesson('pds-m4-l3', 'Data Analyst vs Data Scientist — Which Path?', 20, 3),
      lesson('pds-m4-l4', 'Building a Data Portfolio on GitHub', 25, 4),
      lesson('pds-m4-l5', 'Freelancing as a Data Analyst in Nigeria', 25, 5),
      lesson('pds-m4-l6', 'SQL Basics for Data Analysts', 25, 6),
      lesson('pds-m4-l7', 'Final Project: End-to-End Data Analysis', 45, 7),
      lesson('pds-m4-l8', 'Course Wrap-Up & Certification', 20, 8),
    ]),
  ],

  /* ─────────────────────────────────────────────────── */
  'fashion-design-fundamentals': [
    mod('fdf-m1', 'Design Basics & Materials', 1, [
      lesson('fdf-m1-l1', 'Introduction to Fashion Design in Nigeria', 15, 1, true, 'https://www.youtube.com/watch?v=q-P-4sjHZ4c'),
      lesson('fdf-m1-l2', 'Fabrics: Ankara, Lace, Aso-oke & More', 20, 2),
      lesson('fdf-m1-l3', 'Taking Body Measurements Accurately', 20, 3),
      lesson('fdf-m1-l4', 'Essential Sewing Tools & Their Uses', 20, 4),
      lesson('fdf-m1-l5', 'Sketching & Fashion Illustration Basics', 25, 5),
      lesson('fdf-m1-l6', 'Colour Theory & Pattern Selection', 20, 6),
      lesson('fdf-m1-l7', 'Setting Up Your Workspace & Equipment', 15, 7),
    ]),
    mod('fdf-m2', 'Pattern Making & Cutting', 2, [
      lesson('fdf-m2-l1', 'Understanding Dress Patterns', 20, 1, true),
      lesson('fdf-m2-l2', 'Drafting a Basic Bodice Block', 30, 2),
      lesson('fdf-m2-l3', 'Drafting Skirt & Trouser Patterns', 30, 3),
      lesson('fdf-m2-l4', 'Grading Patterns for Different Sizes', 25, 4),
      lesson('fdf-m2-l5', 'Fabric Cutting Techniques', 25, 5),
      lesson('fdf-m2-l6', 'Adapting Patterns for Nigerian Styles', 25, 6),
      lesson('fdf-m2-l7', 'Project: Draft Your First Pattern', 30, 7),
    ]),
    mod('fdf-m3', 'Sewing & Construction', 3, [
      lesson('fdf-m3-l1', 'Sewing Machine Basics & Maintenance', 20, 1, true),
      lesson('fdf-m3-l2', 'Stitching Techniques — Seams & Hems', 25, 2),
      lesson('fdf-m3-l3', 'Sewing a Native Outfit (Buba & Skirt)', 35, 3),
      lesson('fdf-m3-l4', 'Sewing Western Styles & Corporate Wear', 35, 4),
      lesson('fdf-m3-l5', 'Zips, Buttons & Fasteners', 20, 5),
      lesson('fdf-m3-l6', 'Finishing Techniques & Quality Control', 25, 6),
      lesson('fdf-m3-l7', 'Project: Complete a Full Garment', 45, 7),
      lesson('fdf-m3-l8', 'Beading, Embroidery & Embellishments', 25, 8),
    ]),
    mod('fdf-m4', 'Business & Brand Building', 4, [
      lesson('fdf-m4-l1', 'Pricing Your Work for Profit', 20, 1, true),
      lesson('fdf-m4-l2', 'Registering Your Fashion Business in Nigeria', 20, 2),
      lesson('fdf-m4-l3', 'Photography for Fashion — Using Your Phone', 20, 3),
      lesson('fdf-m4-l4', 'Selling on Instagram & WhatsApp', 20, 4),
      lesson('fdf-m4-l5', 'Getting Orders from Corporate Clients', 20, 5),
      lesson('fdf-m4-l6', 'Managing Clients & Delivery Deadlines', 20, 6),
      lesson('fdf-m4-l7', 'Scaling — Hiring Apprentices', 20, 7),
      lesson('fdf-m4-l8', 'Final Project: Full Collection Lookbook', 30, 8),
    ]),
  ],

  /* ─────────────────────────────────────────────────── */
  'solar-installation-tech': [
    mod('sit-m1', 'Solar Energy Fundamentals', 1, [
      lesson('sit-m1-l1', 'How Solar Energy Works', 20, 1, true, 'https://www.youtube.com/watch?v=xKxrkht7CpY'),
      lesson('sit-m1-l2', 'Types of Solar Systems (On-Grid, Off-Grid, Hybrid)', 20, 2),
      lesson('sit-m1-l3', 'Nigeria\'s Energy Crisis & Solar Opportunity', 15, 3),
      lesson('sit-m1-l4', 'Solar Panel Types & Efficiency Ratings', 25, 4),
      lesson('sit-m1-l5', 'Reading & Interpreting Solar Specs', 20, 5),
      lesson('sit-m1-l6', 'Safety Rules for Electrical Work', 20, 6),
      lesson('sit-m1-l7', 'Tools Every Solar Installer Needs', 15, 7),
    ]),
    mod('sit-m2', 'System Components & Design', 2, [
      lesson('sit-m2-l1', 'Solar Panels — Selection & Sizing', 25, 1, true),
      lesson('sit-m2-l2', 'Batteries — Deep Cycle & Lithium-Ion', 25, 2),
      lesson('sit-m2-l3', 'Charge Controllers — PWM vs MPPT', 25, 3),
      lesson('sit-m2-l4', 'Inverters — Pure Sine vs Modified Sine', 25, 4),
      lesson('sit-m2-l5', 'Load Assessment — Calculating Energy Needs', 30, 5),
      lesson('sit-m2-l6', 'System Sizing for a Nigerian Home', 30, 6),
      lesson('sit-m2-l7', 'Drawing Wiring Diagrams', 25, 7),
    ]),
    mod('sit-m3', 'Installation & Wiring', 3, [
      lesson('sit-m3-l1', 'Mounting Solar Panels on Rooftops', 30, 1, true),
      lesson('sit-m3-l2', 'Wiring Panels in Series & Parallel', 30, 2),
      lesson('sit-m3-l3', 'Connecting the Battery Bank', 25, 3),
      lesson('sit-m3-l4', 'Installing the Charge Controller', 25, 4),
      lesson('sit-m3-l5', 'Inverter Connection & AC Wiring', 25, 5),
      lesson('sit-m3-l6', 'Testing & Commissioning a System', 30, 6),
      lesson('sit-m3-l7', 'Project: Full System Installation Simulation', 45, 7),
    ]),
    mod('sit-m4', 'Maintenance & Business', 4, [
      lesson('sit-m4-l1', 'Troubleshooting Common Solar Problems', 25, 1, true),
      lesson('sit-m4-l2', 'Preventive Maintenance Schedule', 20, 2),
      lesson('sit-m4-l3', 'Fault Finding with a Multimeter', 25, 3),
      lesson('sit-m4-l4', 'Pricing Solar Installations in Nigeria', 25, 4),
      lesson('sit-m4-l5', 'Getting Certified by NAFDAC/NEMSA', 20, 5),
      lesson('sit-m4-l6', 'Building a Solar Installation Business', 25, 6),
      lesson('sit-m4-l7', 'Final Assessment & Certification', 30, 7),
    ]),
  ],

  /* ─────────────────────────────────────────────────── */
  'agribusiness-fundamentals': [
    mod('ab-m1', 'Modern Farming Basics', 1, [
      lesson('ab-m1-l1', 'Agriculture as a Business, Not a Subsistence', 15, 1, true, 'https://www.youtube.com/watch?v=pJm5c8-sJXA'),
      lesson('ab-m1-l2', 'Understanding Nigerian Farming Seasons & Climate Zones', 20, 2),
      lesson('ab-m1-l3', 'Soil Health & Fertility Management', 20, 3),
      lesson('ab-m1-l4', 'Water Management & Irrigation for SME Farmers', 20, 4),
      lesson('ab-m1-l5', 'Sourcing Quality Seeds & Inputs', 15, 5),
    ]),
    mod('ab-m2', 'Crop & Livestock Production', 2, [
      lesson('ab-m2-l1', 'High-Value Crops: Maize, Tomatoes, Cassava', 20, 1, true),
      lesson('ab-m2-l2', 'Poultry Farming for Profit', 25, 2),
      lesson('ab-m2-l3', 'Fish Farming (Catfish & Tilapia)', 25, 3),
      lesson('ab-m2-l4', 'Snail & Mushroom Farming — Low Capital Options', 20, 4),
      lesson('ab-m2-l5', 'Pest & Disease Control', 20, 5),
    ]),
    mod('ab-m3', 'Agribusiness Finance', 3, [
      lesson('ab-m3-l1', 'Costing & Budgeting for Farming', 20, 1, true),
      lesson('ab-m3-l2', 'Accessing CBN & State Agricultural Grants', 20, 2),
      lesson('ab-m3-l3', 'Cooperative Farming & Group Finance', 15, 3),
      lesson('ab-m3-l4', 'Keeping Farm Records & Financial Statements', 20, 4),
      lesson('ab-m3-l5', 'Break-Even Analysis for Your Farm', 20, 5),
    ]),
    mod('ab-m4', 'Marketing & Supply Chain', 4, [
      lesson('ab-m4-l1', 'Finding Buyers: Markets, Hotels & Supermarkets', 20, 1, true),
      lesson('ab-m4-l2', 'Value Addition — Processing & Packaging', 25, 2),
      lesson('ab-m4-l3', 'Selling Agro Products Online', 20, 3),
      lesson('ab-m4-l4', 'Reducing Post-Harvest Losses', 20, 4),
      lesson('ab-m4-l5', 'Building Your Agribusiness Brand', 20, 5),
    ]),
  ],

  /* ─────────────────────────────────────────────────── */
  'financial-literacy-nigeria': [
    mod('fl-m1', 'Money Mindset & Foundations', 1, [
      lesson('fl-m1-l1', 'Why Most Nigerians Struggle with Money', 15, 1, true, 'https://www.youtube.com/watch?v=HQzoZfc3GwQ'),
      lesson('fl-m1-l2', 'Income Types: Salary, Business, Passive Income', 20, 2),
      lesson('fl-m1-l3', 'Understanding Needs vs. Wants', 15, 3),
      lesson('fl-m1-l4', 'Setting SMART Financial Goals', 20, 4),
      lesson('fl-m1-l5', 'The Power of Compound Interest', 15, 5),
    ]),
    mod('fl-m2', 'Budgeting, Saving & Debt', 2, [
      lesson('fl-m2-l1', 'Creating a Monthly Budget on Any Income', 20, 1, true),
      lesson('fl-m2-l2', 'The 50/30/20 Budget Rule Adapted for Nigeria', 15, 2),
      lesson('fl-m2-l3', 'Building an Emergency Fund', 20, 3),
      lesson('fl-m2-l4', 'Good Debt vs. Bad Debt', 20, 4),
      lesson('fl-m2-l5', 'Escaping the Loan Trap — Esusu & Ajo Alternatives', 20, 5),
    ]),
    mod('fl-m3', 'Investing & Growing Wealth', 3, [
      lesson('fl-m3-l1', 'Introduction to Investing in Nigeria', 20, 1, true),
      lesson('fl-m3-l2', 'Nigerian Stock Exchange & How to Buy Stocks', 25, 2),
      lesson('fl-m3-l3', 'Treasury Bills, Bonds & Fixed Income', 20, 3),
      lesson('fl-m3-l4', 'Real Estate Investment for Nigerians', 20, 4),
      lesson('fl-m3-l5', 'Building Multiple Streams of Income', 25, 5),
    ]),
  ],

  /* ─────────────────────────────────────────────────── */
  'entrepreneurship-nigeria': [
    mod('en-m1', 'The Entrepreneur Mindset', 1, [
      lesson('en-m1-l1', 'What Makes a Successful Nigerian Entrepreneur?', 15, 1, true, 'https://www.youtube.com/watch?v=ZoqgAy3h4DM'),
      lesson('en-m1-l2', 'Identifying Problems Worth Solving', 20, 2),
      lesson('en-m1-l3', 'From Idea to Opportunity — The Validation Test', 20, 3),
      lesson('en-m1-l4', 'Building Resilience & Managing Failure', 15, 4),
      lesson('en-m1-l5', 'Nigerian Success Stories to Learn From', 15, 5),
    ]),
    mod('en-m2', 'Business Planning & Validation', 2, [
      lesson('en-m2-l1', 'Writing a One-Page Business Plan', 20, 1, true),
      lesson('en-m2-l2', 'Market Research in Nigerian Contexts', 25, 2),
      lesson('en-m2-l3', 'Defining Your Unique Value Proposition', 20, 3),
      lesson('en-m2-l4', 'Your First 100 Customers Strategy', 20, 4),
      lesson('en-m2-l5', 'Minimum Viable Product (MVP) — Build Small, Learn Fast', 20, 5),
      lesson('en-m2-l6', 'Competitive Analysis — Know Your Market', 20, 6),
    ]),
    mod('en-m3', 'Finance & Funding', 3, [
      lesson('en-m3-l1', 'Bootstrapping vs. Raising Capital', 20, 1, true),
      lesson('en-m3-l2', 'Nigerian Grants & Loans: SMEDAN, BOI, TEF', 25, 2),
      lesson('en-m3-l3', 'Business Banking & Opening a Corporate Account', 15, 3),
      lesson('en-m3-l4', 'Pricing for Profit — Not Just Revenue', 20, 4),
      lesson('en-m3-l5', 'Reading a Profit & Loss Statement', 20, 5),
    ]),
    mod('en-m4', 'Growth & Scale', 4, [
      lesson('en-m4-l1', 'Registering with CAC — Step by Step', 20, 1, true),
      lesson('en-m4-l2', 'Building a Sales System', 25, 2),
      lesson('en-m4-l3', 'Hiring Your First Team Member', 20, 3),
      lesson('en-m4-l4', 'Digital Tools to Run a Lean Business', 20, 4),
      lesson('en-m4-l5', 'Exporting Nigerian Products — Global Opportunities', 20, 5),
      lesson('en-m4-l6', 'Pitching to Investors & Competitions', 25, 6),
    ]),
  ],

  /* ─────────────────────────────────────────────────── */
  'graphic-design-canva': [
    mod('gdc-m1', 'Design Fundamentals', 1, [
      lesson('gdc-m1-l1', 'What Makes a Great Design?', 15, 1, true, 'https://www.youtube.com/watch?v=qB2H5Q62s-Y'),
      lesson('gdc-m1-l2', 'Colour Theory & Psychology', 20, 2),
      lesson('gdc-m1-l3', 'Typography — Choosing & Pairing Fonts', 20, 3),
      lesson('gdc-m1-l4', 'Layout, Balance & White Space', 20, 4),
      lesson('gdc-m1-l5', 'Branding Basics — Logo, Colours & Voice', 25, 5),
      lesson('gdc-m1-l6', 'Project: Create a Mood Board', 20, 6),
    ]),
    mod('gdc-m2', 'Canva Mastery', 2, [
      lesson('gdc-m2-l1', 'Canva Interface & Essential Features', 15, 1, true),
      lesson('gdc-m2-l2', 'Social Media Graphics & Story Templates', 25, 2),
      lesson('gdc-m2-l3', 'Designing Flyers & Posters for Nigerian Events', 25, 3),
      lesson('gdc-m2-l4', 'Business Cards, Letterheads & Stationery', 20, 4),
      lesson('gdc-m2-l5', 'Canva Presentations & Pitch Decks', 20, 5),
      lesson('gdc-m2-l6', 'Canva Video & Animated Posts', 20, 6),
      lesson('gdc-m2-l7', 'Project: Complete Brand Kit in Canva', 30, 7),
    ]),
    mod('gdc-m3', 'Photoshop & Advanced Editing', 3, [
      lesson('gdc-m3-l1', 'Photoshop Interface & Layers', 20, 1, true),
      lesson('gdc-m3-l2', 'Selection Tools & Removing Backgrounds', 25, 2),
      lesson('gdc-m3-l3', 'Photo Retouching & Colour Correction', 25, 3),
      lesson('gdc-m3-l4', 'Creating Mockups for Products', 25, 4),
      lesson('gdc-m3-l5', 'Typography Effects in Photoshop', 25, 5),
      lesson('gdc-m3-l6', 'Exporting for Print vs Digital', 15, 6),
      lesson('gdc-m3-l7', 'Project: Product Packaging Design', 30, 7),
    ]),
    mod('gdc-m4', 'Freelance Design Career', 4, [
      lesson('gdc-m4-l1', 'Building a Design Portfolio', 20, 1, true),
      lesson('gdc-m4-l2', 'Pricing Your Design Services', 20, 2),
      lesson('gdc-m4-l3', 'Finding Clients on Fiverr, Instagram & LinkedIn', 20, 3),
      lesson('gdc-m4-l4', 'Managing Client Feedback & Revisions', 15, 4),
      lesson('gdc-m4-l5', 'Contracts & Getting Paid on Time', 15, 5),
      lesson('gdc-m4-l6', 'Scaling to a Design Studio', 20, 6),
    ]),
  ],

  /* ─────────────────────────────────────────────────── */
  'catering-food-business': [
    mod('cfb-m1', 'Food Business Foundations', 1, [
      lesson('cfb-m1-l1', 'Is a Food Business Right for You?', 15, 1, true, 'https://www.youtube.com/watch?v=EUXnJraKM3k'),
      lesson('cfb-m1-l2', 'Nigerian Food Market Opportunities', 20, 2),
      lesson('cfb-m1-l3', 'Food Safety, Hygiene & NAFDAC Basics', 20, 3),
      lesson('cfb-m1-l4', 'Choosing Your Food Business Model', 20, 4),
    ]),
    mod('cfb-m2', 'Recipes, Menus & Costing', 2, [
      lesson('cfb-m2-l1', 'Building a Profitable Menu', 20, 1, true),
      lesson('cfb-m2-l2', 'Food Costing — Price Right for Profit', 25, 2),
      lesson('cfb-m2-l3', 'Scaling Recipes from Home to Bulk', 20, 3),
      lesson('cfb-m2-l4', 'Specialty Diets & Modern Nigerian Cuisine', 20, 4),
    ]),
    mod('cfb-m3', 'Kitchen Operations & Delivery', 3, [
      lesson('cfb-m3-l1', 'Setting Up a Commercial Kitchen on a Budget', 20, 1, true),
      lesson('cfb-m3-l2', 'Equipment Sourcing & Maintenance', 20, 2),
      lesson('cfb-m3-l3', 'Packaging, Branding & Presentation', 20, 3),
      lesson('cfb-m3-l4', 'Working with Food Delivery Platforms', 20, 4),
    ]),
    mod('cfb-m4', 'Marketing & Business Growth', 4, [
      lesson('cfb-m4-l1', 'Instagram & WhatsApp Marketing for Food', 20, 1, true),
      lesson('cfb-m4-l2', 'Catering for Events — Pricing & Logistics', 25, 2),
      lesson('cfb-m4-l3', 'Getting Corporate & Office Catering Contracts', 20, 3),
      lesson('cfb-m4-l4', 'Scaling: From Home Kitchen to a Catering Company', 25, 4),
    ]),
  ],

  /* ─────────────────────────────────────────────────── */
  'logistics-supply-chain': [
    mod('lsc-m1', 'Supply Chain Fundamentals', 1, [
      lesson('lsc-m1-l1', 'What is Supply Chain & Why It Matters in Nigeria', 15, 1, true, 'https://www.youtube.com/watch?v=Mi6OJ4zbLX4'),
      lesson('lsc-m1-l2', 'The Supply Chain — From Farm to Consumer', 20, 2),
      lesson('lsc-m1-l3', 'Key Players in Nigerian Logistics', 20, 3),
      lesson('lsc-m1-l4', 'Supply Chain Disruptions & Solutions', 20, 4),
      lesson('lsc-m1-l5', 'Introduction to Procurement', 20, 5),
    ]),
    mod('lsc-m2', 'Inventory & Warehousing', 2, [
      lesson('lsc-m2-l1', 'Inventory Management Basics', 20, 1, true),
      lesson('lsc-m2-l2', 'Just-In-Time vs Bulk Stocking', 20, 2),
      lesson('lsc-m2-l3', 'Warehouse Layout & Organisation', 20, 3),
      lesson('lsc-m2-l4', 'Using Technology for Inventory Tracking', 20, 4),
    ]),
    mod('lsc-m3', 'Transport & Last-Mile Delivery', 3, [
      lesson('lsc-m3-l1', 'Road vs Air vs Sea Freight in Nigeria', 20, 1, true),
      lesson('lsc-m3-l2', 'Last-Mile Delivery Challenges & Solutions', 20, 2),
      lesson('lsc-m3-l3', 'Working with Dispatch Riders & Fleet', 20, 3),
      lesson('lsc-m3-l4', 'Import & Export Documentation Basics', 25, 4),
    ]),
    mod('lsc-m4', 'Career & Freelancing in Logistics', 4, [
      lesson('lsc-m4-l1', 'Supply Chain Career Paths in Nigeria', 15, 1, true),
      lesson('lsc-m4-l2', 'Starting a Logistics / Dispatch Business', 25, 2),
      lesson('lsc-m4-l3', 'Using Apps: Kwik, Gokada, Bolt Food — B2B Opportunities', 20, 3),
      lesson('lsc-m4-l4', 'Certifications: CILT, APICS & More', 20, 4),
      lesson('lsc-m4-l5', 'Final Project & Course Assessment', 30, 5),
    ]),
  ],
}

/** Flat lookup: lessonId → { module, lesson, courseSlug } */
export function findLesson(courseSlug: string, lessonId: string) {
  const modules = COURSE_CURRICULUM[courseSlug] ?? []
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      if (lesson.id === lessonId) {
        return { module: mod, lesson }
      }
    }
  }
  return null
}

/** All lessons in a course in order */
export function allLessons(courseSlug: string): CurriculumLesson[] {
  return (COURSE_CURRICULUM[courseSlug] ?? []).flatMap(m => m.lessons)
}
