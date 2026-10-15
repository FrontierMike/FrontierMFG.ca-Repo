# Frontier MFG — frontiermfg.ca

Marketing/site for Frontier Manufacturing Services. Static [Astro](https://astro.build) build, hosted on **Cloudflare Workers**, with a contact form backed by a Worker function that emails leads (Resend) and logs them to Notion.

---

## Architecture

```
Visitor
  │
  ▼
Cloudflare Worker (frontiermfgwebsite)
  ├── request matches a static file ──► served from ./dist (no Worker code runs)
  └── POST /api/contact ─────────────► worker/index.js handler
                                          ├── validate + honeypot check
                                          ├── write row to Notion (Leads DB)
                                          └── email info@frontiermfg.ca (Resend)
```

- **Static site:** Astro builds to `./dist`. The Worker serves those files via the `ASSETS` binding. A request matching a static file is served directly — the Worker function only runs for unmatched paths (`/api/contact`, plus 301 redirects from the retired `/lightwell` and `/baseline` URLs to `/how-it-works#measure`).
- **Contact form:** `src/components/ContactForm.astro`, used on `/contact`, posts JSON to `/api/contact`. The Worker validates, logs to Notion, and emails the lead. Notion failures are non-fatal (logged, email still sends) so a lead is never lost; a Resend failure returns an error to the visitor.
- **No Astro adapter:** the site is a pure static build. The only dynamic code is the standalone Worker route.

## Tech stack

- Astro (static output), Tailwind CSS v4 (design tokens — see Theming below)
- Fonts: Barlow Condensed, IBM Plex Sans, IBM Plex Mono, self-hosted from `@fontsource` packages via Astro's font API
- Icons: Lucide (`@lucide/astro`)
- Cloudflare Workers + Static Assets (`wrangler`)
- Resend (transactional email)
- Notion API (lead logging)

---

## Project structure

```text
/
├── public/                      # static assets, copied to dist as-is
│   ├── favicon.ico / favicon.svg
│   ├── og-image.png             # social share card (see SEO below)
│   └── robots.txt
├── scripts/
│   └── og-image.py              # regenerates public/og-image.png (one-off tool)
├── src/
│   ├── content/
│   │   ├── learn/               # Learn articles (.md / .mdx)
│   │   └── case-studies/        # case studies; _template.md shows the format
│   ├── content.config.ts        # collection schemas
│   ├── data/
│   │   ├── site.ts              # business NAP, service area, services, form options
│   │   ├── schema.ts            # JSON-LD structured-data builders
│   │   └── content.ts           # collection queries (draft handling)
│   ├── layouts/
│   │   └── Base.astro           # <html> shell, <head>, SEO meta, JSON-LD
│   ├── styles/
│   │   └── global.css           # design tokens, band colours, shared classes
│   ├── components/
│   │   ├── Header.astro         # sticky nav + mobile menu
│   │   ├── Footer.astro         # footer nav + NAP block
│   │   ├── ContactForm.astro    # the lead form (posts to /api/contact)
│   │   ├── BookCta.astro        # closing "Book a Productivity Assessment" band
│   │   ├── PageHero.astro       # inner-page hero (blueprint grid + dimension line)
│   │   ├── SectionHead.astro    # eyebrow label + H2 + lead
│   │   ├── ProcessDiagram.astro # See → Measure → Automate → Prove, connected
│   │   ├── ExampleChart.astro   # "Example data" chart in the Measure step
│   │   ├── LeaderCallout.astro  # leader-line annotation for the chart (SVG)
│   │   ├── DimensionLine.astro  # technical-drawing dimension divider
│   │   ├── CredentialsStrip.astro # trades / BCIT / custom builds strip
│   │   └── ServiceIcon.astro    # Lucide icon per service id
│   └── pages/
│       ├── index.astro          # home
│       ├── how-it-works.astro   # See / Measure / Automate / Prove
│       ├── services.astro       # the four services
│       ├── learn/               # Learn index + article template
│       ├── payback-calculator.astro  # client-side only; nothing stored or sent
│       ├── case-studies/        # index + template (hidden while empty)
│       ├── about.astro
│       ├── contact.astro        # Book a Productivity Assessment + service area
│       └── sitemap.xml.ts       # generates /sitemap.xml at build time
├── worker/
│   └── index.js                 # Worker: serves assets + handles /api/contact
├── wrangler.jsonc               # Worker config (name, main, assets dir/binding)
├── astro.config.mjs             # Astro config (site URL, MDX, fonts, Tailwind via Vite)
├── .nvmrc                       # pins Node 22 for the build
└── package.json
```

Each page composes `Header` and `Footer` inside `layouts/Base.astro`.

### Learn articles and case studies

Both are content collections (`src/content.config.ts`). Frontmatter:

| Field | Learn | Case studies |
|---|---|---|
| `title`, `description` | required | required |
| `category` | `benefits` or `methods` | — |
| `industry` | — | optional |
| `pubDate` | required | required |
| `draft` | default `false` | default `false` |

- **Drafts** (`draft: true`) render under `npm run dev` only, marked DRAFT and
  noindex. Every `npm run build`, including Cloudflare branch previews, leaves
  them out of the pages, the sitemap, and the nav. To publish, set
  `draft: false` and update `pubDate`.
- **Case studies** stay out of the nav and the sitemap, and `/case-studies` is
  noindex, until the first one is published. The hidden "Automation backed by
  your own numbers." section on the home page appears at the same time. Copy
  `src/content/case-studies/_template.md` to start one; files beginning with `_`
  are ignored.
- There is no RSS feed.

> Note: this project does **not** use a Cloudflare Pages `functions/` directory. Server logic lives in `worker/index.js` (Workers, not Pages).

---

## How the contact form works

1. **Frontend** (`src/components/ContactForm.astro`): on submit, prevents the default, gathers fields, and `fetch`-POSTs JSON to `/api/contact`. Shows an inline status message based on the JSON response (`{ ok: true }` or `{ ok: false, error }`).
2. **Honeypot:** a hidden `company-website` field, positioned off-screen. Real users never fill it. If it arrives filled, the Worker returns a fake success and discards the submission.
3. **Worker** (`worker/index.js`):
   - Validates required fields (`first-name`, `last-name`, `email`, `message`) and email format.
   - Writes a row to the Notion Leads database.
   - Emails info@frontiermfg.ca via Resend, with `reply_to` set to the submitter so you can reply directly.

### Notion Leads database — required schema

The Worker writes these exact property **names and types**. Changing them in Notion will break the write:

| Property  | Type         | Notes |
|-----------|--------------|-------|
| `Name`    | Title        | `first-name` + `last-name` joined |
| `Email`   | Email        | |
| `Company` | Rich text    | optional on the form |
| `Service` | Multi-select | written as a single-item array; new values auto-create options |
| `Message` | Rich text    | |
| `Status`  | Status       | set to `Not started`; **Status options are NOT auto-created** — the option must already exist |

Database ID lives in the `NOTION_DATABASE_ID` secret. The "Website Contact Form" Notion connection must be shared with the database (read/insert/update content).

---

## Environment variables (Worker secrets)

Set in the Cloudflare dashboard: Worker → Settings → Variables and Secrets (all encrypted). They are read at runtime via `env.*`.

| Variable             | Purpose |
|----------------------|---------|
| `NOTION_TOKEN`       | Notion connection access token (`ntn_...`) |
| `NOTION_DATABASE_ID` | Leads database ID |
| `RESEND_API_KEY`     | Resend API key, Sending access (`re_...`) |

Node version for builds is pinned by `.nvmrc` (22).

---

## Local development

```sh
npm install
npm run dev        # Astro dev server at localhost:4321 (static front end only)
```

The dev server does **not** run the Worker, so `/api/contact` won't work under `npm run dev`. To exercise the full Worker + assets locally:

```sh
npm run build              # produce ./dist
npx wrangler dev           # serves dist + worker/index.js together
```

For `/api/contact` to succeed locally you need the three secrets available to wrangler (e.g. a `.dev.vars` file — **do not commit it**).

---

## Deployment

Deployment is driven by Cloudflare Workers Builds, connected to this repo:

- **Push to a non-`main` branch** → `npx wrangler versions upload` → creates a **preview version** with a preview URL. Does **not** affect production traffic.
- **Merge/push to `main`** → `npx wrangler deploy` → promotes to **production**.

Build command: `npm run build` · Output/assets: `./dist`

> Testing tip: a branch's preview alias (`<branch>-frontiermfgwebsite.<subdomain>.workers.dev`) reflects the latest uploaded code. Production only changes when `main` deploys — don't confuse the two when testing.

## Commands

| Command            | Action                                      |
| :----------------- | :------------------------------------------ |
| `npm install`      | Install dependencies                        |
| `npm run dev`      | Astro dev server (front end only)           |
| `npm run build`    | Build static site to `./dist/`              |
| `npx wrangler dev` | Run Worker + assets locally                 |

---

## Theming

Charcoal and steel with one safety-orange accent. Every colour and font is a
token in the `@theme` block of `src/styles/global.css`, with a comment on each
saying what it is for; pages never hard-code hex values.

**Bands.** Every section is either `band-dark` (ink) or `band-light` (paper).
Components read role variables (`--text`, `--text-body`, `--text-muted`,
`--accent-text`, `--card`, `--line`) that each band sets, so the same card,
heading, or form field works on either. The home page alternates dark → light
→ dark → light → dark.

**Contrast rules** (all WCAG AA, checked with axe-core on every page):

| Use | Token | Ratio |
|---|---|---|
| Orange labels, icons on dark | `--color-safety` | 6.5:1 on ink |
| Orange labels, icons on light | `--color-safety-deep` | 5.4:1 on paper |
| Button text | `--color-ink` on `--color-safety` | 6.5:1 |
| Button hover | `--color-ink` on `--color-safety-hover` | 8.1:1 |
| Muted text on dark | `--color-steel-400` | 5.7:1 on ink |
| Muted text on light | `--color-steel-500` | 5.8:1 on paper |

Plain `--color-safety` is only 2.5:1 on paper, so on light bands it is for
decorative rules and stripes only, never text or icons. Never put white text
on orange. `--color-safety-dark` (the brief's hover colour) drops ink text to
4.3:1, so buttons hover lighter instead and it is used for rules on light.

**Motifs.** `.blueprint` (grid background on dark heroes and two other dark
bands), `DimensionLine`, `LeaderCallout`, numbered labels (`02 / MEASURE`), and
`.hazard` stripes, which appear in exactly two places: the top of the closing
CTA band and the bottom of the footer. Keep it at two.

**Motion.** Elements marked `data-reveal` fade and rise once when scrolled
into view (script in `Base.astro`); the example chart's bars grow in; the
calculator's results count up. Page changes use the browser's native
cross-document view transitions (CSS `@view-transition`). All of it is off
under `prefers-reduced-motion`, and content is never hidden if JS doesn't run.

**Photos.** None yet. Each place a real photo should go is marked
`TODO: photo` (hero, About, Services). No stock robot-arm or generic factory
images, and no AI-generated imagery.

---

## SEO

The site targets manufacturers in the Lower Mainland of BC. Rather than a thin
landing page per city, the regional signal comes from structured data plus one
visible service-area section — region-wide coverage.

**`src/data/site.ts` is the single source of truth.** Business name, address,
phone, and the service-area list live there; the contact page, the footer,
and the JSON-LD all read from it, so the NAP (name / address / phone) that
Google sees can never drift between them.

- **The phone number** is `business.phone` in `src/data/site.ts`, in display
  format. It drives the contact row, the footer, the `tel:` links, and
  `telephone` in the `LocalBusiness` schema. Setting it to `''` cleanly removes
  it from all four.
- **To change the service area**, edit `serviceAreaGroups`. The contact page
  section and the schema's `areaServed` both follow automatically.
- `priceRange` and `foundingYear` are optional and omitted while empty. Only
  fill them with real values — a wrong signal in schema is worse than none.

What is in place:

| Item | Where |
| :--- | :--- |
| Canonical URLs, per-page OG/Twitter cards | `src/layouts/Base.astro` |
| `ProfessionalService` schema, 17 municipalities in `areaServed` | `src/data/schema.ts` |
| `Service` schema | `src/pages/services.astro` |
| `Article` schema | `src/pages/learn/[...slug].astro` |
| `BreadcrumbList` schema | every inner page, via the `breadcrumb` prop |
| Visible service-area section | `src/pages/contact.astro` (`#service-area`) |
| `robots.txt`, `sitemap.xml` | `public/`, `src/pages/sitemap.xml.ts` |

Validate changes to the structured data with the
[Rich Results Test](https://search.google.com/test/rich-results). Only mark up
what is rendered on the page — Google treats markup for hidden content as a
violation.

**Not covered by this repo:** a Google Business Profile is the largest remaining
local-ranking factor and is set up outside the site. Register the same NAP that
`src/data/site.ts` publishes, or the mismatch works against you.

---

## Email / DNS notes

- Incoming mail: **Google Workspace** (MX → Google). Outgoing transactional mail from the form: **Resend** (sending domain frontiermfg.ca verified; receiving off).
- SPF/DKIM/DMARC configured in Cloudflare DNS. DMARC currently `p=quarantine` (unauthenticated mail is quarantined). Form mail via Resend passes DKIM (selector `resend`) and SPF (`send.frontiermfg.ca`), both aligned to `frontiermfg.ca`.
- Cloudflare SSL/TLS mode must be **Full** or **Full (strict)** — Flexible causes redirect loops.
