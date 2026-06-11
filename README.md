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

- **Static site:** Astro builds to `./dist`. The Worker serves those files via the `ASSETS` binding. A request matching a static file is served directly — the Worker function only runs for unmatched paths (i.e. `/api/contact`).
- **Contact form:** `src/components/Contact.astro` posts JSON to `/api/contact`. The Worker validates, logs to Notion, and emails the lead. Notion failures are non-fatal (logged, email still sends) so a lead is never lost; a Resend failure returns an error to the visitor.
- **No Astro adapter:** the site is a pure static build. The only dynamic code is the standalone Worker route.

## Tech stack

- Astro (static output), Tailwind
- Cloudflare Workers + Static Assets (`wrangler`)
- Resend (transactional email)
- Notion API (lead logging)

---

## Project structure

```text
/
├── public/                     # static assets
├── src/
│   ├── components/
│   │   └── Contact.astro        # contact form + client fetch to /api/contact
│   └── pages/
│       └── index.astro
├── worker/
│   └── index.js                 # Worker: serves assets + handles /api/contact
├── wrangler.jsonc               # Worker config (name, main, assets dir/binding)
├── .nvmrc                       # pins Node 22 for the build
└── package.json
```

> Note: this project does **not** use a Cloudflare Pages `functions/` directory. Server logic lives in `worker/index.js` (Workers, not Pages).

---

## How the contact form works

1. **Frontend** (`src/components/Contact.astro`): on submit, prevents the default, gathers fields, and `fetch`-POSTs JSON to `/api/contact`. Shows an inline status message based on the JSON response (`{ ok: true }` or `{ ok: false, error }`).
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

## Email / DNS notes

- Incoming mail: **Google Workspace** (MX → Google). Outgoing transactional mail from the form: **Resend** (sending domain frontiermfg.ca verified; receiving off).
- SPF/DKIM/DMARC configured in Cloudflare DNS. DMARC currently `p=none` (monitor).
- Cloudflare SSL/TLS mode must be **Full** or **Full (strict)** — Flexible causes redirect loops.
