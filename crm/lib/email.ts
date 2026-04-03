import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

export async function sendOutreachEmail({
  to,
  subject,
  body,
  fromName = "Caroline Finance",
}: {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
}) {
  await getTransporter().sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: `<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #1a1a2e;">${body.replace(/\n/g, "<br>")}<hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" /><p style="color: #999; font-size: 12px;">Caroline Finance — Fiscalité &amp; Comptabilité Luxembourg</p></div>`,
    text: body,
  });
}

export async function sendMagicLinkEmail(
  to: string,
  token: string,
  name: string
) {
  const url = `${process.env.APP_URL}/api/auth/verify?token=${token}`;

  await getTransporter().sendMail({
    from: `"Caroline Finance" <${process.env.SMTP_USER}>`,
    to,
    subject: "Votre lien de connexion — Caroline Finance",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1a1a2e;">Bonjour ${name},</h2>
        <p>Cliquez sur le bouton ci-dessous pour accéder à votre espace :</p>
        <a href="${url}"
           style="display: inline-block; background: #1a1a2e; color: #fff; padding: 12px 32px;
                  border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          Se connecter
        </a>
        <p style="color: #666; font-size: 14px;">
          Ce lien expire dans 15 minutes.<br>
          Si vous n'avez pas demandé cette connexion, ignorez cet email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">Caroline Finance — Fiscalité & Comptabilité Luxembourg</p>
      </div>
    `,
  });
}
