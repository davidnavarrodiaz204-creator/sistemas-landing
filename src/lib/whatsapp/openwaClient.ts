type SendOpenWaMessageInput = {
  phone: string;
  message: string;
  prospectId: string;
};

export function normalizePeruPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('51')) return digits;
  return `51${digits}`;
}

function getOpenWaConfig() {
  return {
    apiUrl: process.env.OPENWA_API_URL || 'http://localhost:2785/api',
    apiKey: process.env.OPENWA_API_KEY || '',
  };
}

export function isOpenWaConfigured() {
  const { apiUrl, apiKey } = getOpenWaConfig();
  return Boolean(apiUrl && apiKey);
}

function openWaHeaders() {
  const { apiKey } = getOpenWaConfig();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'x-api-key': apiKey,
  };
}

export async function checkOpenWaHealth() {
  if (!isOpenWaConfigured()) {
    return {
      ok: false,
      status: 'not_configured' as const,
      mode: 'simulation' as const,
      message: 'OpenWA no configurado. El CRM esta en modo simulacion.',
    };
  }

  const { apiUrl } = getOpenWaConfig();

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/health`, {
      method: 'GET',
      headers: openWaHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        ok: false,
        status: 'error' as const,
        mode: 'configured' as const,
        message: `OpenWA respondio con estado ${response.status}.`,
      };
    }

    return {
      ok: true,
      status: 'connected' as const,
      mode: 'configured' as const,
      message: 'OpenWA conectado.',
    };
  } catch {
    return {
      ok: false,
      status: 'error' as const,
      mode: 'configured' as const,
      message: 'No se pudo conectar con OpenWA.',
    };
  }
}

export async function sendOpenWaMessage({ phone, message, prospectId }: SendOpenWaMessageInput) {
  const normalizedPhone = normalizePeruPhone(phone);

  if (!isOpenWaConfigured()) {
    return {
      ok: true,
      simulated: true,
      provider: 'openwa',
      prospectId,
      phone: normalizedPhone,
      message: 'OpenWA no configurado. Respuesta simulada, no se envio mensaje real.',
    };
  }

  const { apiUrl } = getOpenWaConfig();

  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/sendText`, {
    method: 'POST',
    headers: openWaHeaders(),
    body: JSON.stringify({
      args: {
        to: `${normalizedPhone}@c.us`,
        content: message,
      },
      prospectId,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      simulated: false,
      provider: 'openwa',
      prospectId,
      phone: normalizedPhone,
      message: `OpenWA respondio con estado ${response.status}.`,
    };
  }

  return {
    ok: true,
    simulated: false,
    provider: 'openwa',
    prospectId,
    phone: normalizedPhone,
    response: await response.json().catch(() => ({})),
  };
}
