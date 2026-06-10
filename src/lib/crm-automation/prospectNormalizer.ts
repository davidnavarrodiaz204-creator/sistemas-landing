export function normalizePeruPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('51') && digits.length >= 11) return digits;
  if (digits.startsWith('51')) return digits;
  if (digits.length === 9) return `51${digits}`;
  return `51${digits}`;
}

export function normalizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase().replace(/\s+/g, '');
}

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-záéíóúñ0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^(restaurant|rest|cevicheria|polleria|ferreteria|minimarket|tienda)\s+/i, '')
    .trim();
}

export function extractFacebookLink(text: string): string {
  if (!text) return '';
  const match = text.match(
    /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.com|m\.facebook\.com)\/[^\s/$.?#][^\s]*/i,
  );
  return match ? match[0].replace(/\/+$/, '') : '';
}

export function extractGoogleMapsLink(text: string): string {
  if (!text) return '';
  const match = text.match(
    /(?:https?:\/\/)?(?:www\.)?(?:maps\.google\.com|goo\.gl\/maps)\/[^\s]*/i,
  );
  return match ? match[0].replace(/\/+$/, '') : '';
}

export function safeExtractLinks(
  text: string,
): { facebook?: string; googleMaps?: string; other: string[] } {
  const urls =
    text.match(
      /https?:\/\/[^\s"'<>(){}|\\^`[\]]+/g,
    ) || [];
  const facebook = extractFacebookLink(text);
  const googleMaps = extractGoogleMapsLink(text);
  const other = urls.filter(
    (u) => !u.includes('facebook') && !u.includes('google') && !u.includes('goo.gl'),
  );
  return { facebook: facebook || undefined, googleMaps: googleMaps || undefined, other };
}

export function formatPeruPhoneForDisplay(phone: string): string {
  const normalized = normalizePeruPhone(phone);
  if (!normalized) return '';
  if (normalized.length === 11) {
    return `+${normalized.slice(0, 2)} ${normalized.slice(2, 6)} ${normalized.slice(6)}`;
  }
  if (normalized.length === 12) {
    return `+${normalized.slice(0, 2)} ${normalized.slice(2, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8)}`;
  }
  return `+${normalized}`;
}
