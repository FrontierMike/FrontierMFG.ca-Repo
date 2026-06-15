# Frontier MFG — Migration Status

**Last updated:** June 14, 2026 (live cutover done — 3 wrap-up steps remain)

> ## ▶️ START HERE TOMORROW
> The live site is **already on the Cloudflare Worker** (apex + www, HTTPS, contact
> form route confirmed). DNS cutover is done. Only three wrap-up items are left —
> none of them affect whether the site is up:
>
> 1. **Live form test** — on https://frontiermfg.ca submit the contact form once;
>    confirm success line + email to info@frontiermfg.ca + new Notion **Leads** row.
> 2. **Turn off GitHub Pages** — repo **Settings → Pages → Source: None**.
>    (Workflow + CNAME already removed, so Pages can't rebuild; this just formalizes it.)
> 3. **Confirm SSL/TLS mode** — Cloudflare → **SSL/TLS → Overview** = **Full** or
>    **Full (strict)** (NOT Flexible).
>
> After those three, Phase 5 is complete. Phase 6 (Turnstile) is optional — leave
> it until real spam appears. Rollback values (old Pages DNS) are saved at the
> bottom of this file if ever needed.
**Goal:** Move hosting from GitHub Pages → **Cloudflare Workers** (static assets + a Worker), and replace the broken `mailto:` contact form with a real endpoint that (1) emails info@frontiermfg.ca via Resend and (2) logs each submission to a Notion database.

> **Platform note:** Site is served as static assets by a Worker; the Worker also handles the `/api/contact` route. No Astro adapter is needed (the site stays a static build).

---

## Quick status

| Phase | What | Status |
|-------|------|--------|
| 0 | Domain off Wix → Cloudflare DNS + email verification | ✅ Done |
| 1 | Notion database + connection | ✅ Done |
| 2 | Resend email sending | ✅ Done |
| 3 | Code changes (Worker script + wrangler.jsonc + Contact.astro + .nvmrc) | ✅ Done |
| 4 | Configure Workers project + env vars, deploy + test on preview | ✅ Done — **happy path working on preview** |
| 4.5 | Clean the Worker before merge (remove debug, fix error handling) | ✅ Done — **fixed + verified on preview** |
| 5 | Cutover (custom domain on Worker, DNS off GitHub Pages) | 🔄 Live cutover done — **3 wrap-up steps left** (see top) |
| 6 | Spam hardening (Turnstile) | ⬜ Optional, after cutover |

**Phase 5 remaining:** ⬜ live form test · ⬜ turn off GitHub Pages · ⬜ confirm SSL/TLS = Full(strict)

---

## ✅ What works right now (verified on the preview alias)

Preview alias URL: `https://cloudflare-migration-frontiermfgwebsite.mikewait427.workers.dev`

A **happy-path** form submission on the preview:
- Returns the success message to the visitor.
- Sends an email to **info@frontiermfg.ca** via Resend (reply-to = the submitter).
- Creates a row in the Notion **Leads** database.
- No "logging failed" note (Notion write confirmed succeeding).

> ⚠️ Only the happy path is verified. The June 12 re-audit found the Worker on
> `cloudflare-migration` still contains debug blocks and a Resend error-handling
> bug that the happy-path test masked. **These must be fixed (Phase 4.5) before
> the merge in Phase 5** — see "Code defects found" below.

The live site (frontiermfg.ca) is **still on GitHub Pages** — nothing public has changed yet. Cutover is Phase 5.

---

## ⚠️ Key lesson from this session — read before Phase 5

The branch build runs `npx wrangler versions upload`, which **uploads a preview version but does NOT change production traffic.** Production stayed frozen on an old dashboard-deployed version (`325ed644`) the whole time, which is why early tests showed stale behaviour.

- **While on a branch:** only the **preview alias** reflects your latest code. Always test there, hard-refresh (Ctrl+Shift+R).
- **Production promotion happens on merge to `main`**, which runs `npx wrangler deploy`. That is what actually puts new code live. No separate "promote" click needed.

---

## Phase 0 — DNS + Email — ✅ DONE

- Registrar **Namecheap**, DNS **Cloudflare**, site **Active**.
- Google Workspace email verified: MX → Google; SPF pass/aligned; DKIM (`google._domainkey`) pass with `d=frontiermfg.ca`; DMARC (`p=none`) monitor-only.
- ⚠️ **Verify SSL/TLS mode is Full or Full (strict)** in Cloudflare (NOT Flexible — causes redirect loops). Confirm before/after cutover.

## Phase 1 — Notion — ✅ DONE

- **Leads database** properties (exact names + types — the Worker depends on these):
  - `Name` → **Title**
  - `Email` → **Email**
  - `Company` → **Rich text**
  - `Service` → **Multi-select**
  - `Message` → **Rich text**
  - `Status` → **Status** (writing option `Not started`)
- Connection "Website Contact Form" created, shared with the DB, capabilities: read/update/insert content.
- `NOTION_DATABASE_ID` = `375bfa506135809b814edbbe384b3aaa`

## Phase 2 — Resend — ✅ DONE

- Domain frontiermfg.ca verified (DKIM/MX/SPF all green). Sending ON, Receiving OFF.
- `RESEND_API_KEY` created (Sending access) and stored in the Worker. ✅

---

## Phase 3 — Code — ⚠️ MOSTLY DONE (defects outstanding)

In repo `FrontierMike/FrontierMFG.ca-Repo`, branch **`cloudflare-migration`**:

- `worker/index.js` — the Worker. Serves static site via `env.ASSETS`; handles `POST /api/contact` (validate → Notion → Resend). ⚠️ **Temp debug blocks are STILL present** (see defects below) — the earlier "all removed" note was inaccurate.
- `wrangler.jsonc` — `name: frontiermfgwebsite`, `main: worker/index.js`, `assets.directory: ./dist`, `assets.binding: ASSETS`. ✅ verified
- `src/components/Contact.astro` — honeypot field + fetch-to-`/api/contact` script (replaced the old mailto). ✅ verified; field names (`first-name`, `last-name`, `email`, `company`, `service`, `message`, `company-website`) match what the Worker reads.
- `.nvmrc` — `22`. ✅
- Old Pages-style `functions/` directory deleted.

**Property-type gotcha (resolved):** `Service` must be written as `multi_select` (array), `Status` as `status` (Notion's Status type, not Select). Status options are NOT auto-created by the API — `Not started` already exists in the DB. ✅ verified in code.

### Code defects found (June 12 re-audit) — fix in Phase 4.5

1. **Debug blocks never removed.** `worker/index.js` still has:
   - *TEMP DEBUG 1* (~lines 59–68): returns HTTP 500 if Notion secrets are missing.
   - *TEMP DEBUG 3* (~lines 100–102): if the Notion write **throws**, it returns a 500
     `NOTION THREW: …` to the browser **before the email is ever sent.**
2. **TEMP DEBUG 3 contradicts the design.** The code comment says Notion is *non-fatal*
   ("a failure must not lose the email lead"), but the debug `return` makes a Notion
   exception fatal — it kills the lead and shows the visitor an error.
3. **Resend `catch` is a copy-paste bug (~lines 134–137).** The catch around the email
   send sets `notionOk = false`, logs it as a *"Notion write error"*, and then **falls
   through to `return json({ ok: true })`.** So if the email send throws (e.g. a network
   blip to Resend), the visitor is told *"message sent"* while **no email arrives and
   nothing surfaces.** The email is the actual lead notification — it must never fail
   silently.

These were all masked by the Phase 4 happy-path test (Notion + Resend both succeeded).

---

## Phase 4 — Workers project + env vars — ✅ DONE

- Worker `frontiermfgwebsite` connected to repo. Build command `npm run build`; deploy `npx wrangler deploy` (prod), version `npx wrangler versions upload` (branches). Root dir `/`.
- Secrets set on the Worker (Settings → Variables and Secrets, all encrypted):
  - `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `RESEND_API_KEY`
- Preview tested end-to-end: email + Notion row both confirmed. ✅

---

## Phase 4.5 — Clean the Worker before merge — ✅ DONE

Shipped in commit "Fix contact Worker: remove debug blocks, correct error handling"
on `cloudflare-migration`, verified on the preview alias June 12.

1. ✅ **Deleted TEMP DEBUG 1** (the `NOTION SECRETS MISSING` 500 block).
2. ✅ **Deleted TEMP DEBUG 3** (the `NOTION THREW` 500 `return`). On a Notion throw it now
   sets `notionOk = false` and falls through to the email send — Notion is non-fatal by design.
3. ✅ **Fixed the Resend `catch` block.** An email-send throw now returns a 502 error instead
   of falling through to `ok: true`. Removed the stray `notionOk = false` / "Notion write
   error" mislabel.
4. ✅ **Verified on the preview alias.** Happy path confirmed June 12 (success line, email
   delivered, Notion row created). Failure path (email-sends-when-Notion-fails) not re-run this
   session — already confirmed in earlier sessions; the email body carries the
   `[Note: Notion logging failed…]` line in that case.

## Phase 5 — Cutover (affects live site) — 🔄 IN PROGRESS

Order matters to minimize downtime:

1. ✅ **Merged `cloudflare-migration` → main** (merge commit `1848510`, June 12). Production promotion ran; form **verified working on the production `*.workers.dev` URL** (email + Notion both confirmed on the new build). `deploy.yml` was deleted in the cutover merge (commit `55de23c`), so Pages is frozen on its last working build as a rollback fallback.
2. ✅ Added both `frontiermfg.ca` and `www.frontiermfg.ca` as Custom Domains on the Worker (June 14). **Gotcha:** the apex custom domain didn't stick on the first attempt — it left an orphaned `frontiermfg.ca` → `Worker` (Proxied) DNS record that resolved but served a Cloudflare **530** (no binding). Re-adding the bare apex `frontiermfg.ca` (no `www`) fixed it.
3. ✅ Old GitHub Pages apex A records + `www` CNAME deleted (values saved in Rollback section). Email records (MX/SPF/DKIM/DMARC, Google + Resend) left untouched.
   - **Verified live:** `https://frontiermfg.ca` and `https://www.frontiermfg.ca` both resolve to Cloudflare and return 200; apex serves our site and `/api/contact` GET returns the Worker's `405` — confirming the route is live on the real domain.
4. 🔄 Turn off GitHub Pages: repo Settings → Pages → Source: None (**dashboard — TODO**); `CNAME` file deleted from repo. deploy.yml already removed in step 1.
5. ⬜ Run one final **live** form test on https://frontiermfg.ca (email + Notion row).
6. ⬜ Re-confirm SSL/TLS = Full (strict).

## Phase 6 — Spam hardening — ⬜ OPTIONAL (after cutover)

- Add Cloudflare Turnstile only once real spam appears. Honeypot (Phase 3) handles lazy bots until then.

---

## Rollback (if live site breaks after cutover)

- Remove the custom domain from the Worker.
- Re-add the old GitHub Pages DNS records (captured June 14 — see below).
- Re-enable GitHub Pages: Settings → Pages → Source: GitHub Actions.

### Saved GitHub Pages DNS records (for rollback)

Apex `frontiermfg.ca` — four A records, **DNS only** (grey cloud), TTL Auto:

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | frontiermfg.ca | 185.199.108.153 | DNS only | Auto |
| A | frontiermfg.ca | 185.199.109.153 | DNS only | Auto |
| A | frontiermfg.ca | 185.199.110.153 | DNS only | Auto |
| A | frontiermfg.ca | 185.199.111.153 | DNS only | Auto |

(These are GitHub Pages' standard apex IPs.)

`www.frontiermfg.ca` — one CNAME, **DNS only** (grey cloud), TTL Auto:

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| CNAME | www.frontiermfg.ca | frontiermike.github.io | DNS only | Auto |

**Do NOT delete (email — unrelated to hosting, must stay):** Google MX (`aspmx.l.google.com` + alt1–4), SPF TXT (`v=spf1 include:_spf.google.com`), `google._domainkey` DKIM, `_dmarc` (`p=none`), and the Resend `send.frontiermfg.ca` MX + SPF + `resend._domainkey` records, plus the `google-site-verification` TXT.

---

## Post-cutover cleanup / watch

- **Service multi-select accumulates options:** each new service string the form submits auto-creates a Notion multi-select option. After a few real leads, merge any near-duplicates.
- Consider reverting DMARC from `p=none` to `p=quarantine` later, once aggregate reports look clean.
