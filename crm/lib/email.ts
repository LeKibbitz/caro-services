import nodemailer from "nodemailer";
import { getSmtpConfig } from "./settings";

async function getTransporter() {
  const cfg = await getSmtpConfig();
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

export async function sendOutreachEmail({
  to,
  subject,
  body,
  fromName = "Caroline Finance",
  cardImageUrl,
}: {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
  cardImageUrl?: string | null;
}) {
  const cfg = await getSmtpConfig();
  const cardBlock = cardImageUrl
    ? `<div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
         <img src="${cardImageUrl}" alt="Carte de visite Caroline Charpentier"
              style="width: 340px; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.10);" />
       </div>`
    : "";

  const t = await getTransporter();
  await t.sendMail({
    from: `"${fromName}" <${cfg.user}>`,
    to,
    subject,
    html: `<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #1a1a2e;">${body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}${cardBlock}<hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" /><p style="color: #999; font-size: 12px;">Caroline Charpentier — Caroline Finance<br>Fiscalité &amp; Comptabilité Luxembourg<br><a href="mailto:caroline@caroline-finance.com" style="color: #999; text-decoration: none;">caroline@caroline-finance.com</a> &nbsp;·&nbsp; <a href="https://wa.me/352661521101" style="color: #25d366; text-decoration: none;">WhatsApp</a> &nbsp;·&nbsp; <a href="https://www.linkedin.com/in/caroline-charpentier-fiscalite-luxembourg" style="color: #0a66c2; text-decoration: none;">LinkedIn</a> &nbsp;·&nbsp; <a href="https://caroline-finance.com" style="color: #999; text-decoration: none;">caroline-finance.com</a></p></div>`,
    text: cardImageUrl ? `${body}\n\nCarte de visite : ${cardImageUrl}` : body,
  });
}

export async function sendMagicLinkEmail(
  to: string,
  token: string,
  name: string
) {
  const cfg = await getSmtpConfig();
  const url = `${process.env.APP_URL}/api/auth/verify?token=${token}`;

  const t = await getTransporter();
  await t.sendMail({
    from: `"Caroline Finance" <${cfg.user}>`,
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
        <p style="color: #999; font-size: 12px;">Caroline Charpentier — Caroline Finance<br>Fiscalité &amp; Comptabilité Luxembourg<br><a href="mailto:caroline@caroline-finance.com" style="color: #999; text-decoration: none;">caroline@caroline-finance.com</a> · <a href="https://wa.me/352661521101" style="color: #25d366; text-decoration: none;">WhatsApp</a> · <a href="https://www.linkedin.com/in/caroline-charpentier-fiscalite-luxembourg" style="color: #0a66c2; text-decoration: none;">LinkedIn</a> · <a href="https://caroline-finance.com" style="color: #999; text-decoration: none;">caroline-finance.com</a></p>
      </div>
    `,
  });
}
