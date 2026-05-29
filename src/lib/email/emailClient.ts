type SendEmailInput = {
  to: string;
  subject: string;
  message: string;
  prospectId: string;
  campaignId?: string;
  mediaUrl?: string;
};

function getEmailConfig() {
  return {
    from: process.env.EMAIL_FROM || 'factusys.peru@gmail.com',
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT || '',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  };
}

export function isEmailConfigured() {
  const config = getEmailConfig();
  return Boolean(config.provider === 'smtp' && config.host && config.port && config.user && config.pass);
}

export async function sendEmailMessage(input: SendEmailInput) {
  const config = getEmailConfig();

  if (!isEmailConfigured()) {
    return {
      ok: true,
      simulated: true,
      provider: config.provider,
      from: config.from,
      to: input.to,
      prospectId: input.prospectId,
      campaignId: input.campaignId || '',
      message: 'Email no configurado. Respuesta simulada, no se envio correo real.',
    };
  }

  return {
    ok: false,
    simulated: false,
    provider: config.provider,
    from: config.from,
    to: input.to,
    prospectId: input.prospectId,
    campaignId: input.campaignId || '',
    message: 'SMTP configurado, pero el adaptador real debe conectarse en servidor con un proveedor seguro.',
  };
}
