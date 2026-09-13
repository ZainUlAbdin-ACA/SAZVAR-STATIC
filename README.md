# Sazvar Website (plain HTML/CSS/JS)

No framework, no build step, no npm install required to preview or edit.

## Files

- `index.html` — homepage (hero, services, sectors, process, FAQ)
- `about.html` — about page
- `contact.html` — contact form (currently opens the visitor's email client with the enquiry pre-filled — see note below)
- `assets/css/style.css` — all styling, in one file
- `assets/js/main.js` — mobile menu toggle + contact form handling
- `assets/img/` — logo files (SVG)

## Editing

Every page is plain HTML — open any `.html` file in a text editor and change the text directly. There's nothing to compile or install. To preview, just double-click `index.html` to open it in a browser, or right-click → "Open with" your browser of choice.

## Before launch

1. **Contact details** — replace the placeholder `info@sazvar.com` address in the footer of each page and in `assets/js/main.js` with your real, verified contact email.
2. **Contact form** — currently uses a `mailto:` link (opens the visitor's email client, nothing is sent automatically). For a proper inbox-delivered form later, a service like Web3Forms or Formspree can be added with a few lines in `assets/js/main.js` — no framework needed.
3. Update the tagline/colors here if the brand identity changes further — colors live at the top of `assets/css/style.css` (`:root` variables).

## Deploy to Hostinger

Since this is plain static HTML/CSS/JS, there's no build step and no Node hosting required:

1. In hPanel, go to File Manager (or use FTP) for the `sazvar.com` domain's `public_html` folder.
2. Upload all files in this folder (keeping the `assets/` folder structure intact).
3. That's it — no GitHub, no auto-deploy pipeline, no `npm install` needed on the server.

If you'd like Git version history anyway (recommended even for static sites), a plain `git init` + a new GitHub repo works the same way as before — just without any build step in between.
