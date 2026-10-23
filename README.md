# Sazvar Website (plain HTML/CSS/JS)

Live at https://sazvar.com (Hostinger). No framework, no build step. The only server-side code is `contact.php`, the contact form handler. **See `SAZVAR-HANDOVER.md` for full details.**

## Files

- `index.html`, `about.html`, `faq.html`, `contact.html`, `404.html` — the pages
- `contact.php` — contact form handler (emails info@sazvar.com; SMTP via `smtp-config.php` on the server, else PHP `mail()`)
- `assets/css/style.css`, `assets/js/*.js` — source files; the pages load the `.min` versions
- `assets/img/` — all images used by the site
- `.htaccess` — caching, security headers, 404 page, and blocking of internal files

## Editing

Change the text directly in any `.html` file. If you edit `style.css` or a `.js` file, regenerate its `.min` file and bump the `?v=` number where it's loaded in every page. Otherwise visitors keep the cached old version for up to a year.

## Deploy to Hostinger

Push to `main` on GitHub. Hostinger auto-deploys it to sazvar.com within about a minute. Never commit `smtp-config.php`; create it on the server only.
