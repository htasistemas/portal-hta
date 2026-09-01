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
if (!is_array($payload)) {
    json_response(['error' => 'Dados invalidos.'], 400);
}

$requiredFields = [
    'Nome completo',
    'E-mail corporativo',
    'Empresa',
    'Cargo',
    'WhatsApp',
    'Segmento de atuação',
    'Solução de interesse',
];

$fieldLabels = [
    'Nome completo',
    'E-mail corporativo',
    'Empresa',
    'Cargo',
    'Telefone fixo',
    'WhatsApp',
    'Segmento de atuação',
    'Solução de interesse',
    'Quantidade de usuários',
    'Melhor horário para contato',
    'Mensagem',
];

$data = [];
foreach ($fieldLabels as $field) {
    $value = $payload[$field] ?? '';
    $data[$field] = is_string($value) ? limit_text(trim($value), 2000) : '';
}

foreach ($requiredFields as $field) {
    if ($data[$field] === '') {
        json_response(['error' => 'Preencha todos os campos obrigatorios.'], 400);
    }
}

if (!filter_var($data['E-mail corporativo'], FILTER_VALIDATE_EMAIL)) {
    json_response(['error' => 'E-mail invalido.'], 400);
}

$config = load_contact_config();
$apiKey = config_value($config, 'RESEND_API_KEY');
if ($apiKey === '') {
    json_response(['error' => 'Servidor de e-mail nao configurado.'], 500);
}

$to = config_value($config, 'CONTACT_TO_EMAIL') ?: 'comercial@torresoftbrasil.com.br';
$from = config_value($config, 'CONTACT_FROM_EMAIL') ?: 'TorreSoft Sistemas <comercial@torresoftbrasil.com.br>';
$subject = 'Solicitacao pelo site - ' . $data['Empresa'];

$body = json_encode([
    'from' => $from,
    'to' => $to,
    'reply_to' => $data['E-mail corporativo'],
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

function json_response(array $body, int $status = 200, array $headers = []): void
{
    http_response_code($status);
    foreach ($headers as $header) {
        header($header);
    }

    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}
