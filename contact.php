<?php
/**
 * Sazvar contact form handler.
 *
 * Plain PHP mail() — no frameworks/dependencies, matching the rest of this
 * site's "no build step" approach. Runs on Hostinger's own PHP (included
 * free with the hosting plan; no signup, no submission cap, no third party
 * seeing the enquiry).
 *
 * If mail ever lands in spam / doesn't arrive, the usual fix is adding an
 * SPF record for sazvar.com authorizing Hostinger's mail servers, and/or
 * switching this to SMTP via an actual info@sazvar.com mailbox — see
 * SAZVAR-HANDOVER.md.
 */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
    exit;
}

// Strip characters that could be used for email header injection.
function clean_line($value) {
    return trim(preg_replace('/[\r\n]+/', ' ', (string) $value));
}

function field($name, $maxLength) {
    $value = isset($_POST[$name]) ? clean_line($_POST[$name]) : '';
    return mb_substr($value, 0, $maxLength);
}

$name     = field('name', 100);
$org      = field('organization', 160);
$email    = field('email', 254);
$service  = field('service', 120);
$details  = isset($_POST['details']) ? trim($_POST['details']) : '';
$details  = mb_substr($details, 0, 5000);
$honeypot = field('website', 200); // hidden field — real visitors never fill this in

// Bots that fill in the honeypot get a fake success with no email sent.
if ($honeypot !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$errors = [];
if (mb_strlen($name) < 2) $errors[] = 'name';
if ($org === '') $errors[] = 'organization';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($service === '') $errors[] = 'service';
if (mb_strlen($details) < 20) $errors[] = 'details';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please check: ' . implode(', ', $errors)]);
    exit;
}

$to = 'info@sazvar.com';
$subject = 'Sazvar enquiry from ' . $name;

$body = implode("\n", [
    'Name: ' . $name,
    'Company/Institution: ' . $org,
    'Email: ' . $email,
    'Service: ' . $service,
    '',
    'Requirement:',
    $details,
]);

// From stays on the site's own domain so mail hosts don't flag it as
// spoofed; Reply-To is the enquirer's address so hitting "Reply" in your
// inbox goes straight back to them.
$headers = implode("\r\n", [
    'From: Sazvar Website <no-reply@sazvar.com>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
]);

$sent = @mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'The message could not be sent. Please email info@sazvar.com directly.']);
}
