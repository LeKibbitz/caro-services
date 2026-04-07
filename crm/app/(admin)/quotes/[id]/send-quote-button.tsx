"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ReplyForm } from "../../inbox/reply-form";

export function SendQuoteButton({
  quoteNumber,
  contactEmail,
  contactPhone,
  total,
  items,
}: {
  quoteNumber: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  total: number;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
}) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<"email" | "whatsapp">(contactEmail ? "email" : "whatsapp");

  const subject = `Devis ${quoteNumber} — Caroline Finance`;
  const body = [
    `Bonjour,`,
    ``,
    `Veuillez trouver ci-joint votre devis ${quoteNumber}.`,
    ``,
    `Détail :`,
    ...items.map((i) => `  - ${i.description} × ${i.quantity} : ${i.total.toFixed(2)} €`),
    ``,
    `Total TTC : ${total.toFixed(2)} €`,
    ``,
    `N'hésitez pas à me contacter pour toute question.`,
    ``,
    `Bien cordialement,`,
    `Caroline Charpentier`,
  ].join("\n");

  if (!contactEmail && !contactPhone) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Send className="h-4 w-4 mr-2" />
        Envoyer
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-lg mb-4">
            <ReplyForm
              defaultChannel={channel}
              defaultTo={channel === "email" ? (contactEmail ?? "") : (contactPhone ?? "")}
              defaultSubject={subject}
              defaultMessage={body}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
