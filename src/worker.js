const REQUIRED_FIELDS = [
  'Nome completo',
  'E-mail corporativo',
  'Empresa',
  'Cargo',
  'WhatsApp',
  'Segmento de atuação'
];

const FIELD_LABELS = [
  'Nome completo',
  'E-mail corporativo',
  'Empresa',
  'Cargo',
  'Telefone fixo',
  'WhatsApp',
  'Segmento de atuação',
  'Mensagem'
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method === 'POST') {
        return handleContact(request, env);
      }

      return jsonResponse({ error: 'Método não permitido.' }, 405, {
        Allow: 'POST'
      });
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleContact(request, env) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 20000) {
    return jsonResponse({ error: 'Mensagem muito grande.' }, 413);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse({ error: 'Dados inválidos.' }, 400);
  }

  const data = normalizePayload(payload);
  const missingFields = REQUIRED_FIELDS.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    return jsonResponse({ error: 'Preencha todos os campos obrigatórios.' }, 400);
  }

  if (!EMAIL_RE.test(data['E-mail corporativo'])) {
    return jsonResponse({ error: 'E-mail inválido.' }, 400);
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse({ error: 'Servidor de e-mail não configurado.' }, 500);
  }

  const to = env.CONTACT_TO_EMAIL || 'htasistemas@gmail.com';
  const from = env.CONTACT_FROM_EMAIL || 'HTA Sistemas <comercial@htasistemas.com.br>';
  const subject = `Solicitação pelo site - ${data.Empresa}`;
  const text = buildTextMessage(data);
  const html = buildHtmlMessage(data);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: data['E-mail corporativo'],
      subject,
      text,
      html
    })
  });

  if (!response.ok) {
    const details = await response.text();
    console.error('Falha ao enviar e-mail de contato:', details);
    return jsonResponse({ error: 'Falha ao enviar e-mail.' }, 502);
  }

  return jsonResponse({ ok: true });
}

function normalizePayload(payload) {
  return FIELD_LABELS.reduce((data, field) => {
    const value = payload[field];
    data[field] = typeof value === 'string' ? value.trim().slice(0, 2000) : '';
    return data;
  }, {});
}

function buildTextMessage(data) {
  return FIELD_LABELS
    .map((field) => `${field}: ${data[field] || '-'}`)
    .join('\n');
}

function buildHtmlMessage(data) {
  const rows = FIELD_LABELS.map((field) => {
    return `<tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(field)}</th><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(data[field] || '-')}</td></tr>`;
  }).join('');

  return `<h2>Nova solicitação pelo site HTA Sistemas</h2><table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">${rows}</table>`;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}
