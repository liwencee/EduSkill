# Product

## Register

product

## Users

Three distinct audiences on one two-sided platform, most of them on low-end Android phones over 2G/3G, often offline:

- **Youth learners (SkillUp)** — 16–30, seeking employable vocational and digital skills (digital marketing, coding, solar install, fashion, agribusiness). Price-sensitive, mobile-only, learning in short sessions between other obligations, frequently in English + a Nigerian language (Pidgin, Yoruba, Igbo, Hausa).
- **Teachers (EduPro)** — public and private school teachers who need CPD certification and AI-assisted tools (lesson planner, result generator, community). Time-poor, task-focused, come to *get a specific thing done and leave*.
- **Employers (OpportunityHub)** — SMEs and organizations posting jobs, reviewing applicants, and negotiating. Want signal and speed, not a job-board maze.

Plus an **admin** surface for platform operators (users, teachers, jobs, negotiations).

The common context: constrained device, constrained bandwidth, high stakes (a job, a certificate, income). Every screen should assume a slow connection and a small screen first.

## Product Purpose

**Skillora** (the product and company brand; formerly "SkillBridge Nigeria" / "EduSkill", both fully retired across the codebase) bridges three gaps in Nigeria's education-to-employment pipeline: unemployable youth, undertrained teachers, and under-equipped schools. It unifies vocational upskilling, teacher professional development + AI pedagogy tools, and a jobs/opportunity marketplace into one affordable, Nigeria-context platform. Success = learners complete courses and land opportunities, teachers earn CPD and save hours with AI tools, and employers fill roles — all reliably on cheap phones and weak networks.

## Brand Personality

**Confident · modern · pan-African.** Proud and forward-looking, distinctly Nigerian rather than a generic global-edtech template. The voice is credible and direct — it respects the user's time and intelligence, never talks down, never hypes. Optimistic and empowering, but earned: it shows competence through clarity and reliability, not decoration. In-product, the tool should disappear into the task; personality lives in moments (a completed course, an issued certificate), not on every panel.

## Anti-references

- **Generic Silicon-Valley edtech / SaaS template.** Navy-and-white, stock-illustration "growth" mascots, borrowed Duolingo/Coursera cues. This platform owns a Nigerian identity; it shouldn't look like it could be any country's app.
- **Aid-org / "charity for Africa" aesthetic.** No pity framing, no NGO-brochure earth-tones-and-hands imagery. Users are ambitious professionals, not beneficiaries.
- **Over-decorated product UI.** The current claymorphic system (heavy multi-shadow "clay" cards, a full rainbow of per-category card colors, dual competing palettes — warm brand cream/blue/amber *vs.* an `edu` indigo set) risks strangeness-without-purpose in the app surfaces. In-product, favor one consistent, restrained vocabulary; save the boldest claymorphism and color for the marketing surfaces where it earns its keep.
- **Motion as spectacle.** No orchestrated page-load choreography, no float/pulse everywhere. Users are in a task on a slow device.

## Design Principles

1. **Bandwidth is a design constraint, not an afterthought.** Assume 2G and a $50 Android. Minimal JS, optimized/lazy imagery, offline-friendly, skeletons over spinners. If a flourish costs load time, it loses.
2. **Own a Nigerian identity.** Distinctly local and proud — language options, local imagery, local context — without slipping into template-edtech or aid-org clichés.
3. **The tool disappears into the task.** Product surfaces reward earned familiarity: consistent components, standard affordances, one visual vocabulary screen to screen. Delight is a moment, not a page.
4. **Consolidate the identity.** One coherent palette and component system across the app; retire the competing dual palette so the product reads as one confident brand.
5. **Respect the user's stakes.** A job, a certificate, an income ride on these flows. Clarity, trustworthy states (error/empty/loading), and honest copy over cleverness.

## Accessibility & Inclusion

- **Target: WCAG 2.1 AA, low-bandwidth-first.** AA contrast (≥4.5:1 body, ≥3:1 large), full keyboard operability, visible focus, and a real `prefers-reduced-motion` path on every animation (a global reduced-motion rule already exists in `globals.css`).
- **Performance as accessibility.** Formal budgets for a 2G / low-end-Android audience: lean JS, responsive/lazy images, fast first paint. Slow is inaccessible here.
- **Multilingual reality.** UI must tolerate English + Nigerian-language content and longer strings without overflow.
- **Verify the warm palette.** The cream backgrounds and muted "ink" grays are the highest contrast risk — check muted body/placeholder text against tinted surfaces and bump toward ink where borderline.
