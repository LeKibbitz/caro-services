import { ContactForm } from "@/components/contact-form";

export default function NewContactPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau contact</h1>
        <p className="text-muted-foreground mt-1">
          Ajoutez un nouveau client ou prospect.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
