---
name: Skillora
description: Learn Skills. Earn Money. Build Nigeria. — a confident, pan-African EdTech system for low-bandwidth Nigeria (by Skillora Ltd).
colors:
  brand-cream: "#F1EFE8"
  brand-cream-alt: "#E8E5DC"
  blue: "#378ADD"
  blue-dark: "#1E4F8A"
  blue-light: "#EBF4FF"
  amber: "#F37321"
  amber-dark: "#C97E0A"
  ink: "#2C2C2A"
  ink-mid: "#5A5A58"
  ink-light: "#9A9A97"
  card-border: "#E0DDD5"
  input-border: "#D5D2C8"
typography:
  display:
    fontFamily: "Poppins, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Nunito, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.amber}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.amber-dark}"
    textColor: "#FFFFFF"
  button-secondary:
    backgroundColor: "{colors.blue}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.blue-dark}"
    textColor: "#FFFFFF"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.blue}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.blue}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: Skillora

## 1. Overview

**Creative North Star: "The Confident Bridge"**

SkillBridge is a structural blue framework laid over warm, grounded terrain — the system that connects ambitious Nigerians to opportunity. Blue is the bridge: dependable, load-bearing, the color of the structure that holds. Cream is the ground it spans: warm, human, unpretentious, the paper you'd actually write a lesson plan on. Amber is the traffic that crosses it: the one hot color reserved for the single most important action on any screen. The system reads as confident and distinctly Nigerian — proud and forward-looking, never a global-edtech template and never an aid-org brochure.

This is a **product-first** system serving three audiences (teachers, youth, employers) on low-end Android phones over 2G. Restraint is the discipline: the tool should disappear into the task. Personality lives in moments — a completed course, an issued certificate, a job matched — not on every panel. The claymorphic, playful energy is real but rationed; it belongs to marketing and celebration surfaces, not to the dashboard where a teacher is trying to finish a result sheet.

It explicitly rejects: the navy-and-white Silicon-Valley SaaS template; the "charity for Africa" earth-tones-and-hands aesthetic; over-decorated product UI (rainbow card grids, gratuitous glassmorphism, competing palettes); and motion-as-spectacle on a device that can't afford it.

**Key Characteristics:**
- Warm cream ground, structural blue, single amber accent — a committed, legible 60/30/10 split.
- One palette, one identity. No competing indigo. No rainbow-per-category cards in the app.
- Tactile, confident components: rounded, chunky, satisfying — friendly weight without childishness.
- Bandwidth is a design constraint: lean, fast, offline-friendly, WCAG AA.
- Claymorphism as a signature spice, not the main dish.

## 2. Colors

A warm-neutral ground carrying a structural blue and a single hot amber — committed but never loud, built for legibility on cheap screens in bright Nigerian daylight.

### Primary
- **Bridge Blue** (`#378ADD`): The structural color. Secondary buttons, links, active nav, section fills (`section-blue`), focus rings, and any surface that should read as "the platform's backbone." When a whole panel needs weight, blue carries it.
- **Deep Girder** (`#1E4F8A`): Blue's darker twin. Hover state for blue buttons, `section-dark` backgrounds, and print link color. The load-bearing shadow of the bridge.

### Secondary
- **Crossing Amber** (`#F37321`): The one hot accent. Reserved for the single primary call-to-action on a screen (`btn-primary`), key highlights, and focus emphasis. Its rarity is the point — it means "do this."
- **Amber Ember** (`#C97E0A`): Amber's hover/pressed state. Only ever appears in response to interaction with an amber element.

### Neutral
- **Warm Cream** (`#F1EFE8`): The body ground. The default page background across the whole product. Warm, calm, paper-like.
- **Cream Shade** (`#E8E5DC`): The second neutral layer — alternating sections (`section-cream` accents), cream cards, cream badges. Quiet separation without a border.
- **Ink** (`#2C2C2A`): Primary text. Near-black, warm-tinted so it sits naturally on cream. All body copy and headings.
- **Ink Mid** (`#5A5A58`): Secondary text — subtitles, captions, supporting copy. Must still clear 4.5:1 on cream; do not push muted text lighter than this for body-sized text.
- **Ink Light** (`#9A9A97`): Disabled text, placeholders, and hairline dividers ONLY. Never body copy — it fails contrast on cream.
- **Card Border** (`#E0DDD5`) / **Input Border** (`#D5D2C8`): Hairline structure on white surfaces. 1px, never a colored stripe.

### Named Rules
**The Single Crossing Rule.** Amber (`#F37321`) is the only hot color and appears on at most one primary action per screen. Two ambers competing for the eye means neither wins. Everything else that needs emphasis uses blue or weight, not a second hot color.

**The One-Ground Rule.** There is exactly one palette: cream / blue / amber / ink. The legacy indigo `edu-*` tokens (`#4F46E5`, `#818CF8`, `#EEF2FF`, `#1E1B4B`) are **retired**. They must not appear in new work and should be migrated out of existing surfaces (see Do's and Don'ts).

## 3. Typography

**Display Font:** Poppins (with system-ui, -apple-system, 'Segoe UI', sans-serif)
**Body Font:** Nunito (with system-ui, -apple-system, 'Segoe UI', sans-serif)

**Character:** Two friendly, rounded sans-serifs — Poppins geometric and confident for headings, Nunito soft and warm for reading. The pairing is deliberately approachable for first-time, low-confidence users; it should never feel corporate or cold. Loaded from Google Fonts with `display=swap` so text renders on 2G before the webfont arrives.

### Hierarchy
- **Display** (Poppins 700, `clamp(2rem, 5vw, 3.5rem)`, line-height 1.1, tracking -0.02em): Hero and landing headlines only. Ceiling stays modest — the page is confident, not shouting.
- **Headline** (Poppins 700, ~1.875rem, line-height 1.2): Section titles (`section-title`). The main organizing headings within a page.
- **Title** (Poppins 600, ~1.25rem, line-height 1.3): Card titles, subsection heads, dialog titles.
- **Body** (Nunito 400, 1rem, line-height 1.6): All prose and UI copy. Cap prose measure at 65–75ch.
- **Label** (Nunito 600, 0.875rem): Buttons, form labels (`.label`), badges, nav items, and metadata.

### Named Rules
**The Two-Face Rule.** Poppins heads, Nunito reads. Never swap them, never introduce a third family, never set body copy in Poppins or a headline in Nunito. Two faces, fixed jobs.

## 4. Elevation

Depth is mostly **tonal and structural**: surfaces separate through the cream/white contrast and 1px warm borders, not shadow. Product UI stays close to flat so it reads fast and calm on cheap screens. The exception is **claymorphism** — a soft, chunky, offset-drop shadow that is the brand's signature *delight* material, deployed deliberately on marketing heroes, feature cards, and celebration moments, never as the default depth of every panel.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 1px 2px rgba(0,0,0,0.05)` / Tailwind `shadow-sm`): The quiet default for white cards. Barely there.
- **Card hover** (`shadow-md`): Cards lift slightly on hover to signal interactivity. State, not decoration.
- **Clay** (`box-shadow: 0 8px 0 rgba(0,0,0,0.10), 0 4px 20px rgba(0,0,0,0.07)`): The signature. A hard offset "base" plus a soft ambient blur, giving a molded, tactile block. Pairs with `rounded-3xl` (24px). Marketing and hero surfaces only.
- **Clay tinted** (`clay-blue` / `clay-amber` / `clay-green`): Clay whose offset is tinted with the surface's own hue (e.g. `0 8px 0 rgba(249,115,22,0.30)`). Use the tint that matches the element's role color, never a random rainbow.

### Named Rules
**The Rationed Clay Rule.** Claymorphism is spice, not the meal. It belongs on marketing heroes and moments of delight. Product surfaces (dashboards, forms, tables, settings) stay flat-to-`shadow-sm`. If every card on a screen is clay, none of them feel special.

**The No-Glass Rule.** Glassmorphism (`backdrop-blur` glass cards) is effectively banned as decoration. The `.glass*` utilities exist but should be treated as legacy; reach for a solid surface instead.

## 5. Components

Buttons, cards, and inputs should feel **tactile and confident** — rounded, chunky, satisfying to press, with friendly weight but no childishness. Consistent affordances screen to screen; the same button is the same button everywhere.

### Buttons
- **Shape:** Generously rounded (`rounded-xl`, 12px), `font-semibold`, padding `12px 24px` (`px-6 py-3`).
- **Primary** (`btn-primary`): Crossing Amber (`#F37321`) fill, white text. The one main action per screen.
- **Secondary** (`btn-secondary`): Bridge Blue (`#378ADD`) fill, white text. The common, non-terminal action.
- **Outline** (`btn-outline`): 2px blue border, blue text, fills blue on hover.
- **Ghost** (`btn-ghost`): Blue text only, tints to `blue-light` on hover.
- **Hover / Focus:** `transition-colors`; darken to the `-dark` twin on hover. Every button carries a visible focus ring (`focus:ring-2` in the role color + `ring-offset-2`). Disabled: `opacity-50`, `cursor-not-allowed`.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (16px) for standard cards; `rounded-3xl` (24px) for clay cards.
- **Background:** White (`.card`) or Warm Cream (`.card-cream`).
- **Shadow Strategy:** `shadow-sm` at rest → `shadow-md` on hover for standard cards. Clay reserved per the Rationed Clay Rule.
- **Border:** 1px `#E0DDD5` (white cards) / `#DDD9CF` (cream cards). Full hairline border, never a colored side-stripe.
- **Internal Padding:** 24px (`lg`) default.

### Inputs / Fields
- **Style:** White fill, 1px `#D5D2C8` border, `rounded-xl` (12px), `px-4 py-3`. Placeholder in Ink Light.
- **Focus:** `ring-2` Bridge Blue with a transparent border (`focus:border-transparent`). Clear, single focus treatment.
- **Label:** `.label` — Nunito 600, 0.875rem, Ink, `mb-1.5`.

### Navigation
- **Style:** Top navbar with logo, primary links (For Teachers / For Youth / Jobs / Employers) in Nunito label weight, role-aware user menu and notification bell. Sticky, white/cream ground, blue active state.
- **Mobile:** Hamburger (`Menu`/`X`) toggling a full-width panel. Collapse is structural, not fluid type.

### Badges & Section Pills
- **Badges** (`.badge-*`): Pill (`rounded-full`), tinted-background + darker-text pairs (amber/blue/green/cream/purple/gold). Used for course category, status, and metadata. Keep to the role colors; don't invent new hues per item.
- **Section Pills** (`.section-pill-*`): Larger eyebrow-style pills introducing sections. Use one deliberate style per section, not a rainbow set stacked on one page.

## 6. Do's and Don'ts

### Do:
- **Do** keep the 60/30/10 rhythm: ~60% Warm Cream ground, ~30% Bridge Blue structure, ~10% Crossing Amber action.
- **Do** reserve amber (`#F37321`) for the single primary action on a screen (The Single Crossing Rule).
- **Do** set headings in Poppins, body in Nunito, and nothing else (The Two-Face Rule).
- **Do** keep product surfaces flat-to-`shadow-sm`; ration claymorphism to marketing and delight moments (The Rationed Clay Rule).
- **Do** verify muted text: Ink Mid (`#5A5A58`) is the floor for body-sized secondary text on cream. Push lighter only for placeholders/dividers.
- **Do** give every interactive element visible focus, hover, disabled, and (where relevant) loading/error states.
- **Do** design for 2G first: `display=swap` fonts, lazy/optimized images, minimal JS, skeletons over spinners.

### Don't:
- **Don't** reintroduce the retired indigo palette (`#4F46E5`, `#818CF8`, `#1E1B4B`, `#EEF2FF`, any `indigo-*` Tailwind class, or `rgba(79,70,229…)`). It was fully migrated to Bridge Blue across the app (Jul 2026); the `edu` color tokens and `clay-indigo` shadow were removed from `tailwind.config.ts`. New work uses `brand-blue` / `blue-*` only (The One-Ground Rule).
- **Don't** ship a rainbow of per-category card colors (orange/indigo/pink/yellow/green/teal) in the product app. That's the "identical card grid" AI tell dressed in color. Use the role badges instead.
- **Don't** reintroduce gradient text (`background-clip: text` on a gradient). It's a banned decorative pattern; use a single solid color and emphasize with weight or size. The `gradient-text-amber` / `gradient-text-blue` utilities were removed from globals.css (Jul 2026).
- **Don't** use glassmorphism (`.glass*`) as decoration (The No-Glass Rule).
- **Don't** use a colored `border-left`/`border-right` stripe as an accent on cards, alerts, or list items. Full borders or background tints only.
- **Don't** look like navy-and-white SaaS, or like an aid-org "charity for Africa" brochure. This is a confident, pan-African product.
- **Don't** animate for spectacle — no float/pulse everywhere, no orchestrated page-load choreography on a device that can't afford it. Motion conveys state (150–250ms) and always has a `prefers-reduced-motion` path.
