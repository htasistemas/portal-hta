const REQUIRED_FIELDS = [
  'nome_completo',
  'email_corporativo',
  'Empresa',
  'Cargo',
  'WhatsApp',
  'segmento_atuacao',
  'solucao_interesse'
];

const FIELD_LABELS = [
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

    return withSecurityHeaders(await env.ASSETS.fetch(request));
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

  if (!EMAIL_RE.test(data.email_corporativo)) {
    return jsonResponse({ error: 'E-mail inválido.' }, 400);
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse({ error: 'Servidor de e-mail não configurado.' }, 500);
  }

  const to = env.CONTACT_TO_EMAIL || 'g3n.terceirosetor@gmail.com';
  const from = env.CONTACT_FROM_EMAIL || 'TorreSoft Sistemas <comercial@torresoftbrasil.com.br>';
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
      reply_to: data.email_corporativo,
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
    .map((field) => `${displayFieldLabel(field)}: ${data[field] || '-'}`)
    .join('\n');
}

function buildHtmlMessage(data) {
  const rows = FIELD_LABELS.map((field) => {
    return `<tr><th align="left" valign="top" style="width:38%;padding:13px 16px;border-bottom:1px solid #e5e7eb;color:#475569;font-size:13px;">${escapeHtml(displayFieldLabel(field))}</th><td style="padding:13px 16px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-size:14px;">${escapeHtml(data[field] || '-')}</td></tr>`;
  }).join('');

  return `<div style="margin:0;background:#f1f5f9;padding:28px 14px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;"><div style="max-width:680px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;"><div style="padding:26px 28px;background:linear-gradient(135deg,#082567,#08c8df);color:#fff;"><div style="font-size:12px;letter-spacing:1.4px;text-transform:uppercase;opacity:.82;">TorreSoft Sistemas</div><h2 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#fff;">Nova solicitação pelo site</h2><p style="margin:8px 0 0;font-size:14px;color:#e0f7fa;">Uma nova oportunidade foi recebida pelo formulário de contato.</p></div><div style="padding:22px 18px 8px;"><table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${rows}</table></div><div style="padding:16px 28px 22px;color:#64748b;font-size:12px;border-top:1px solid #f1f5f9;">Mensagem enviada automaticamente pelo portal TorreSoft.</div></div></div>`;
}

function displayFieldLabel(field) {
  const labels = {
    motivo_contato: 'Motivo do contato',
    nome_completo: 'Nome completo',
    email_corporativo: 'E-mail corporativo',
    telefone_fixo: 'Telefone fixo',
    segmento_atuacao: 'Segmento de atuação',
    solucao_interesse: 'Solução de interesse',
    quantidade_usuarios: 'Quantidade de usuários',
    melhor_horario: 'Melhor horário para contato',
    WhatsApp: 'WhatsApp',
    Empresa: 'Empresa',
    Cargo: 'Cargo',
    Mensagem: 'Mensagem'
  };
  return labels[field] || field;
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
  return withSecurityHeaders(new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  }));
}

function withSecurityHeaders(response) {
  const secured = new Response(response.body, response);
  secured.headers.set('X-Content-Type-Options', 'nosniff');
  secured.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  secured.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  secured.headers.set('X-Frame-Options', 'SAMEORIGIN');
  return secured;
}
