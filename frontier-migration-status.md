# Frontier MFG — Migration Status

**Last updated:** June 12, 2026 (code re-audit)
**Goal:** Move hosting from GitHub Pages → **Cloudflare Workers** (static assets + a Worker), and replace the broken `mailto:` contact form with a real endpoint that (1) emails info@frontiermfg.ca via Resend and (2) logs each submission to a Notion database.

> **Platform note:** Site is served as static assets by a Worker; the Worker also handles the `/api/contact` route. No Astro adapter is needed (the site stays a static build).

---

## Quick status

| Phase | What | Status |
|-------|------|--------|
| 0 | Domain off Wix → Cloudflare DNS + email verification | ✅ Done |
| 1 | Notion database + connection | ✅ Done |
| 2 | Resend email sending | ✅ Done |
| 3 | Code changes (Worker script + wrangler.jsonc + Contact.astro + .nvmrc) | ⚠️ Mostly done — **debug blocks NOT removed; Resend catch bug** |
| 4 | Configure Workers project + env vars, deploy + test on preview | ✅ Done — **happy path working on preview** |
| 4.5 | Clean the Worker before merge (remove debug, fix error handling) | ⬜ **NEXT — blocks cutover** |
| 5 | Cutover (custom domain on Worker, DNS off GitHub Pages) | ⬜ Not started |
| 6 | Spam hardening (Turnstile) | ⬜ Optional, after cutover |

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

## Phase 4.5 — Clean the Worker before merge — ⬜ NEXT (blocks cutover)

Do this on `cloudflare-migration` and re-verify on the preview alias **before** Phase 5.
The whole point: never tell a visitor "sent" unless the email actually went out.

1. **Delete TEMP DEBUG 1** (the `NOTION SECRETS MISSING` 500 block).
2. **Delete TEMP DEBUG 3** (the `NOTION THREW` 500 `return`). On a Notion throw, just set
   `notionOk = false` and **fall through to the email send** — Notion is non-fatal by design.
3. **Fix the Resend `catch` block.** On an email-send throw it must return a real error,
   e.g. `return json({ ok: false, error: "Could not send your message. Please email
   info@frontiermfg.ca directly." }, 502)` — **not** fall through to `ok: true`. Remove the
   stray `notionOk = false` / "Notion write error" mislabel.
4. **Re-test on the preview alias, including a failure path.** Temporarily break the Notion
   token and confirm: the email **still sends**, the visitor gets success, and the email body
   carries the `[Note: Notion logging failed…]` line. Then restore the token. Hard-refresh
   (Ctrl+Shift+R) between tests.
5. (Optional but tidy) Fold the GitHub Pages teardown into this branch so the cutover merge
   is a single clean promotion — see Phase 5 step 1 note.

## Phase 5 — Cutover (affects live site) — ⬜ After 4.5

Order matters to minimize downtime:

1. **Merge `cloudflare-migration` → main.** This triggers `npx wrangler deploy` = production promotion. Verify the form works on the production `*.workers.dev` URL (NOT just the preview alias).
   - ⚠️ `.github/workflows/deploy.yml` still fires on push to `main` and redeploys **GitHub Pages**. It's harmless here (DNS still points at Pages), but cleaner to **delete `deploy.yml` in this same merge** rather than waiting for step 4, so the merge doesn't trigger one last Pages build.
   - ⚠️ Precondition: confirm the Cloudflare **Workers Build** is actually wired to run `npx wrangler deploy` on `main` (dashboard-side). The entire promotion depends on it.
2. Worker → **Settings → Domains & Routes → Add → Custom Domain** → add `frontiermfg.ca` and `www.frontiermfg.ca`. Cloudflare auto-creates proxied DNS records pointing at the Worker.
3. Remove old GitHub Pages DNS records in Cloudflare (A/AAAA at GitHub IPs and/or CNAME to `frontiermike.github.io`). **Save their values first for rollback.** (Step 2 may replace these automatically — confirm no stale GitHub records remain.)
4. Turn off GitHub Pages: repo Settings → Pages → Source: None; delete `.github/workflows/deploy.yml` (if not already removed in step 1); delete the `CNAME` file.
5. Wait for propagation, load https://frontiermfg.ca, confirm it serves from the Worker (valid HTTPS), run one final **live** form test (email + Notion row).
6. Re-confirm SSL/TLS = Full (strict).

## Phase 6 — Spam hardening — ⬜ OPTIONAL (after cutover)

- Add Cloudflare Turnstile only once real spam appears. Honeypot (Phase 3) handles lazy bots until then.

---

## Rollback (if live site breaks after cutover)

- Remove the custom domain from the Worker.
- Re-add the old GitHub Pages DNS records (kept from Phase 5 step 3).
- Re-enable GitHub Pages: Settings → Pages → Source: GitHub Actions.

---

## Post-cutover cleanup / watch

- **Service multi-select accumulates options:** each new service string the form submits auto-creates a Notion multi-select option. After a few real leads, merge any near-duplicates.
- Consider reverting DMARC from `p=none` to `p=quarantine` later, once aggregate reports look clean.
