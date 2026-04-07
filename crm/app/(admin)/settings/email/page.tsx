import { getSmtpConfig, getImapConfig, getSettingSource } from "@/lib/settings";
import { EmailSettingsForm } from "./email-settings-form";

export default async function EmailSettingsPage() {
  const [smtp, imap, smtpPassSource, imapPassSource] = await Promise.all([
    getSmtpConfig(),
    getImapConfig(),
    getSettingSource("SMTP_PASS"),
    getSettingSource("IMAP_PASS"),
  ]);

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
        smtpPassSource={smtpPassSource}
        imapPassSource={imapPassSource}
      />
    </div>
  );
}
