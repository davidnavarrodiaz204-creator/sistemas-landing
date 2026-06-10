const CONFIG = {
  get baseUrl() {
    return process.env.OPENWA_API_URL || '';
  },
  get apiKey() {
    return process.env.OPENWA_API_KEY || '';
  },
  get isConfigured() {
    return !!(this.baseUrl && this.apiKey);
  },
};

export type OpenWaStatus = {
  connected: boolean;
  mode: 'connected' | 'simulation' | 'not_configured' | 'error';
  message: string;
};

export async function checkConnection(): Promise<OpenWaStatus> {
  if (!CONFIG.isConfigured) {
    return { connected: false, mode: 'not_configured', message: 'OPENWA_API_URL y OPENWA_API_KEY no configurados. Modo manual.' };
  }
  try {
    const res = await fetch(`${CONFIG.baseUrl}/health`, {
      headers: { Authorization: `Bearer ${CONFIG.apiKey}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { connected: false, mode: 'error', message: `OpenWA respondió con status ${res.status}` };
    const data = await res.json();
    return { connected: true, mode: 'connected', message: data.message || 'OpenWA conectado.' };
  } catch {
    return { connected: false, mode: 'error', message: 'No se pudo conectar con OpenWA.' };
  }
}

export async function sendMessage(phone: string, message: string): Promise<{ ok: boolean; message: string }> {
  if (!CONFIG.isConfigured) {
    return { ok: false, message: 'OpenWA no configurado.' };
  }
  try {
    const res = await fetch(`${CONFIG.baseUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CONFIG.apiKey}`,
      },
      body: JSON.stringify({ phone, message }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return { ok: res.ok, message: data.message || 'Enviado.' };
  } catch {
    return { ok: false, message: 'Error al enviar por OpenWA.' };
  }
}

export async function fetchIncomingMessages(since?: string): Promise<Array<{ from: string; body: string; timestamp: string; messageId: string }>> {
  if (!CONFIG.isConfigured) return [];
  try {
    const params = since ? `?since=${encodeURIComponent(since)}` : '';
    const res = await fetch(`${CONFIG.baseUrl}/messages${params}`, {
      headers: { Authorization: `Bearer ${CONFIG.apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  } catch {
    return [];
  }
}
