import { getSmtpConfig, getImapConfig, getSetting } from "@/lib/settings";
import { EmailSettingsForm } from "./email-settings-form";

export default async function EmailSettingsPage() {
  const [smtp, imap] = await Promise.all([getSmtpConfig(), getImapConfig()]);
  const smtpPassDb = await getSetting("SMTP_PASS");
  const imapPassDb = await getSetting("IMAP_PASS");

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres — Email</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configuration SMTP (envoi) et IMAP (réception/sync) pour contact@caroline-finance.com.
        </p>
      </div>

      <EmailSettingsForm
        smtpHost={smtp.host}
        smtpPort={smtp.port}
        smtpUser={smtp.user}
        imapHost={imap.host}
        imapPort={imap.port}
        hasSmtpPass={!!smtpPassDb}
        hasImapPass={!!imapPassDb}
      />
    </div>
  );
}
