# Sazvar Website — Master Handover

**Read this file first in any new session (ChatGPT, Claude, or otherwise).**

Last updated: 2026-09-12.

## This is the live project

`E:\WEBSITE\SAZVAR\sazvar-static\` is the **only active codebase** for sazvar.com.

There is also `E:\WEBSITE\SAZVAR\sazvar-website\` — an earlier Next.js scaffold that was **abandoned** before real content was built into it. Its own `SAZVAR-HANDOVER.md` describes that abandoned attempt only; ignore it. Do not resume or reference that project unless the user explicitly asks to revisit the Next.js approach.

`E:\WEBSITE\SAZVAR\Sazvar Business Identity.docx` holds the approved brand/content facts (tagline, hero copy, services, colours, guardrails) — keep it in sync whenever site content changes.

## Business basics

- Sazvar is a Pakistan-based (Karachi) B2B solutions company: industrial engineering & plant maintenance, commercial & utility-scale solar, supply chain & heavy logistics, civil/infrastructure/facility services, procurement & sourcing, and corporate & financial solutions.
- Fully independent business — no ownership/branding link to DR Enterprise or HLM Consultants (the owner's separate finance consultancy).
- Currently serving Pakistan; already taking enquiries from GCC markets (UAE, Saudi Arabia, Qatar).
- Domain: sazvar.com (purchased, not yet pointed at a live deployment — see "Deployment status" below).
- Owner: ZainUlAbdin (zainca02@gmail.com).

## Tech stack

Plain HTML/CSS/JS. No framework, no build step, no `npm install` needed to preview or edit. Every page is a static `.html` file that can be opened directly in a browser.

## File structure

```
sazvar-static/
├── index.html            Homepage
├── about.html            About + Our Leadership
├── contact.html          Contact form (mailto: fallback only, see "Open items")
├── hero-preview.html      Legacy comparison page used while designing the dark hero — not linked from the live site, safe to ignore/delete
├── README.md              Quick-start editing/deploy notes (shorter, less detailed than this file)
├── SAZVAR-HANDOVER.md     This file
└── assets/
    ├── css/style.css      All styling, single file
    ├── js/main.js         Mobile menu, services dropdown, stats count-up animation, contact form handler
    ├── js/stack-scroll.js Homepage-only stacked-section scroll effect (see "Page-by-page" below)
    └── img/
        ├── sazvar-mark.svg, sazvar-primary.svg   Logo
        ├── hero/           Crane, plant pieces, truck, site-office renders used in the homepage scroll story
        ├── services/       Card + thumbnail images per service category (see naming below)
        └── leadership/     Headshots for the Our Leadership section
```

Service image naming follows the category slug: `<slug>-card.jpg` (services grid on the homepage) and `<slug>-thumb.jpg` (nav dropdown). Current slugs: `engineering-shutdown-maintenance`, `commercial-utility-scale-solar`, `supply-chain-heavy-logistics`, `civil-infrastructure-facility-services`, `procurement-sourcing-solutions`, `corporate-financial-solutions`.

## Page-by-page

### index.html (homepage)

- **Dark hero** (`.hero-dark`, inside `#hero-stack-wrap`) — headline "Solutions That Move Your Business Forward.", supporting line, description, CTA buttons, and a crane visual that animates in on load.
- **Stats strip** (`.hero-stats-strip`, inside the hero) — animated once it scrolls into view: count-up 6 Service Areas / 21 Specialized Offerings / 567 Projects Delivered, an "Our Presence" tile with hand-drawn inline SVG flags (Pakistan/UAE/Saudi Arabia — emoji flags don't render as pictures on Windows, hence SVG), and a count-down "Layers Between You and Quality" (10 → 0).
- **Stacked-section scroll effect** (site-wide on the homepage, implemented via a separate AI tool "Codex" on 2026-09-12 — supersedes an earlier hero-only pinning fix): every direct child section of `<main>` becomes a `.stack-panel`, pinning in turn as the user scrolls so each new section rises and covers the previous one (subtle darken via a `--stack-shade` custom property, no bounce/spin). Driven entirely by `assets/js/stack-scroll.js` (plain JS, no GSAP or other dependency) — it measures panel geometry on load/resize, sets `--stack-top` per panel so oversized panels finish scrolling before they pin, and updates `--stack-shade` plus `--plant-progress` / `--truck-progress` / `--office-progress` (for the plant → truck → office chapter reveal inside `#site-band` / `#site-stage`) on every scroll frame. Active only on desktop (≥960px width AND ≥600px height) — enabled via `body.stack-enabled` (set in JS, gated on a `(min-width: 960px) and (min-height: 600px)` media query) and CSS in `assets/css/style.css` under `.homepage`/`.stack-enabled`/`.stack-panel`. Automatically falls back to normal document flow (no pinning) when `prefers-reduced-motion: reduce` is set, when the viewport is smaller than the desktop threshold, or once the user tabs via keyboard (so focus never lands on a link hidden behind another layer). Anchor links (`#id`) are re-aligned correctly against normal flow via `alignAnchor()`. `<body class="homepage">` on index.html is what scopes all of this to the homepage only — about.html/contact.html are unaffected and scroll normally.
- **Services grid** ("Our Service Areas") — 6 category cards linking to the nav dropdown anchors.
- Sectors, Process, FAQ sections (unchanged structural boilerplate).
- Services **nav dropdown** (mega-menu, in the header, present on all 3 pages) lists all 6 categories with sub-service bullets and thumbnail images.

### about.html

- Company positioning copy (accountable coordinator, technical/commercial clarity, etc.) — the "Why Sazvar" 6-card grid.
- **Our Leadership** (added 2026-09-12): Raheel Rao (Managing Director – Operations, Engineer/Dawood University, 11 years) and ZainUlAbdin (Managing Director – Finance, Chartered Accountant/ICAP, 11 years). Built as a centered flex grid (`.leadership-grid` / `.leadership-card` / `.leadership-photo` in style.css) so it accepts more members later without layout changes — just add another `.leadership-card` block.

### contact.html

- Form fields: name, company/institution, work email, service (dropdown — kept in sync with the 6 service categories), requirement details.
- **No real backend yet** — submit builds a `mailto:` link via `assets/js/main.js`; nothing is actually sent through the site. See "Open items."

## Design system

**Light theme** (body, cards, about/contact pages): Primary Teal `#087C7A`, Deep Teal `#055E5D`, Ink `#20282B`, Muted `#5E696D`, background `#FCFCFA`, surface `#F2F4F3`, border `#DCE2E1`.

**Dark theme** (homepage hero + stats strip only): Hero Dark 1 `#06201F`, Hero Dark 2 `#0A3230`, Accent `#2FE6D6`, Accent Deep `#14B8A9`.

Tagline "Built On Reliability" appears once, directly under the bilingual "SAZVAR | سازوار" wordmark in the header — never repeated in hero body copy. No fabricated statistics anywhere on the site — every number shown is real.

## Deployment status

**Not yet deployed.** The domain sazvar.com is purchased but not pointed at any hosting. This is a plain static site, so deployment is simple whenever the user is ready:

- Simplest: Hostinger File Manager/FTP — upload everything in `sazvar-static/` (keeping `assets/` intact) to the domain's `public_html`. No build step, no Node hosting.
- Alternative: GitHub Pages — push this folder to a repo and enable Pages; works fine for a static site, but is a separate decision from the Hostinger route above (don't do both without the user choosing).
- No git repository exists yet for this project folder.

## Open / pending items

1. Real contact-form backend (Web3Forms, Formspree, or similar) — currently `mailto:` only.
2. Domain DNS / hosting decision (Hostinger vs. GitHub Pages) and actually going live.
3. Wording review, flagged to the user, not yet acted on: "Commercial & Utility-Scale Solar" may overstate project scale, and "Freight Management & Fleet Solutions" may imply Sazvar owns trucks — both possibly worth softening to match the "coordinator, not asset owner" positioning used elsewhere.
4. Possible leftover orphaned images on disk from earlier service-category slugs (pre-restructure) — cosmetic disk cleanup only, not user-facing.
5. `hero-preview.html` is a leftover design-comparison page, not linked anywhere — safe to delete whenever, kept for now only as a reference of the "before" light-hero design.

## How to resume a session

1. Read this file, then skim `Sazvar Business Identity.docx` for approved copy/brand facts if writing new content.
2. Confirm with the user whether deployment status has changed before assuming the site is or isn't live.
3. Don't touch `E:\WEBSITE\SAZVAR\sazvar-website\` (abandoned Next.js attempt) or `E:\WEBSITE\SAZVAR\HLM\` (a different, unrelated business) as if they were this project.
