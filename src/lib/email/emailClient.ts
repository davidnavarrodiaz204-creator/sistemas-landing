type SendEmailInput = {
  to: string;
  subject: string;
  message: string;
  prospectId: string;
  campaignId?: string;
  mediaUrl?: string;
  fromName?: string;
  fromEmail?: string;
};

type EmailConfig = {
  from: string;
  provider: string;
  host: string;
  port: string;
  user: string;
  pass: string;
};

type EmailResponse = {
  ok: boolean;
  simulated: boolean;
  provider: string;
  from: string;
  to: string;
  prospectId: string;
  campaignId: string;
  message: string;
  response?: Record<string, unknown>;
};

function getEmailConfig(): EmailConfig {
  return {
    from: process.env.EMAIL_FROM || 'factusys.peru@gmail.com',
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT || '',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  };
}

export function isEmailConfigured(): boolean {
  const config = getEmailConfig();
  return Boolean(
    config.provider === 'smtp' &&
      config.host &&
      config.port &&
      config.user &&
      config.pass,
  );
}

export async function sendEmailMessage(
  input: SendEmailInput,
): Promise<EmailResponse> {
  const config = getEmailConfig();
  const fromEmail = input.fromEmail || config.from;
  const fromName = input.fromName || 'FACTUSYS Perú';

  if (!isEmailConfigured()) {
    return {
      ok: true,
      simulated: true,
      provider: config.provider,
      from: fromEmail,
      to: input.to,
      prospectId: input.prospectId,
      campaignId: input.campaignId || '',
      message:
        'SMTP no configurado. Mensaje simulado, no se envió correo real. Para enviar, configura SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.',
    };
  }

  try {
    const { default: nodemailer } = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: Number(config.port) || 587,
      secure: Number(config.port) === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: input.to,
      subject: input.subject,
      text: input.message,
      ...(input.mediaUrl
        ? {
            attachments: [
              {
                filename: 'demo.jpg',
                url: input.mediaUrl,
              },
            ],
          }
        : {}),
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      ok: true,
      simulated: false,
      provider: config.provider,
      from: fromEmail,
      to: input.to,
      prospectId: input.prospectId,
      campaignId: input.campaignId || '',
      message: `Correo enviado a ${input.to}. ID: ${info.messageId}`,
      response: { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected },
    };
  } catch (error) {
    return {
      ok: false,
      simulated: false,
      provider: config.provider,
      from: fromEmail,
      to: input.to,
      prospectId: input.prospectId,
      campaignId: input.campaignId || '',
      message: `Error al enviar correo: ${error instanceof Error ? error.message : 'error desconocido'}`,
    };
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
