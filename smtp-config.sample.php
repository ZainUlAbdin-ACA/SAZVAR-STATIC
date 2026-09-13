<?php
/**
 * SMTP credentials for contact.php — TEMPLATE, safe to commit to git.
 *
 * On the LIVE SERVER only (never in this git repo, never sent through any
 * chat/AI tool): copy this file to "smtp-config.php" in the same folder and
 * fill in the real mailbox password. contact.php loads smtp-config.php if
 * it exists and falls back to PHP's plain mail() if it doesn't, so the site
 * keeps working either way — this file just upgrades deliverability once
 * it's in place.
 *
 * Steps:
 * 1. In hPanel, create (or confirm) the mailbox info@sazvar.com under
 *    Emails, and set/know its password.
 * 2. Copy this file to smtp-config.php via Hostinger's File Manager (or an
 *    FTP client) directly on the server — do NOT do this through git.
 * 3. Fill in SMTP_PASSWORD below with that mailbox's real password.
 * 4. Never `git add` smtp-config.php — it's already in .gitignore, but
 *    double-check before any commit that includes it.
 */

define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 465);              // 465 = SSL (default). Use 587 + 'tls' below if 465 is blocked.
define('SMTP_SECURE', 'ssl');          // 'ssl' for port 465, 'tls' for port 587.
define('SMTP_USERNAME', 'info@sazvar.com');
define('SMTP_PASSWORD', 'REPLACE-WITH-THE-REAL-MAILBOX-PASSWORD');
