# Frontier MFG — Design System

**Domain:** frontiermfg.ca · **Stack:** Astro + Tailwind CSS v4 · **Theme:** dark

Reference for the site as it stands. Not a build brief — the site is built, and
this describes what is there. All colour tokens live in
`src/styles/global.css`; that file is the source of truth and this document
explains the intent behind it.

---

## Theme

The site is dark throughout. The palette originated as the Lightwell hero
treatment and was promoted to every page, so there is no light mode and no
toggle — a section is dark, deeper, or deepest, never light.

### Colour tokens

Defined in the `@theme` block of `src/styles/global.css` and referenced as
`var(--color-…)`. Pages should not hard-code hex values.

| Token | Hex | Usage |
| :---- | :---- | :---- |
| `--color-bg` | `#131c24` | Page base |
| `--color-bg-alt` | `#0f1820` | Alternating section band |
| `--color-bg-deep` | `#0a1016` | Footer, deepest chrome |
| `--color-surface` | `#1a2430` | Solid cards |
| `--color-panel` | `#0e141b` | Dashboard mockup inner panels |
| `--color-panel-deep` | `#0a0e13` | Dashboard mockup shell |
| `--color-text` | `#f2f5f7` | Headings, emphasis |
| `--color-body` | `#c3ccd3` | Body copy |
| `--color-muted` | `#9aa4ad` | Meta, labels, mono eyebrows |
| `--color-faint` | `#6b7079` | Chart axis labels only |
| `--color-accent` | `#b3261e` | **Fills only** — buttons, ticks, rules |
| `--color-accent-text` | `#e2564a` | **Text only** — the accent, lightened |
| `--color-accent-hover` | `#c92d24` | Button hover |
| `--color-ok` | `#73bf69` | Status: running, healthy, success |
| `--color-warn` | `#d9a520` | Status: caution, chart bars |
| `--color-bad` | `#f2495c` | Status: downtime, error |

Non-`@theme` helpers on `:root`: `--border` (10% white), `--border-soft` (6%),
`--border-hard` (20%), `--glass` (4% white card fill), `--accent-tint` and
`--accent-edge` (12% / 35% red, for pills).

### The accent split — read before editing

The brand red `#b3261e` measures **2.63:1** against `--color-bg`. WCAG AA wants
4.5:1 for body text, so the brand red is unreadable as type on this background
even though it is fine as a button fill with white text on it (6.54:1).

So the accent is two tokens:

- `--color-accent` (`#b3261e`) — **fills**: button backgrounds, the `.tick`
  rule, the 2px card edge markers. Never `color:`.
- `--color-accent-text` (`#e2564a`) — **type and icons**: eyebrows, links,
  inline arrows, step numbers. **4.65:1**, passes AA.

Every text colour token passes AA on `--color-bg`: text 15.7:1, body 10.6:1,
muted 6.8:1. `--color-faint` is 3.5:1 and is reserved for large or decorative
chart labels, never prose.

---

## Typography

Both faces are loaded from Google Fonts in `src/layouts/Base.astro`.

- **IBM Plex Sans** — weights 300/400/500/600/700. Headings and body.
- **IBM Plex Mono** — weights 400/500. Eyebrows, labels, data, numerals, arrows.

Mono signals "instrument readout": section eyebrows, form labels, the footer
NAP block, dashboard values, and the `→` in buttons.

### Type scale

Headings are fluid via `clamp(min, vw, max)`:

| Role | Value |
| :---- | :---- |
| Hero `h1` (home) | `clamp(40px, 5.2vw, 68px)` |
| Hero `h1` (Lightwell) | `clamp(40px, 5vw, 66px)` |
| Hero `h1` (Services) | `clamp(38px, 4.8vw, 60px)` |
| Section `h2` | `clamp(30px, 3.6vw, 46px)` |
| Section `h2`, dark CTA | `clamp(30px, 3.8vw, 50px)` |
| Closing CTA `h2` | `clamp(28px, 3.4vw, 44px)` |
| Card `h3` | 19–22px |
| Lead paragraph | 18–19px |
| Body | 15px |
| Card body | 14.5px |
| Mono label | 11–12px |

Headings use `letter-spacing:-0.02em` and `font-weight:600`; mono eyebrows use
`letter-spacing:0.16em` and `text-transform:uppercase`.

---

## Layout

- Content column: `max-width:1200px`, `padding:0 32px`. Narrower for centred
  copy (900–1000px).
- Section rhythm: `clamp(72px, 9vw, 120px)` for major sections,
  `clamp(64px, 8vw, 104px)` and `clamp(56px, 7vw, 88px)` for tighter ones.
- Card grids: `repeat(auto-fit, minmax(230–370px, 1fr))`.
- Bordered grids use a 1px gap filled with `var(--border)` over a
  `var(--border)` background — the gap *is* the rule.
- Nav breakpoint: **860px**. Above, `.nav-desktop`; below, `.menu-btn` and
  `.nav-mobile`.

### Section textures

Light marks on the dark ground, alternating to separate bands:

| Class | Ground | Mark |
| :---- | :---- | :---- |
| `.dots-hero` | `bg` → `bg-alt` gradient | 7% dots, 22px |
| `.dots-white` | `bg` | 6% dots, 22px |
| `.dots-grey` | `bg-alt` | 7% dots, 22px |
| `.lines-white` | `bg` | 4% grid, 26px |
| `.lines-grey` | `bg-alt` | 5% grid, 26px |
| `.grid-dark-overlay` | transparent | 3% grid, 56px |

Home and Services use the dot textures; Lightwell uses the line grid.

---

## Components

Shared components are `src/components/Header.astro` and `Footer.astro`. Every
other section is inline in its page — the site is small enough that extracting
them would cost more than it saves.

- **Header** — sticky, `rgba(19,28,36,0.88)` with a 10px backdrop blur.
- **Footer** — `--color-bg-deep`, nav row plus the NAP block in mono.
- **`.btn-red` / `.btn-red-sm`** — accent fill, white text.
- **`.btn-outline` / `.btn-ghost-dark`** — transparent, `--border-hard` edge.
  Now identical; both are kept because pages reference each.
- **`.eyebrow`** — mono, uppercase, `--color-accent-text`.
- **`.tick`** — 72×9px repeating accent rule above section headings.
- **`.pill-soon`** — the "SOON" chip beside Lightwell in the nav.
- **Forms** — `.input-dark` and `.input-light` are the same dark treatment;
  `.input-light` is an alias kept so the Lightwell pilot form works unchanged.
  Focus ring is `--color-accent-text`.

### Motion

- `.marquee-track` — 38s linear capability ticker, pauses on hover.
- `.pulse-dot` — 1.6s live-status pulse.
- `html { scroll-behavior: smooth }` with `scroll-margin-top:84px` on anchored
  sections to clear the sticky header.

---

## Editing rules

1. **Use tokens.** No new hex values in page markup. If a colour is missing,
   add a token rather than a literal.
2. **Respect the accent split.** `--color-accent` fills, `--color-accent-text`
   types. Getting this wrong produces text nobody can read.
3. **Check contrast** for any new colour against `--color-bg`: 4.5:1 for body
   text, 3:1 for large text.
4. **Status colours are semantic**, not thematic. Green/amber/red keep their
   meaning in the dashboard mockups regardless of theme.
5. `og-image.png` is generated by `scripts/og-image.py` and uses the same
   palette — regenerate it if the brand colours change.
