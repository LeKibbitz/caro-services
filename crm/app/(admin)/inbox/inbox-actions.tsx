"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PenSquare, Reply } from "lucide-react";
import { ReplyForm } from "./reply-form";

type Props = {
  replyTo?: string;
  replyChannel?: "whatsapp" | "email";
  originalSubject?: string;
  originalBody?: string;
  compact?: boolean;
  compactLabel?: string;
};

export function InboxActions({ replyTo, replyChannel = "whatsapp", originalSubject, originalBody, compact = false, compactLabel = "Répondre" }: Props) {
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(true)}
        >
          <Reply className="h-3.5 w-3.5 mr-1" />
          {compactLabel}
        </Button>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <div className="w-full max-w-lg mb-4">
              <ReplyForm
                defaultTo={replyTo}
                defaultChannel={replyChannel}
                originalSubject={originalSubject}
                originalBody={originalBody}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <PenSquare className="h-3.5 w-3.5 mr-1.5" />
        Composer
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-lg mb-4">
            <ReplyForm onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
