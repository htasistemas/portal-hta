<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
header('X-Frame-Options: SAMEORIGIN');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Metodo nao permitido.'], 405, ['Allow: POST']);
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 20000) {
    json_response(['error' => 'Mensagem muito grande.'], 413);
}

$rawBody = file_get_contents('php://input') ?: '';
$payload = json_decode($rawBody, true);

if (!is_array($payload) && !empty($_POST)) {
    $payload = $_POST;
}

if (!is_array($payload) && $rawBody !== '') {
    $formPayload = [];
    parse_str($rawBody, $formPayload);
    if (!empty($formPayload)) {
        $payload = $formPayload;
    }
}

if (!is_array($payload)) {
    json_response(['error' => 'Dados invalidos.'], 400);
}

$requiredFields = [
    'nome_completo',
    'email_corporativo',
    'Empresa',
    'Cargo',
    'WhatsApp',
    'segmento_atuacao',
    'solucao_interesse',
];

$fieldLabels = [
    'motivo_contato',
    'nome_completo',
    'email_corporativo',
    'Empresa',
    'Cargo',
    'telefone_fixo',
    'WhatsApp',
    'segmento_atuacao',
    'solucao_interesse',
    'quantidade_usuarios',
    'melhor_horario',
    'Mensagem',
];

$data = [];
foreach ($fieldLabels as $field) {
    $value = $payload[$field] ?? '';
    $data[$field] = is_string($value) ? limit_text(trim($value), 2000) : '';
}

if (!filter_var($data['email_corporativo'], FILTER_VALIDATE_EMAIL)) {
    json_response(['error' => 'E-mail invalido.'], 400);
}

$config = load_contact_config();
$apiKey = config_value($config, 'RESEND_API_KEY');

$to = config_value($config, 'CONTACT_TO_EMAIL') ?: 'g3n.terceirosetor@gmail.com';
$from = config_value($config, 'CONTACT_FROM_EMAIL') ?: 'TorreSoft Sistemas <comercial@torresoftbrasil.com.br>';
$subject = 'Solicitacao pelo site - ' . $data['Empresa'];
$smtpEnabled = strtolower(config_value($config, 'APP_EMAIL_HABILITADO')) === 'true';
$smtpHost = config_value($config, 'MAIL_HOST') ?: 'smtp.gmail.com';
$smtpPort = (int) (config_value($config, 'MAIL_PORT') ?: 587);
$smtpUser = config_value($config, 'MAIL_USER');
$smtpPass = config_value($config, 'MAIL_PASS');
$smtpSender = config_value($config, 'APP_EMAIL_REMETENTE') ?: $smtpUser;
$smtpName = config_value($config, 'APP_EMAIL_NOME') ?: 'TorreSoft Sistemas';

if ($smtpEnabled && $smtpUser !== '' && $smtpPass !== '') {
    $smtpFrom = $smtpName . ' <' . $smtpSender . '>';
    if (!send_smtp_email($smtpHost, $smtpPort, $smtpUser, $smtpPass, $smtpSender, $data['email_corporativo'], $to, $subject, build_text_message($data, $fieldLabels), build_html_message($data, $fieldLabels))) {
        error_log('Falha ao enviar e-mail de contato via SMTP.');
        json_response(['error' => 'Falha ao enviar e-mail.'], 502);
    }

    json_response(['ok' => true]);
}

if ($smtpEnabled && ($smtpUser === '' || $smtpPass === '')) {
    error_log('SMTP habilitado, mas MAIL_USER ou MAIL_PASS nao foi carregado.');
    json_response(['error' => 'Configuracao SMTP incompleta.'], 500);
}

if ($apiKey === '') {
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . $from,
        'Reply-To: ' . $data['email_corporativo'],
    ];

    if (!mail($to, $subject, build_html_message($data, $fieldLabels), implode("\r\n", $headers))) {
        error_log('Falha ao enviar e-mail de contato pelo mail() nativo.');
        json_response(['error' => 'Servidor de e-mail nao configurado.'], 500);
    }

    json_response(['ok' => true]);
}

$body = json_encode([
    'from' => $from,
    'to' => $to,
    'reply_to' => $data['email_corporativo'],
    'subject' => $subject,
    'text' => build_text_message($data, $fieldLabels),
    'html' => build_html_message($data, $fieldLabels),
], JSON_UNESCAPED_UNICODE);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
]);

$responseBody = curl_exec($ch);
$statusCode = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($responseBody === false || $statusCode < 200 || $statusCode >= 300) {
    error_log('Falha ao enviar e-mail de contato: ' . ($curlError ?: (string) $responseBody));
    json_response(['error' => 'Falha ao enviar e-mail.'], 502);
}

json_response(['ok' => true]);

function load_contact_config(): array
{
    $configPath = __DIR__ . '/contact.config.php';
    if (is_file($configPath)) {
        $config = require $configPath;
        return is_array($config) ? $config : [];
    }

    return [];
}

function config_value(array $config, string $key): string
{
    $value = $config[$key] ?? getenv($key);
    return is_string($value) ? trim($value) : '';
}

function limit_text(string $value, int $length): string
{
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $length, 'UTF-8');
    }

    return substr($value, 0, $length);
}

function build_text_message(array $data, array $fieldLabels): string
{
    $lines = [];
    foreach ($fieldLabels as $field) {
        $lines[] = $field . ': ' . ($data[$field] ?: '-');
    }
    return implode("\n", $lines);
}

function build_html_message(array $data, array $fieldLabels): string
{
    $rows = '';
    foreach ($fieldLabels as $field) {
        $rows .= '<tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e7eb;">'
            . htmlspecialchars($field, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . '</th><td style="padding:8px;border-bottom:1px solid #e5e7eb;">'
            . htmlspecialchars($data[$field] ?: '-', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . '</td></tr>';
    }

    return '<h2>Nova solicitacao pelo site TorreSoft Sistemas</h2><table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">'
        . $rows
        . '</table>';
}

function send_smtp_email(string $host, int $port, string $username, string $password, string $sender, string $replyTo, string $recipient, string $subject, string $text, string $html): bool
{
    $socket = @stream_socket_client('tcp://' . $host . ':' . $port, $errorCode, $errorMessage, 15, STREAM_CLIENT_CONNECT);
    if (!is_resource($socket)) {
        error_log('SMTP connection failed: ' . $errorMessage);
        return false;
    }

    stream_set_timeout($socket, 15);
    try {
        if (!smtp_expect($socket, 220)) {
            return false;
        }
        if (!smtp_command($socket, 'EHLO torresoftbrasil.com.br', 250)) {
            return false;
        }
        if (!smtp_command($socket, 'STARTTLS', 220)) {
            return false;
        }
        if (!@stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            return false;
        }
        if (!smtp_command($socket, 'EHLO torresoftbrasil.com.br', 250)) {
            return false;
        }
        if (!smtp_command($socket, 'AUTH LOGIN', 334)) {
            return false;
        }
        if (!smtp_command($socket, base64_encode($username), 334)) {
            return false;
        }
        if (!smtp_command($socket, base64_encode($password), 235)) {
            return false;
        }
        if (!smtp_command($socket, 'MAIL FROM:<' . $sender . '>', 250)) {
            return false;
        }
        if (!smtp_command($socket, 'RCPT TO:<' . $recipient . '>', 250)) {
            return false;
        }
        if (!smtp_command($socket, 'DATA', 354)) {
            return false;
        }

        $boundary = '=_contact_' . bin2hex(random_bytes(8));
        $message = 'From: ' . $sender . "\r\n"
            . 'To: ' . $recipient . "\r\n"
            . 'Reply-To: ' . $replyTo . "\r\n"
            . 'Subject: ' . mb_encode_mimeheader($subject, 'UTF-8') . "\r\n"
            . 'MIME-Version: 1.0' . "\r\n"
            . 'Content-Type: multipart/alternative; boundary="' . $boundary . '"' . "\r\n\r\n"
            . '--' . $boundary . "\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n"
            . $text . "\r\n\r\n--" . $boundary . "\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n"
            . $html . "\r\n\r\n--" . $boundary . "--\r\n";

        $message = preg_replace('/(^|\r\n)\./', '$1..', $message) ?: $message;
        fwrite($socket, $message . "\r\n.\r\n");
        if (!smtp_expect($socket, 250)) {
            return false;
        }
        fwrite($socket, "QUIT\r\n");
        return true;
    } finally {
        fclose($socket);
    }
}

function smtp_command($socket, string $command, int $expectedCode): bool
{
    fwrite($socket, $command . "\r\n");
    return smtp_expect($socket, $expectedCode);
}

function smtp_expect($socket, int $expectedCode): bool
{
    $response = '';
    while (($line = fgets($socket, 2048)) !== false) {
        $response .= $line;
        if (strlen($line) < 4 || $line[3] === ' ') {
            break;
        }
    }

    return str_starts_with($response, (string) $expectedCode);
}

function json_response(array $body, int $status = 200, array $headers = []): void
{
    http_response_code($status);
    foreach ($headers as $header) {
        header($header);
    }

    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}
