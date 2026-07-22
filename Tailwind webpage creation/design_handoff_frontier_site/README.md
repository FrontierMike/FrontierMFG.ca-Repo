# Handoff: Frontier MFG Website (Home, Services, Baseline)

## Overview
A three-page marketing site for **Frontier MFG** — an automation & manufacturing consulting firm in the Lower Mainland, BC — with heavy emphasis on **Baseline**, its upcoming wireless KPI-tracking product (launching end of year). The site targets small/mid-size manufacturers considering Industry 4.0 upgrades: plain language, trust-forward, no pricing anywhere.

## About the Design Files
The `.dc.html` files in this bundle are **design references created in HTML** — high-fidelity prototypes showing intended look and behavior, **not production code to copy directly**. The task is to **recreate these designs in the existing Astro codebase**, using its established patterns and conventions (components, layouts, content collections as appropriate). Open the files in a browser to see the live design; read their markup for exact values. Ignore the `<x-dc>` wrapper, `support.js`, `image-slot.js`, and the `<script data-dc-script>` logic block at the bottom of each file — those are design-tool scaffolding. The inline styles and structure inside are the source of truth.

## Fidelity
**High-fidelity.** Recreate pixel-perfectly: exact colors, typography, spacing, and copy are final and specified in the markup.

## Pages

### 1. Home (`Home.dc.html`)
Sections top to bottom:
1. **Sticky header** — white 90% + blur, logo (red rotated-square diamond + "FRONTIER MFG"), nav: Services / Baseline (with red "SOON" pill) / Process / About / red CTA button "Book a free consultation". **Mobile (<860px): hamburger button toggling a dropdown column menu** (see Interactions).
2. **Hero** — two columns (text left, dashboard mockup right; wraps on narrow). H1 "Bring your shop floor into the age of data." Red primary CTA → `#contact`, outlined secondary → `#modernize`. Risk-reversal microcopy under CTAs: "Free 30 minutes · no commitment — and if you don't need us, we'll say so." Mono credential chips row (20+ yrs / B.Eng, EIT / 🍁 Lower Mainland, BC). Right column: **Grafana-style dashboard mockup** — near-black `#0a0e13` card, `#0e141b` panels, stat tiles (OEE green / MTBF amber / Downtime red), amber bar chart with mono axis labels, green/red machine-state strip (CSS repeating-linear-gradients), caption "BASELINE DASHBOARD — PRODUCT PREVIEW".
3. **Capabilities marquee** — dark `#131c24` strip, infinitely scrolling mono uppercase service names separated by red ◆ (CSS keyframe `translateX(-50%)`, 38s linear, pause on hover). Duplicated content for seamless loop.
4. **"Why modernize"** (`#modernize`) — white, eyebrow + heading + copy, three explainer cards.
5. **Services preview** (`#services`) — grey, 8 service cards (icon SVG + mono number + title + copy, red left tick accent) + a 9th dark CTA card linking to Services page.
6. **Baseline promo** — dark `#131c24` with faint white line grid overlay, red "Coming soon" pill, heading "KPI tracking, without the IT project.", 3 arrow bullets, CTAs → `Baseline.dc.html#pilot` and `Baseline.dc.html`. Right: sensor-network card (4 sensor tiles, green `#64b450` / amber `#c88c28` status dots).
7. **Process** (`#process`) — grey, 4 numbered steps in outlined red boxes.
8. **About** (`#about`) — white, intro + two team cards: **monogram tiles** (64px rounded `#16202a` square, mono initials MW / GW, small red diamond top-right) — *not* photos — plus name, red mono role, two bio paragraphs each.
9. **Contact** (`#contact`) — dark. Left: heading, copy, WEB / LOCATION / SERVING info rows (mono labels), and an **"A first engagement looks like"** panel (3 numbered steps ending "clear go / no-go"). Right: form card with green-dot badge "WE REPLY WITHIN ONE BUSINESS DAY", fields (first/last name, email, company, message), red submit. On submit: show inline green thank-you message (currently client-side state only — **needs a real form backend**).
10. **Footer** — near-black `#0e161d`, logo, nav links, "© 2026 Frontier Manufacturing Services · Vancouver & the Lower Mainland, BC".

Light sections carry a **dot-grid texture**: `radial-gradient(circle, rgba(22,32,42,0.15–0.17) 1px, transparent 1.7px)` at `22px 22px` (layered over the hero gradient). Section eyebrows have a **red ruler-tick rule**: 72×9px `repeating-linear-gradient(90deg, #b3261e 0 1.5px, transparent 1.5px 9px)`.

### 2. Services (`Services.dc.html`)
Same header/footer. Hero (dot texture) with H1, CTAs, same risk-reversal microcopy. **8 service cards** (Process Automation, PLC/SCADA, Hardware & Software Integration, Process Improvement, Feasibility Studies, DFM, Machining Consultation, Controls Design) — each: icon, mono number, title, paragraph, divider, 3–4 em-dash bullets. Integration and Process Improvement cards end with a red "Related: Baseline KPI tracking →" link. **"The Frontier difference"** band (dot texture): centered, line "Every engagement ends with a written deliverable you keep.", 3 columns (Vendor-neutral / Fixed-scope proposals / Floor-first). **Dark closing CTA** "Not sure which service you need?" + red button + green-dot reply-time line.

### 3. Baseline (`Baseline.dc.html`)
1. **Dark hero** — `#131c24` + faint white line grid. Red pulsing pill "Launching end of year — join the pilot". H1 + copy + CTAs (`#pilot`, `#how`). Right: **Grafana-style live mockup** — same `#0a0e13`/`#0e141b` system: green-gradient "RUNNING" status block (62px, white 30px 600), 2×2 stats (Parts green `#73bf69`, Downtime red `#f2495c`, Availability green), amber `#d9a520` machine-load bar panel with mono axis labels, footer "4 sensors online / ● healthy".
2. **"What is Baseline"** — white + line-grid texture, centered copy, then **four demo videos stacked seamlessly** (gap 0) in one rounded bordered frame, each with a mono caption chip bottom-left (DASHBOARD — LIVE VIEW / SENSOR DETAIL / TREND HISTORY / ALERTS & STOPPAGES). Videos: `loop muted playsinline preload="none"`, **lazy-loaded via IntersectionObserver** (play on enter ±200px, pause off-screen). Files live in the repo already as `videos/dashboard-1.mp4` … `dashboard-4.mp4` (natural aspect ratios vary; render width 100%, height auto — do not crop).
3. **"New to this? Start here"** (`#learn`) — grey + line grid: plain-language jargon cards (KPI, OEE, IIoT, etc.).
4. **Benefits section** — white + line grid.
5. **"How it works"** (`#how`) — grey + line grid.
6. **Dark "And then… AI" band** — deliberately soft: data now, AI theoretically later. Do not amplify.
7. **FAQ** (`#faq`) — grey + line grid, red tick + eyebrow "Common questions", 7 white cards. **No cost/pricing content — ever** (owner quotes per setup).
8. **Pilot** (`#pilot`) — white. Left: red pill "Limited pilot — a handful of BC shops", 3 numbered benefits (no pricing promises), **"Who's behind Baseline"** strip (MW/GW monogram chips linking to Home about). Right: **application form** (Name, Company, Email, # of machines select, What do you make?, optional textarea), red submit, microcopy "No newsletter, no spam — we'll only contact you about the pilot.", inline green confirmation on submit (**needs real form backend**).

**Baseline's light sections use a line grid** (`linear-gradient` both axes, `rgba(22,32,42,0.05–0.06)` 1px lines, `26px 26px`) instead of Home/Services dots — intentional page differentiation.

## Interactions & Behavior
- **Mobile nav (all pages):** below 860px viewport width, desktop nav hides; hamburger (44px, 3 bars, 1px `#cbd2d8` border, 8px radius) toggles a dropdown: column of 16px links with `#f0f2f4` dividers, red full-width CTA button last. Menu closes on link click and on resize to desktop. Implement with CSS media queries or your framework's idiom.
- **Smooth scrolling** for hash links; `section[id] { scroll-margin-top: 84px }` for the sticky header.
- **Marquee:** 38s linear infinite, pauses on hover.
- **Pulse dots:** `@keyframes` opacity 1→0.35 + scale 1→0.82, 1.6s ease-in-out infinite.
- **Video lazy-load:** IntersectionObserver, `rootMargin: 200px 0px`; set `preload` and `.play()` on enter, `.pause()` on exit.
- **Forms:** both forms currently fake-submit (client state shows a success message). Wire to a real endpoint (Astro action / API route / Formspree-style service / email). Success copy: Home — "…we'll be in touch"; Baseline — "Thanks for your interest — we'll be in touch within one business day."
- **Hovers:** red buttons → `#8f1d17`; outlined buttons → darker border; white service cards → `#fafbfc`; links default red `#b3261e`, hover `#8f1d17`.

## State Management
Minimal: mobile-menu open/closed per page; form submitted flags. No data fetching.

## Design Tokens
**Colors**
- Ink / charcoal: `#16202a` · body text grey: `#566169` · muted: `#8a949c`, `#9aa4ad`
- Brand red: `#b3261e` (hover `#8f1d17`; tint bg `#fbe9e8`)
- Dark bands: `#131c24` · footer `#0e161d`
- Light bg: `#f5f7f9` · borders `#e6e9ec` · input border `#cbd2d8`
- Dashboard mockups: card `#0a0e13`, panel `#0e141b`, panel border `rgba(255,255,255,0.06)`, labels `#8b929b`, mono axis `#5f656e`, green `#73bf69`, amber `#d9a520` (bar top `#b7861a`), red `#f2495c`, RUNNING gradient `#67b25b → #469140`
- Success green (light UI): `#1f9d55`

**Typography** — Google Fonts: `IBM Plex Sans` (300–700; body 400, headings 600) and `IBM Plex Mono` (400/500 — eyebrows, labels, chips, numbers). Eyebrows: 12px, letter-spacing 0.16em, uppercase, red. H1 `clamp(40px, 5vw, 66–68px)`, section H2 `clamp(28–30px, 3.4–3.8vw, 44–50px)`, letter-spacing −0.02em.

**Other** — Radii: buttons/inputs 8px, cards 14–16px, pills 100px. Section padding `clamp(64px, 8vw, 104–120px)` vertical, 32px horizontal, max-width 1200px (content sections 900–1000px). Textures & tick rule as specified above.

## Assets
- `icons/` — 8 service SVGs + maple leaf (bundled here; copy into the repo's public assets).
- `videos/dashboard-1..4.mp4` — **not bundled; already in the target repo.** Reference them at the paths the repo serves.
- Favicon: inline SVG data-URI red diamond (in each file's `<head>`) — recreate as a real favicon file.
- No photos anywhere by deliberate choice (no suitable/owned imagery yet). Team uses monogram tiles.

## Page Metadata
Each file's `<head>` has final `<title>` + `<meta name="description">` — carry these into Astro page frontmatter. Theme-color `#16202a` (Baseline: `#131c24`).

## Content Rules (important)
- **No pricing or cost language anywhere** — the owner quotes per setup.
- AI is mentioned once, softly, on Baseline only. Keep it that way.
- No fake testimonials, logos, or stock photography.
- Baseline launch framing: "end of year"; pilot limited to BC / Lower Mainland shops.

## Files
- `Home.dc.html` — home page reference
- `Services.dc.html` — services page reference
- `Baseline.dc.html` — Baseline product page reference
- `icons/` — SVG assets used by the designs
