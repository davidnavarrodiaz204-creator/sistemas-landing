export function requireInternalToken(request: Request): { ok: boolean; message?: string } {
  const token = process.env.CRM_INTERNAL_TOKEN;
  if (!token) return { ok: true };
  const provided = request.headers.get('x-internal-token');
  if (!provided || provided !== token) {
    return { ok: false, message: 'Token interno requerido. Configura CRM_INTERNAL_TOKEN o incluye x-internal-token header.' };
  }
  return { ok: true };
}
