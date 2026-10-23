# Sazvar Website — Master Handover

**Read this file first in any new session (ChatGPT, Claude, or otherwise).**

Last updated: 2026-10-23 (after a site audit).

## This is the live project

`E:\WEBSITE\SAZVAR\sazvar-static\` is the **only active codebase** for sazvar.com. It is **live** at https://sazvar.com (Hostinger, live since about 2026-09-13).

There is also `E:\WEBSITE\SAZVAR\sazvar-website\` — an earlier Next.js scaffold that was **abandoned** before real content was built into it. Its own `SAZVAR-HANDOVER.md` describes that abandoned attempt only; ignore it. Do not resume or reference that project unless the user explicitly asks to revisit the Next.js approach.

`E:\WEBSITE\SAZVAR\Sazvar Business Identity.docx` holds the approved brand/content facts (tagline, hero copy, services, colours, guardrails) — keep it in sync whenever site content changes.

## Business basics

- Sazvar is a Pakistan-based (Karachi) B2B solutions company: industrial engineering & plant maintenance, commercial & utility-scale solar, supply chain & heavy logistics, civil/infrastructure/facility services, procurement & sourcing, and corporate & financial solutions.
- Fully independent business — no ownership/branding link to DR Enterprise or HLM Consultants (the owner's separate finance consultancy).
- Currently serving Pakistan; already taking enquiries from GCC markets (UAE, Saudi Arabia, Qatar).
- Domain: sazvar.com — live on Hostinger. Mailbox: info@sazvar.com (Hostinger email).
- Owner: ZainUlAbdin.

## Tech stack

Plain HTML/CSS/JS pages, no framework and no build step. The **only** server-side code is `contact.php` (the contact form), which runs on Hostinger's PHP (8.3 as of the 2026-10-23 audit) and sends mail with a bundled copy of PHPMailer. No database.

Git: this folder is a git repo, remote `https://github.com/ZainUlAbdin-ACA/SAZVAR-STATIC.git` (branch `main`). **Hostinger auto-deploys from this repo: every push to `main` goes live on sazvar.com within about a minute** (confirmed 2026-10-23). Treat a push as a production release, and check the live site afterwards.

## File structure

```
sazvar-static/
├── index.html             Homepage
├── about.html             About + Our Leadership
├── faq.html               FAQs
├── contact.html           Contact form (posts to contact.php)
├── 404.html               Branded "page not found" (root-relative links, noindex)
├── contact.php            Form handler — validates, then emails info@sazvar.com
├── smtp-config.sample.php Template for smtp-config.php (server-only, never in git)
├── lib/phpmailer/         PHPMailer 6.9.3 (Exception.php, PHPMailer.php, SMTP.php)
├── robots.txt, sitemap.xml
├── .htaccess              Caching, security headers, 404 page, blocks internal files
├── hero-preview.html      Old design-comparison page — blocked from the web, kept as reference
├── IMAGES/, Brand Identity/  Raw source images and brand files — blocked from the web
├── README.md              Short quick-start notes
├── SAZVAR-HANDOVER.md     This file
└── assets/
    ├── css/style.css (+ style.min.css — the pages load the .min version)
    ├── js/main.js (+ .min)          Mobile menu, services dropdown, stats count-up, contact form
    ├── js/stack-scroll.js (+ .min)  Homepage stacked-section scroll effect
    └── img/                         Logo, hero/, services/, sectors/, leadership/
```

**Edit the non-minified file, then regenerate the `.min` file and bump its `?v=` number in every HTML page** — the pages load the `.min` versions, and `.htaccess` caches CSS/JS/images for a year.

Service image naming follows the category slug: `<slug>-card.jpg` (services grid on the homepage) and `<slug>-thumb.jpg` (nav dropdown). Current slugs: `engineering-shutdown-maintenance`, `commercial-utility-scale-solar`, `supply-chain-heavy-logistics`, `civil-infrastructure-facility-services`, `procurement-sourcing-solutions`, `corporate-financial-solutions`.

## Page-by-page

### index.html (homepage)

- **Dark hero** (`.hero-dark`, inside `#hero-stack-wrap`) — headline "Solutions That Move Your Business Forward.", supporting line, description, CTA buttons, and a crane visual that animates in on load.
- **Stats strip** (`.hero-stats-strip`, inside the hero) — animated once it scrolls into view: count-up 6 Service Areas / 21 Specialized Offerings / 567 Projects Delivered, an "Our Presence" tile with hand-drawn inline SVG flags (Pakistan/UAE/Saudi Arabia — emoji flags don't render as pictures on Windows, hence SVG), and a count-down "Layers Between You and Quality" (10 → 0).
- **Scroll story** (`#site-band` / `#site-stage`) — a 7-stage plant → truck → office → closing handshake sequence, desktop and mobile variants.
- **Stacked-section scroll effect** — every direct child section of `<main>` becomes a `.stack-panel`, pinning in turn so each new section covers the previous one. Driven by `assets/js/stack-scroll.js` (plain JS, no dependencies). Desktop only (≥960px wide AND ≥600px tall, via `body.stack-enabled`); falls back to normal scrolling for `prefers-reduced-motion`, smaller viewports, or keyboard tabbing. `<body class="homepage">` scopes it to the homepage only.
- **Services grid** ("Our Service Areas") — 6 category cards linking to the nav dropdown anchors.
- Sectors, Process, FAQ sections.
- Services **nav dropdown** (mega-menu, on every page) lists all 6 categories with sub-service bullets and thumbnails.

### about.html

- Company positioning copy — the "Why Sazvar" 6-card grid.
- **Our Leadership**: Raheel Rao (Managing Director – Operations, Engineer/Dawood University, 11 years) and ZainUlAbdin (Managing Director – Finance, Chartered Accountant/ICAP, 11 years). Centered flex grid (`.leadership-grid` / `.leadership-card`) — add another `.leadership-card` block for more members.

### contact.html + contact.php

- Fields: name, company/institution, work email, service (dropdown — kept in sync with the 6 service categories), requirement details, plus a hidden honeypot field (`website`) that silently discards bot submissions.
- `main.js` posts the form to `contact.php` with `fetch`. If the request itself fails (offline, PHP down), it falls back to opening a pre-filled `mailto:` draft so an enquiry is never lost.
- `contact.php` validates input, strips header-injection characters, and emails info@sazvar.com with Reply-To set to the enquirer.
  - **With `smtp-config.php` on the server** (in place since 2026-10-23): sends via authenticated SMTP (smtp.hostinger.com) — better deliverability.
  - **Without it**: falls back to PHP `mail()` (Hostinger limit: 10/min, 100/day; more likely to hit spam).
  - `smtp-config.php` holds the mailbox password, lives **only on the server**, and is git-ignored. Create it from `smtp-config.sample.php` via hPanel File Manager. Never send the password through git or an AI chat.
  - Send failures are written to the PHP error log (viewable in hPanel).

### 404.html

Served by `.htaccess` (`ErrorDocument 404`) for any missing URL. Uses root-relative paths (`/assets/...`) so it renders correctly at any URL depth — keep it that way if you edit it. Opening it directly from disk (file://) will look unstyled; that's expected.

## Server config (.htaccess)

- Caching: HTML always revalidated; images/CSS/JS cached 1 year (`immutable`) — hence the `?v=` cache-busting rule above.
- Security headers: HSTS (1 year, no includeSubDomains), nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy, Permissions-Policy. Hostinger itself adds `Content-Security-Policy: upgrade-insecure-requests`. A full CSP was not added because the pages use inline scripts/styles.
- Blocked from the web (return 404): `.git`, `IMAGES/`, `lib/`, `Brand Identity/`, any `.md` file, `hero-preview.html`, `smtp-config*.php`, `.gitignore`, `.htaccess`. These stay in the repo — they're just not public. **If you add another internal file, add it to these rules.**
- HTTP → HTTPS redirect is handled by Hostinger. SSL is Let's Encrypt (auto-renews).

## Email / DNS (as of 2026-10-23)

- MX → Hostinger (mx1/mx2.hostinger.com). SPF: `v=spf1 include:_spf.mail.hostinger.com ~all`.
- DMARC: `v=DMARC1; p=none` (monitor only). DKIM: not confirmed in the audit — check hPanel → Emails → DNS settings.

## Design system

**Light theme** (body, cards, about/contact pages): Primary Teal `#087C7A`, Deep Teal `#055E5D`, Ink `#20282B`, Muted `#5E696D`, background `#FCFCFA`, surface `#F2F4F3`, border `#DCE2E1`.

**Dark theme** (homepage hero + stats strip only): Hero Dark 1 `#06201F`, Hero Dark 2 `#0A3230`, Accent `#2FE6D6`, Accent Deep `#14B8A9`.

Tagline "Built On Reliability" appears once, directly under the bilingual "SAZVAR | سازوار" wordmark in the header — never repeated in hero body copy. No fabricated statistics anywhere on the site — every number shown is real.

## Performance notes

Hero images ship as WebP with PNG fallback, in two sizes (`-lg` for desktop, `-sm` for mobile) via `<picture>`, so phones don't download desktop-sized images. CSS/JS are minified (`.min` files). Keep this pattern for any new large image.

## Open / pending items

**Done 2026-10-23:** `smtp-config.php` created on the server (form now sends via SMTP), and a real test enquiry arrived in the info@sazvar.com inbox.

**Planned (optional, nothing urgent):**
3. Confirm DKIM is on, then tighten DMARC from `p=none` to `p=quarantine` (DNS change in hPanel).
4. PHPMailer 7.x is out (7.1.1, May 2026); site has 6.9.3. Major-version upgrade — test the form after upgrading. No known security issue in 6.9.3 at audit time.
5. Wording review, not yet acted on: "Commercial & Utility-Scale Solar" may overstate project scale, and "Freight Management & Fleet Solutions" may imply Sazvar owns trucks — possibly worth softening to match the "coordinator, not asset owner" positioning.
6. Possible orphaned images on disk from earlier service-category slugs — cosmetic cleanup only.
7. Optional: submit `https://sazvar.com/sitemap.xml` in Google Search Console.

## How to resume a session

1. Read this file, then skim `Sazvar Business Identity.docx` for approved copy/brand facts if writing new content.
2. Remember that pushing to `main` deploys live — only commit and push when the user asks.
3. Don't touch `E:\WEBSITE\SAZVAR\sazvar-website\` (abandoned Next.js attempt) or `E:\WEBSITE\SAZVAR\HLM\` (a different, unrelated business) as if they were this project.
