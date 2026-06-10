type SendOpenWaMessageInput = {
  phone: string;
  message: string;
  prospectId: string;
  mediaUrl?: string;
};

type OpenWaResponse = {
  ok: boolean;
  simulated: boolean;
  provider: string;
  prospectId: string;
  phone: string;
  mediaUrl: string;
  message: string;
  response?: Record<string, unknown>;
};

export function normalizePeruPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('51') && digits.length >= 11) return digits;
  if (digits.startsWith('51')) return digits;
  if (digits.length === 9) return `51${digits}`;
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
      message: 'OpenWA no configurado. Las variables OPENWA_API_URL y OPENWA_API_KEY no están definidas.',
      isConnected: false,
    };
  }

  const { apiUrl } = getOpenWaConfig();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/health`, {
      method: 'GET',
      headers: openWaHeaders(),
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        ok: false,
        status: 'error' as const,
        mode: 'configured' as const,
        isConnected: false,
        message: `OpenWA respondió con estado ${response.status}. Verifica que el servicio esté corriendo.`,
      };
    }

    return {
      ok: true,
      status: 'connected' as const,
      mode: 'configured' as const,
      isConnected: true,
      message: 'OpenWA conectado correctamente.',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.name === 'AbortError'
          ? 'OpenWA no respondió en 10 segundos. Timeout.'
          : `Error de conexión: ${error.message}`
        : 'No se pudo conectar con OpenWA.';

    return {
      ok: false,
      status: 'error' as const,
      mode: 'configured' as const,
      isConnected: false,
      message: errorMessage,
    };
  }
}

export async function sendOpenWaMessage({
  phone,
  message,
  prospectId,
  mediaUrl,
}: SendOpenWaMessageInput): Promise<OpenWaResponse> {
  const normalizedPhone = normalizePeruPhone(phone);

  if (!normalizedPhone) {
    return {
      ok: false,
      simulated: false,
      provider: 'openwa',
      prospectId,
      phone: '',
      mediaUrl: mediaUrl || '',
      message: 'Teléfono inválido después de normalización.',
    };
  }

  if (!isOpenWaConfigured()) {
    return {
      ok: true,
      simulated: true,
      provider: 'openwa',
      prospectId,
      phone: normalizedPhone,
      mediaUrl: mediaUrl || '',
      message: 'OpenWA no configurado. Mensaje simulado, no se envió real.',
    };
  }

  const { apiUrl } = getOpenWaConfig();
  const endpoint = mediaUrl ? 'sendImage' : 'sendText';
  const args = mediaUrl
    ? {
        to: `${normalizedPhone}@c.us`,
        file: mediaUrl,
        filename: mediaUrl.split('/').pop() || 'factusys-demo.jpg',
        caption: message,
      }
    : {
        to: `${normalizedPhone}@c.us`,
        content: message,
      };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/${endpoint}`, {
      method: 'POST',
      headers: openWaHeaders(),
      body: JSON.stringify({ args, prospectId }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        ok: false,
        simulated: false,
        provider: 'openwa',
        prospectId,
        phone: normalizedPhone,
        mediaUrl: mediaUrl || '',
        message: `OpenWA respondió con estado ${response.status} ${response.statusText}.`,
      };
    }

    const responseData = await response.json().catch(() => ({}));

    return {
      ok: true,
      simulated: false,
      provider: 'openwa',
      prospectId,
      phone: normalizedPhone,
      mediaUrl: mediaUrl || '',
      response: responseData,
      message: 'Mensaje enviado correctamente por OpenWA.',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.name === 'AbortError'
          ? 'OpenWA no respondió en 30 segundos. Timeout.'
          : `Error al enviar: ${error.message}`
        : 'Error desconocido al enviar mensaje OpenWA.';

    return {
      ok: false,
      simulated: false,
      provider: 'openwa',
      prospectId,
      phone: normalizedPhone,
      mediaUrl: mediaUrl || '',
      message: errorMessage,
    };
  }
}
