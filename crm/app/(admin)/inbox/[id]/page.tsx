import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import { markMessageRead } from "../actions";
import { InboxActions } from "../inbox-actions";

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const msg = await db.message.findUnique({
    where: { id },
    include: { contact: true },
  });

  if (!msg) notFound();

  // Mark as read
  if (!msg.read) {
    await markMessageRead(id);
  }

  const sender = msg.contact
    ? `${msg.contact.firstName} ${msg.contact.lastName}`
    : msg.direction === "in"
      ? (msg.fromAddr ?? "Inconnu")
      : (msg.toAddr ?? "");

  const replyTo = msg.direction === "in"
    ? (msg.fromAddr ?? undefined)
    : (msg.toAddr ?? undefined);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/inbox">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {msg.channel === "email" ? (
              <><Mail className="h-3 w-3 mr-1" />Email</>
            ) : (
              <><MessageSquare className="h-3 w-3 mr-1" />WhatsApp</>
            )}
          </Badge>
          <Badge variant={msg.direction === "in" ? "secondary" : "outline"} className="text-xs">
            {msg.direction === "in" ? "Reçu" : "Envoyé"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              {msg.subject && (
                <CardTitle className="text-base mb-1">{msg.subject}</CardTitle>
              )}
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{sender}</span>
                {" · "}
                {new Date(msg.createdAt).toLocaleString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {msg.direction === "in" && (
              <InboxActions
                replyTo={replyTo}
                replyChannel={msg.channel as "whatsapp" | "email"}
                originalSubject={msg.subject ?? undefined}
                originalBody={msg.body}
                compact
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {msg.body}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
