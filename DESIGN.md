# Frontier Manufacturing Services — Design Spec

**Domain:** frontiermfg.ca **Stack:** Astro \+ Tailwind CSS **Structure:** Single-page with anchor scrolling (nav links jump to sections)

---

## Build Instructions

Build a single-page marketing site in `src/pages/index.astro`. Use Astro components in `src/components/` for each major section. Keep styling in Tailwind utility classes. Add Google Fonts (Barlow \+ Barlow Condensed) in the base layout.

### File structure to create

src/

├── components/

│   ├── Nav.astro

│   ├── Hero.astro

│   ├── ConsultBanner.astro

│   ├── Ticker.astro

│   ├── Services.astro

│   ├── Team.astro

│   ├── Process.astro

│   ├── Contact.astro

│   └── Footer.astro

├── layouts/

│   └── Base.astro

└── pages/

    └── index.astro

public/

└── icons/         \# SVG icons live here (already provided)

---

## Design System

### Colour palette

| Variable | Hex | Usage |
| :---- | :---- | :---- |
| `bg-dark` | `#0e0f0d` | Page background |
| `bg-card` | `#111210` | Nav, alt section backgrounds |
| `bg-surface` | `#161714` | Cards, form inputs |
| `accent` | `#e8a020` | Buttons, banners, highlights |
| `accent-dark` | `#c47d0a` | Button hover |
| `text` | `#f0ece2` | Headings, body |
| `text-muted` | `#888880` | Body secondary |
| `text-dim` | `#444441` | Labels, captions |
| `border` | `rgba(255,255,255,0.07)` | Dividers, card borders |
| `border-accent` | `rgba(232,160,32,0.3)` | Accent borders |

Configure these in `tailwind.config.mjs` (or Tailwind v4 via `@theme` in CSS) as custom colours so you can use them as utility classes like `bg-bg-dark`, `text-accent`, etc.

### Typography

- **Display / Headings:** Barlow Condensed (weights: 700, 800\)  
- **Body:** Barlow (weights: 300, 400, 600\)

Load via Google Fonts in the base layout `<head>`:

\<link rel="preconnect" href="https://fonts.googleapis.com"\>

\<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin\>

\<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800\&family=Barlow:wght@300;400;600\&display=swap" rel="stylesheet"\>

### Type scale

| Role | Size | Weight | Font |
| :---- | :---- | :---- | :---- |
| Hero title | `clamp(52px, 6vw, 84px)` | 800 | Barlow Condensed |
| Section title | `clamp(36px, 4vw, 56px)` | 800 | Barlow Condensed |
| Card title | 20–24px | 700 | Barlow Condensed |
| Body | 15–16px | 300 | Barlow |
| Eyebrow / label | 11–12px | 600 | Barlow Condensed |
| Nav links | 13–14px | 600 | Barlow Condensed |

All headings, eyebrows, and labels should be **uppercase** with letter-spacing 0.05em–0.22em depending on size (more spacing for smaller text).

---

## Sections (top to bottom)

### 1\. Nav (sticky)

- Fixed top, 64px tall, `bg-card` with bottom border  
- Left: logo "FRONTIER **MFG**" — "MFG" in accent colour  
- Centre: anchor links (Services, About, Process, Contact)  
- Right: amber CTA button "Free Consultation"  
- On mobile: hamburger menu

### 2\. Hero

- Full viewport height  
- 2-column grid (left content, right decorative grid pattern)  
- Left side stacked vertically:  
  - Eyebrow: "AUTOMATION & MANUFACTURING CONSULTING" (with small amber horizontal line to the left)  
  - Headline: "BUILT FOR THE **SHOP** FLOOR" — "SHOP" in accent  
  - Body paragraph  
  - Primary button (amber): "Book a Free Consultation"  
  - Secondary text link: "View Services →"  
- Right side:  
  - Subtle grid pattern background (CSS repeating-linear-gradient, accent at \~5% opacity, 60px squares)  
  - Floating stats bottom-right: "40+ / YEARS COMBINED EXPERIENCE" and "BC / BASED IN CANADA"

### 3\. Free Consultation Banner (full-width strip)

- Amber background, dark text  
- Layout: badge ("NO COST") \+ tagline \+ button ("Book Now →")  
- Tagline: "Free 30-minute consultation — no commitment, no sales pitch. Just a conversation about your problem."

### 4\. Ticker

- Dark surface background, muted text  
- Animated marquee scrolling right-to-left  
- Content: "Process Automation · PLC / SCADA Programming · Hardware & Software Integration · Controls Design · Feasibility Studies · Design for Manufacturing · Machining Consultation · Manufacturing Process Improvement"  
- Uppercase, small (11–12px), letter-spaced  
- Duplicate the content in the HTML twice so the animation loops seamlessly

### 5\. Services

- `bg-card` section, vertical padding 6rem  
- Header row: section label "WHAT WE DO" \+ title "SERVICES" \+ subheading  
- 3-column grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)  
- 8 service cards \+ 1 CTA card \= 9 total tiles  
- Card structure:  
  - 1px gap between cards revealing border colour beneath  
  - Card background: `bg-card`  
  - Number "01"–"08" in top-left, small, dim  
  - Icon (SVG from `/public/icons/`), 32px, accent colour  
  - Title (uppercase, bold)  
  - Description (muted body text)  
  - Left edge: 2px accent border at top 40% of card height (use a pseudo-element or absolute-positioned div)  
- 9th tile is the CTA card:  
  - "Not sure where to start? Let's talk through your problem — free, no commitment."  
  - Amber button: "Book Free Call →"

#### Service card content

| \# | Title | Description | Icon file |
| :---- | :---- | :---- | :---- |
| 01 | Process Automation | Identify automation opportunities and implement solutions that reduce manual labour and increase throughput. | `01-process-automation.svg` |
| 02 | PLC / SCADA Programming | Custom logic, HMI design, and commissioning support for Allen-Bradley, Siemens, and more. | `02-plc-scada-programming.svg` |
| 03 | Hardware & Software Integration | Bridging the gap between industrial hardware and software systems — sensors, controllers, networks, and custom software. | `03-hardware-software-integration.svg` |
| 04 | Process Improvement | Lean-informed analysis of production workflows to eliminate bottlenecks and reduce waste. | `04-process-improvement.svg` |
| 05 | Feasibility Studies | Technical and economic assessments to validate automation or production change investments before you commit. | `05-feasibility-studies.svg` |
| 06 | Design for Manufacturing | DFM reviews that bridge design intent with production reality — reducing rework and material waste. | `06-design-for-manufacturing.svg` |
| 07 | Machining Consultation | Process parameters, toolpath strategy, and fixturing advice for CNC machining operations. | `07-machining-consultation.svg` |
| 08 | Controls Design | Panel layouts, I/O schematics, and control architecture — designed for reliability and ease of maintenance. | `08-controls-design.svg` |
| 09 | (CTA card) | "Not sure where to start? Let's talk through your problem — free, no commitment." Button: "Book Free Call →" | `09-get-in-touch.svg` |

### 6\. Team

- `bg-dark` section  
- Section label "WHO WE ARE" \+ title "THE TEAM"  
- Subheading: "A two-person firm combining deep manufacturing and process knowledge with 40 years of senior hardware and software experience."  
- 2-column grid (stack on mobile)  
- Each card:  
  - Avatar placeholder (40×40px box, accent border, "FM" initials inside)  
  - Name (uppercase, bold)  
  - Role (small, accent colour, uppercase, letter-spaced)  
  - Bio paragraph

**Card 1 — `[YOUR NAME]`** Role: `EIT · Automation & Manufacturing Consultant` Bio: Registered Engineer-in-Training with hands-on expertise in automation, manufacturing process improvement, PLC/SCADA programming, and design for manufacturing. Focused on practical solutions for production floor challenges.

**Card 2 — `[PARTNER NAME]`** Role: `Software & Hardware Engineer · 40 Years Experience` Bio: Senior software and hardware engineer with four decades of experience in industrial systems, embedded development, and technology leadership. Has held senior roles across multiple industries — bringing deep technical credibility to every engagement.

**EIT Disclaimer (below team cards, important):** Style as a left-bordered callout: 3px solid accent left border, slight amber tint background (`rgba(232,160,32,0.05)`), padded.

Frontier Manufacturing Services is operated by a registered Engineer-in-Training (EIT) in British Columbia. We provide consulting and technical services; we do not offer licensed professional engineering services.

### 7\. Process

- `bg-card` section  
- Section label "HOW IT WORKS" \+ title "OUR PROCESS"  
- 4-column grid (responsive: stack on mobile)  
- Each step:  
  - Number in 56×56px square with accent border (no fill)  
  - Title (uppercase bold)  
  - Description (muted body)  
- Optional: a thin horizontal connector line between the number boxes (1px accent border, behind the boxes)

| \# | Title | Description |
| :---- | :---- | :---- |
| 01 | Free Discovery Call | A free 30-minute call to understand your operation, constraints, and goals. No commitment required. |
| 02 | Site Assessment | Where needed, we visit your facility to observe processes, audit equipment, and gather technical data. |
| 03 | Proposal & Scope | A clear written proposal with defined deliverables, timeline, and fixed or hourly pricing. |
| 04 | Delivery | We execute the work, keep you informed throughout, and provide handover documentation at completion. |

### 8\. Contact

- `bg-dark` section  
- 2-column grid  
- Left column:  
  - Section label "GET IN TOUCH" \+ title "LET'S TALK"  
  - Body: "Tell us about your project. First call is always free — we respond within one business day."  
  - Contact details list:  
    - Web: frontiermfg.ca  
    - Location: British Columbia, Canada  
    - Serving: Western Canada  
- Right column: contact form  
  - First name \+ Last name (2-col row)  
  - Email \+ Company (2-col row)  
  - Service of interest (dropdown):  
    - Process Automation  
    - PLC / SCADA Programming  
    - Hardware & Software Integration  
    - Controls Design  
    - Manufacturing Process Improvement  
    - Feasibility Study  
    - Design for Manufacturing  
    - Machining Consultation  
    - Not sure yet  
  - Message (textarea)  
  - Submit button (full-width amber): "Send Message"

**Form submission:** TBD — confirm with user. Options:

- Formspree (`<form action="https://formspree.io/f/YOUR_ID" method="POST">`)  
- Web3Forms  
- Netlify Forms (`netlify` attribute on form, only works if deploying to Netlify)  
- Cloudflare Pages with a function  
- Mailto fallback

### 9\. Footer

- `#080908` background, thin top border  
- Flex row: logo (left) · nav links (centre) · copyright (right)  
- Logo: "FRONTIER **MFG** Services"  
- Links: Services · About · Process · Contact  
- Copyright: "© 2025 Frontier Manufacturing Services"

---

## Important Constraints

- **Never use the phrase "engineering services"** anywhere on the site (legal — owner is EIT, not PEng)  
- Safe alternative terms: consulting, technical services, automation services, process consulting, hardware & software integration  
- The EIT disclaimer in the Team section is legally important — keep visible  
- Set proper `<title>`, meta description, OG tags in the base layout for SEO

## Meta tags

\<title\>Frontier Manufacturing Services | Automation & Manufacturing Consulting\</title\>

\<meta name="description" content="Practical automation, controls, and process improvement consulting for manufacturers across Western Canada. Free 30-minute consultation."\>

\<meta property="og:title" content="Frontier Manufacturing Services"\>

\<meta property="og:description" content="Automation & manufacturing consulting for Western Canada."\>

\<meta property="og:url" content="https://frontiermfg.ca"\>

\<meta property="og:type" content="website"\>

---

## Animation / Interaction

- Buttons: hover state with slight transform and colour shift to `accent-dark`  
- Service cards: subtle background lighten on hover (`bg-surface` → slightly lighter)  
- Service cards: left border accent line could extend on hover (0% → 100% height)  
- Nav links: colour transition muted → accent on hover  
- Ticker: CSS animation, infinite loop, \~30s per full cycle, pause on hover  
- Smooth scroll for anchor links (CSS `scroll-behavior: smooth` on html)

Keep animations subtle. No page transitions, no scroll-triggered reveals.

---

## Build Notes

- Use semantic HTML: `<nav>`, `<main>`, `<section>` with `id` attrs for anchor scrolling, `<footer>`  
- All sections should have an `id` matching the nav link anchors (`#services`, `#about`, `#process`, `#contact`)  
- Mobile responsive: stack columns, hamburger nav, adjust type scale via `clamp()`  
- Test at 320px (mobile), 768px (tablet), 1280px+ (desktop)  
- Lighthouse target: 95+ across the board (Astro makes this easy — static HTML, no JS framework overhead)

---

## Assets to provide

User needs to drop these into `public/icons/`:

- `01-process-automation.svg`  
- `02-plc-scada-programming.svg`  
- `03-hardware-software-integration.svg`  
- `04-process-improvement.svg`  
- `05-feasibility-studies.svg`  
- `06-design-for-manufacturing.svg`  
- `07-machining-consultation.svg`  
- `08-controls-design.svg`  
- `09-get-in-touch.svg`

All SVGs use stroke `#e8a020`, stroke-width 1.5, viewBox 0 0 24 24\.

---

## Open questions for the user before starting build

1. Tailwind version (v3 or v4)?  
2. Deployment target (GitHub Pages, Netlify, Vercel, Cloudflare Pages)?  
3. Form handler choice (Formspree, Web3Forms, Netlify Forms, mailto, skip)?  
4. Names to fill in for the two team cards?  
5. Should the "Book a Free Consultation" button link to:  
   - A scroll to the contact form (`#contact`), or  
   - An external scheduler like Calendly?

Confirm these before writing code.  
