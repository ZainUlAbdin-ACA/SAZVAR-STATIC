<?php
/**
 * Sazvar contact form handler.
 *
 * Sends via SMTP (PHPMailer, through the info@sazvar.com mailbox) when
 * smtp-config.php exists on the server — that gives proper SPF/DKIM
 * authentication, so mail is far less likely to land in spam, and sidesteps
 * Hostinger's tight rate limit on the plain mail() function (10/min, 100/day
 * — see https://www.hostinger.com/support/11393648).
 *
 * smtp-config.php holds the real mailbox password and is never committed to
 * this public repo (see .gitignore + smtp-config.sample.php for setup). If
 * it isn't present yet — e.g. right after a fresh deploy, before that file
 * has been created on the server — this falls back to PHP's plain mail()
 * so the form keeps working either way; it just upgrades automatically the
 * moment smtp-config.php is added.
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

$sent = false;
$sendError = '';

$smtpConfigFile = __DIR__ . '/smtp-config.php';
if (file_exists($smtpConfigFile)) {
    require_once __DIR__ . '/lib/phpmailer/Exception.php';
    require_once __DIR__ . '/lib/phpmailer/PHPMailer.php';
    require_once __DIR__ . '/lib/phpmailer/SMTP.php';
    require_once $smtpConfigFile;

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USERNAME;
        $mail->Password   = SMTP_PASSWORD;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port       = SMTP_PORT;
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom(SMTP_USERNAME, 'Sazvar Website');
        $mail->addAddress($to);
        // Reply-To is the enquirer's own address, so hitting "Reply" in your
        // inbox goes straight back to them.
        $mail->addReplyTo($email, $name);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->isHTML(false);

        $mail->send();
        $sent = true;
    } catch (Exception $e) {
        $sendError = $mail->ErrorInfo;
    }
} else {
    // No SMTP credentials on the server yet — fall back to plain mail().
    // From stays on the site's own domain so mail hosts don't flag it as
    // spoofed; Reply-To is the enquirer's address.
    $headers = implode("\r\n", [
        'From: Sazvar Website <no-reply@sazvar.com>',
        'Reply-To: ' . $name . ' <' . $email . '>',
        'Content-Type: text/plain; charset=UTF-8',
    ]);
    $sent = @mail($to, $subject, $body, $headers);
    if (!$sent) $sendError = 'mail() returned false';
}

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    error_log('Sazvar contact form send failure: ' . $sendError);
    echo json_encode(['ok' => false, 'error' => 'The message could not be sent. Please email info@sazvar.com directly.']);
}
