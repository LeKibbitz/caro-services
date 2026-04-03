import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare } from "lucide-react";
import { SyncButton } from "./sync-button";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const { channel } = await searchParams;
  const db = getDb();

  const where: Record<string, unknown> = {};
  if (channel && channel !== "all") {
    where.channel = channel;
  }

  const messages = await db.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { contact: true },
    take: 50,
  });

  const unreadCount = await db.message.count({ where: { read: false } });
  const emailCount = await db.message.count({ where: { channel: "email" } });
  const waCount = await db.message.count({ where: { channel: "whatsapp" } });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-3 text-xs">
                {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Messages WhatsApp et emails unifiés.
          </p>
        </div>
        <SyncButton />
      </div>

      <div className="flex gap-2">
        {[
          { value: "all", href: "/inbox", label: `Tous (${emailCount + waCount})`, icon: null },
          { value: "email", href: "/inbox?channel=email", label: `Emails (${emailCount})`, icon: <Mail className="h-3.5 w-3.5 mr-1" /> },
          { value: "whatsapp", href: "/inbox?channel=whatsapp", label: `WhatsApp (${waCount})`, icon: <MessageSquare className="h-3.5 w-3.5 mr-1" /> },
        ].map((tab) => (
          <a
            key={tab.value}
            href={tab.href}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              (channel || "all") === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {tab.icon}
            {tab.label}
          </a>
        ))}
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              Aucun message. La synchronisation email et WhatsApp sera configurée
              lors du déploiement.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`hover:bg-muted/30 transition-colors ${!msg.read ? "border-l-2 border-l-primary" : ""}`}
            >
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {msg.channel === "email" ? (
                          <><Mail className="h-3 w-3 mr-1" />Email</>
                        ) : (
                          <><MessageSquare className="h-3 w-3 mr-1" />WA</>
                        )}
                      </Badge>
                      {msg.contact ? (
                        <span className="font-medium text-sm">
                          {msg.contact.firstName} {msg.contact.lastName}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {msg.fromAddr ?? "Inconnu"}
                        </span>
                      )}
                      <Badge variant={msg.direction === "in" ? "secondary" : "outline"} className="text-xs">
                        {msg.direction === "in" ? "Reçu" : "Envoyé"}
                      </Badge>
                      {!msg.read && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    {msg.subject && (
                      <div className="text-sm font-medium mb-0.5">
                        {msg.subject}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {msg.body}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(msg.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
