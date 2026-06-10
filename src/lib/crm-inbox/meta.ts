import crypto from 'crypto';

const CONFIG = {
  get pageId() { return process.env.FACEBOOK_PAGE_ID || ''; },
  get accessToken() { return process.env.FACEBOOK_ACCESS_TOKEN || ''; },
  get instagramId() { return process.env.INSTAGRAM_BUSINESS_ID || ''; },
  get verifyToken() { return process.env.META_VERIFY_TOKEN || ''; },
  get appSecret() { return process.env.META_APP_SECRET || ''; },
  get isConfigured() {
    return !!(this.pageId && this.accessToken && this.verifyToken);
  },
  get messengerConfigured() {
    return !!(this.pageId && this.accessToken);
  },
  get instagramConfigured() {
    return !!(this.instagramId && this.accessToken);
  },
};

export type MetaChannel = 'FACEBOOK' | 'INSTAGRAM' | null;

export function verifyWebhook(mode: string | null, token: string | null, challenge: string | null): { verified: boolean; challenge: string | null } {
  if (mode === 'subscribe' && token === CONFIG.verifyToken && challenge) {
    return { verified: true, challenge };
  }
  return { verified: false, challenge: null };
}

export function validateWebhookSignature(signature: string | null, rawBody: string): boolean {
  if (!CONFIG.appSecret || !signature) return false;
  const expected = crypto.createHmac('sha256', CONFIG.appSecret).update(rawBody).digest('hex');
  return signature === `sha256=${expected}` || signature === expected;
}

export type MetaWebhookEntry = {
  senderId: string;
  senderName: string;
  message: string;
  messageId: string;
  timestamp: string;
  channel: MetaChannel;
};

export function parseWebhookEntry(body: unknown): MetaWebhookEntry[] {
  const entries: MetaWebhookEntry[] = [];
  try {
    const data = body as Record<string, unknown>;
    const rawEntries = (data?.entry as Array<Record<string, unknown>>) || [];
    for (const entry of rawEntries) {
      const changes = (entry?.messaging as Array<Record<string, unknown>>) || [];
      for (const change of changes) {
        const sender = change?.sender as Record<string, string> | undefined;
        const message = change?.message as Record<string, unknown> | undefined;
        if (!sender?.id || !message) continue;
        entries.push({
          senderId: sender.id,
          senderName: (change?.recipient as Record<string, string> | undefined)?.name || sender.id,
          message: (message?.text as string) || '',
          messageId: (message?.mid as string) || '',
          timestamp: (change?.timestamp as string) || new Date().toISOString(),
          channel: null, // determined by which webhook was called
        });
      }
    }
  } catch { /* ignore malformed */ }
  return entries;
}

export async function sendFacebookMessage(recipientId: string, text: string): Promise<boolean> {
  if (!CONFIG.messengerConfigured) return false;
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${CONFIG.accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: { id: recipientId }, message: { text } }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendInstagramMessage(recipientId: string, text: string): Promise<boolean> {
  if (!CONFIG.instagramConfigured) return false;
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${CONFIG.instagramId}/messages?access_token=${CONFIG.accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: { id: recipientId }, message: { text } }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
